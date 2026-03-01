"""
Cover views — upload, validation, barcode injection, and variant generation.
FDD §3.5
"""
import logging
import os
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.conf import settings

from titles.models import Title
from formats.models import Format
from .models import Cover
from .serializers import (
    CoverSerializer,
    CoverUploadSerializer,
    CoverValidateSerializer,
    CoverBarcodeSerializer,
    CoverGenerateVariantsSerializer,
)

logger = logging.getLogger('guttenberg')

# Cover validation specs per FDD §3.5.1
COVER_SPECS = {
    'ebook': {
        'min_width': 1600,
        'max_width': 10000,
        'min_height': 2400,
        'max_height': 10000,
        'min_dpi': 72,
        'recommended_dpi': 300,
        'color_modes': ['RGB', 'sRGB'],
        'max_file_size': 50 * 1024 * 1024,  # 50MB
    },
    'paperback': {
        'min_width': 1800,
        'max_width': 14400,
        'min_height': 2700,
        'max_height': 14400,
        'min_dpi': 300,
        'recommended_dpi': 300,
        'color_modes': ['CMYK', 'RGB'],
        'max_file_size': 150 * 1024 * 1024,  # 150MB
    },
    'hardcover': {
        'min_width': 1800,
        'max_width': 14400,
        'min_height': 2700,
        'max_height': 14400,
        'min_dpi': 300,
        'recommended_dpi': 300,
        'color_modes': ['CMYK', 'RGB'],
        'max_file_size': 150 * 1024 * 1024,  # 150MB
    },
    'audiobook': {
        'min_width': 2400,
        'max_width': 3200,
        'min_height': 2400,
        'max_height': 3200,
        'min_dpi': 72,
        'recommended_dpi': 300,
        'color_modes': ['RGB', 'sRGB'],
        'max_file_size': 50 * 1024 * 1024,  # 50MB
    },
    'large_print': {
        'min_width': 1800,
        'max_width': 14400,
        'min_height': 2700,
        'max_height': 14400,
        'min_dpi': 300,
        'recommended_dpi': 300,
        'color_modes': ['CMYK', 'RGB'],
        'max_file_size': 150 * 1024 * 1024,  # 150MB
    },
}

# Cover design template catalog per FDD §3.5
COVER_TEMPLATE_CATALOG = [
    {
        'name': 'Classic',
        'description': 'Traditional book cover layout with centered title and author name. '
                       'Clean borders and elegant typography.',
        'genre_targets': ['literary_fiction', 'memoir', 'biography', 'nonfiction'],
        'supports_formats': ['ebook', 'paperback', 'hardcover'],
    },
    {
        'name': 'Bold',
        'description': 'High-impact design with large title text and dramatic color blocking. '
                       'Ideal for genre fiction.',
        'genre_targets': ['thriller', 'action', 'horror', 'mystery'],
        'supports_formats': ['ebook', 'paperback', 'hardcover'],
    },
    {
        'name': 'Elegant',
        'description': 'Sophisticated layout with decorative elements and refined spacing. '
                       'Perfect for romance and literary fiction.',
        'genre_targets': ['romance', 'womens_fiction', 'literary_fiction'],
        'supports_formats': ['ebook', 'paperback', 'hardcover'],
    },
    {
        'name': 'Modern',
        'description': 'Minimalist design with clean lines and contemporary typography. '
                       'Suited for tech, business, and modern non-fiction.',
        'genre_targets': ['business', 'self_help', 'tech', 'nonfiction'],
        'supports_formats': ['ebook', 'paperback', 'hardcover'],
    },
    {
        'name': 'Whimsical',
        'description': 'Playful design with rounded fonts and vibrant colors. '
                       'Great for children and young adult titles.',
        'genre_targets': ['children', 'young_adult', 'middle_grade'],
        'supports_formats': ['ebook', 'paperback', 'hardcover'],
    },
    {
        'name': 'Epic',
        'description': 'Dramatic full-bleed imagery with overlay text treatment. '
                       'Built for fantasy, sci-fi, and adventure.',
        'genre_targets': ['sci_fi', 'fantasy', 'adventure', 'speculative'],
        'supports_formats': ['ebook', 'paperback', 'hardcover'],
    },
    {
        'name': 'Audio',
        'description': 'Square-format design optimized for audiobook platforms. '
                       'Clear title and author text at small sizes.',
        'genre_targets': ['all'],
        'supports_formats': ['audiobook'],
    },
]


def _extract_image_metadata(uploaded_file):
    """
    Extract image metadata from an uploaded file.

    Returns a dict with width_px, height_px, resolution_dpi, color_mode, file_type.
    Falls back to defaults if PIL/Pillow is not available.
    """
    ext = os.path.splitext(uploaded_file.name)[1].lower().lstrip('.')
    metadata = {
        'file_type': ext,
        'file_size': uploaded_file.size,
        'width_px': 0,
        'height_px': 0,
        'resolution_dpi': 0,
        'color_mode': '',
    }

    try:
        from PIL import Image
        uploaded_file.seek(0)
        img = Image.open(uploaded_file)
        metadata['width_px'] = img.width
        metadata['height_px'] = img.height
        metadata['color_mode'] = img.mode

        # Extract DPI from image info
        dpi_info = img.info.get('dpi', (0, 0))
        if isinstance(dpi_info, tuple) and len(dpi_info) >= 2:
            metadata['resolution_dpi'] = int(dpi_info[0])
        elif isinstance(dpi_info, (int, float)):
            metadata['resolution_dpi'] = int(dpi_info)

        uploaded_file.seek(0)
    except Exception:
        logger.warning('Could not extract image metadata with Pillow; using defaults.')

    return metadata


def _validate_cover_specs(cover, format_type=None):
    """
    Validate cover against specifications per FDD §3.5.1.

    Returns a validation report dict.
    """
    if format_type is None:
        # Default to ebook specs as baseline
        format_type = 'ebook'

    specs = COVER_SPECS.get(format_type, COVER_SPECS['ebook'])
    issues = []
    warnings = []

    # Resolution check
    if cover.resolution_dpi > 0 and cover.resolution_dpi < specs['min_dpi']:
        issues.append({
            'field': 'resolution_dpi',
            'message': f'Resolution {cover.resolution_dpi} DPI is below minimum {specs["min_dpi"]} DPI.',
            'severity': 'error',
        })
    elif cover.resolution_dpi > 0 and cover.resolution_dpi < specs['recommended_dpi']:
        warnings.append({
            'field': 'resolution_dpi',
            'message': f'Resolution {cover.resolution_dpi} DPI is below recommended {specs["recommended_dpi"]} DPI.',
            'severity': 'warning',
        })

    # Dimension checks
    if cover.width_px > 0:
        if cover.width_px < specs['min_width']:
            issues.append({
                'field': 'width_px',
                'message': f'Width {cover.width_px}px is below minimum {specs["min_width"]}px.',
                'severity': 'error',
            })
        if cover.width_px > specs['max_width']:
            issues.append({
                'field': 'width_px',
                'message': f'Width {cover.width_px}px exceeds maximum {specs["max_width"]}px.',
                'severity': 'error',
            })

    if cover.height_px > 0:
        if cover.height_px < specs['min_height']:
            issues.append({
                'field': 'height_px',
                'message': f'Height {cover.height_px}px is below minimum {specs["min_height"]}px.',
                'severity': 'error',
            })
        if cover.height_px > specs['max_height']:
            issues.append({
                'field': 'height_px',
                'message': f'Height {cover.height_px}px exceeds maximum {specs["max_height"]}px.',
                'severity': 'error',
            })

    # Color mode check
    if cover.color_mode and cover.color_mode not in specs['color_modes']:
        warnings.append({
            'field': 'color_mode',
            'message': f'Color mode {cover.color_mode} is not in recommended modes: {specs["color_modes"]}.',
            'severity': 'warning',
        })

    # File size check
    if cover.file_size > specs['max_file_size']:
        issues.append({
            'field': 'file_size',
            'message': f'File size {cover.file_size} bytes exceeds maximum '
                       f'{specs["max_file_size"]} bytes ({specs["max_file_size"] // (1024 * 1024)}MB).',
            'severity': 'error',
        })

    is_valid = len(issues) == 0
    report = {
        'valid': is_valid,
        'format_type': format_type,
        'issues': issues,
        'warnings': warnings,
        'specs_checked': specs,
    }
    return is_valid, report


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload(request):
    """
    Upload a cover image file per FDD §3.5.1.

    Extracts image metadata (resolution, color mode, dimensions)
    and runs initial validation.
    """
    serializer = CoverUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    title_id = serializer.validated_data['title_id']
    format_id = serializer.validated_data.get('format_id')
    uploaded_file = serializer.validated_data['file']

    # Verify ownership of the title
    try:
        title = Title.objects.get(id=title_id, user=request.user)
    except Title.DoesNotExist:
        return Response(
            {'error': {'code': 'GUT-4004', 'message': 'Title not found or access denied.'}},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Verify format ownership if specified
    fmt = None
    if format_id:
        try:
            fmt = Format.objects.get(id=format_id, title=title)
        except Format.DoesNotExist:
            return Response(
                {'error': {'code': 'GUT-4004', 'message': 'Format not found or does not belong to this title.'}},
                status=status.HTTP_404_NOT_FOUND,
            )

    # Validate file extension
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    allowed = getattr(settings, 'ALLOWED_COVER_FORMATS', ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'])
    if ext not in allowed:
        return Response(
            {'error': {
                'code': 'GUT-4010',
                'message': f'Unsupported cover format: {ext}. Allowed: {", ".join(allowed)}',
            }},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate file size
    max_size = getattr(settings, 'MAX_COVER_SIZE', 150 * 1024 * 1024)
    if uploaded_file.size > max_size:
        return Response(
            {'error': {
                'code': 'GUT-4011',
                'message': f'File size {uploaded_file.size} bytes exceeds maximum {max_size} bytes.',
            }},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Extract image metadata
    metadata = _extract_image_metadata(uploaded_file)

    # Create cover record
    cover = Cover.objects.create(
        title=title,
        format=fmt,
        file=uploaded_file,
        file_type=metadata['file_type'],
        resolution_dpi=metadata['resolution_dpi'],
        color_mode=metadata['color_mode'],
        width_px=metadata['width_px'],
        height_px=metadata['height_px'],
        file_size=metadata['file_size'],
        validation_status=Cover.ValidationStatus.PENDING,
    )

    # Run initial validation
    format_type = fmt.format_type if fmt else 'ebook'
    is_valid, report = _validate_cover_specs(cover, format_type)
    cover.validation_status = Cover.ValidationStatus.VALID if is_valid else Cover.ValidationStatus.INVALID
    cover.validation_report = report
    cover.save()

    return Response(
        CoverSerializer(cover).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_cover(request):
    """
    Run the full validation pipeline on an existing cover per FDD §3.5.1.

    Checks resolution, color mode, dimensions, and file size against
    the target format specifications.
    """
    serializer = CoverValidateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    cover_id = serializer.validated_data['cover_id']

    try:
        cover = Cover.objects.get(id=cover_id, title__user=request.user)
    except Cover.DoesNotExist:
        return Response(
            {'error': {'code': 'GUT-4004', 'message': 'Cover not found or access denied.'}},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Determine the format type for validation
    format_type = cover.format.format_type if cover.format else 'ebook'
    is_valid, report = _validate_cover_specs(cover, format_type)

    cover.validation_status = Cover.ValidationStatus.VALID if is_valid else Cover.ValidationStatus.INVALID
    cover.validation_report = report
    cover.save()

    return Response({
        'cover_id': str(cover.id),
        'validation_status': cover.validation_status,
        'validation_report': report,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def inject_barcode(request):
    """
    Queue barcode injection onto a cover image per FDD §3.5.2.

    Queues the task via Celery for asynchronous processing.
    """
    serializer = CoverBarcodeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    cover_id = serializer.validated_data['cover_id']
    isbn = serializer.validated_data['isbn']
    position = serializer.validated_data.get('position', 'bottom_right')

    try:
        cover = Cover.objects.get(id=cover_id, title__user=request.user)
    except Cover.DoesNotExist:
        return Response(
            {'error': {'code': 'GUT-4004', 'message': 'Cover not found or access denied.'}},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Validate ISBN before queuing
    from isbn_service.views import validate_isbn13_check_digit
    if not validate_isbn13_check_digit(isbn):
        return Response(
            {'error': {'code': 'GUT-4002', 'message': 'Invalid ISBN-13 check digit.'}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Queue barcode injection via Celery
    from celery_workers.cover_tasks import inject_barcode_task
    task = inject_barcode_task.delay(
        str(cover.id),
        isbn,
        position,
    )

    return Response({
        'task_id': task.id,
        'cover_id': str(cover.id),
        'isbn': isbn,
        'position': position,
        'status': 'queued',
        'message': 'Barcode injection queued. Poll for completion.',
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_variants(request):
    """
    Generate cover variants for multiple format types per FDD §3.5.3.

    Creates resized/reformatted versions of the source cover for each
    specified target format (e.g., ebook, paperback, audiobook).
    """
    serializer = CoverGenerateVariantsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    cover_id = serializer.validated_data['cover_id']
    target_formats = serializer.validated_data['target_formats']

    try:
        cover = Cover.objects.get(id=cover_id, title__user=request.user)
    except Cover.DoesNotExist:
        return Response(
            {'error': {'code': 'GUT-4004', 'message': 'Cover not found or access denied.'}},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Queue variant generation via Celery
    from celery_workers.cover_tasks import generate_cover_variants
    task = generate_cover_variants.delay(
        str(cover.id),
        target_formats,
    )

    return Response({
        'task_id': task.id,
        'cover_id': str(cover.id),
        'target_formats': target_formats,
        'status': 'queued',
        'message': 'Cover variant generation queued for all target formats.',
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def templates(request):
    """List available cover design templates per FDD §3.5."""
    return Response(COVER_TEMPLATE_CATALOG)
