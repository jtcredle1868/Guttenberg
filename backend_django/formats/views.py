"""Format views — CRUD and format-job management per FDD §3.4."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Format, FormatJob
from .serializers import (
    FormatSerializer,
    FormatCreateSerializer,
    FormatJobSerializer,
    FormatJobCreateSerializer,
    FormatPreviewSerializer,
)


# Template catalog per FDD §3.4.3
TEMPLATE_CATALOG = [
    {
        'name': 'Meridian',
        'genre_targets': ['literary_fiction', 'memoir', 'biography'],
        'description': 'Clean, classic typography ideal for literary fiction and memoirs. '
                       'Features elegant serif fonts and generous margins.',
    },
    {
        'name': 'Velocity',
        'genre_targets': ['thriller', 'action', 'adventure'],
        'description': 'Dynamic layout with tighter spacing for fast-paced narratives. '
                       'Optimized for genre fiction with strong chapter breaks.',
    },
    {
        'name': 'Ember',
        'genre_targets': ['romance', 'womens_fiction'],
        'description': 'Warm, inviting design with decorative chapter headings. '
                       'Perfect for romance and contemporary women\'s fiction.',
    },
    {
        'name': 'Codex',
        'genre_targets': ['sci_fi', 'fantasy', 'speculative'],
        'description': 'Modern layout with geometric accents suited for speculative fiction. '
                       'Supports complex front and back matter.',
    },
    {
        'name': 'Pinnacle',
        'genre_targets': ['business', 'self_help', 'nonfiction'],
        'description': 'Professional layout with sidebars and callout support. '
                       'Designed for non-fiction, business, and self-help titles.',
    },
    {
        'name': 'Horizon',
        'genre_targets': ['travel', 'nature', 'photography'],
        'description': 'Spacious design optimized for image-heavy content. '
                       'Full-bleed support for travel and photography books.',
    },
    {
        'name': 'Spectrum',
        'genre_targets': ['children', 'young_adult', 'middle_grade'],
        'description': 'Playful, accessible typography for younger audiences. '
                       'Supports illustrated content and larger font sizes.',
    },
    {
        'name': 'Atlas',
        'genre_targets': ['academic', 'technical', 'reference'],
        'description': 'Structured layout with footnote, index, and citation support. '
                       'Ideal for academic, technical, and reference works.',
    },
]


class FormatViewSet(viewsets.ModelViewSet):
    """
    Format management endpoints.

    list:   GET  /api/v1/formats/
    create: POST /api/v1/formats/
    read:   GET  /api/v1/formats/{id}/
    update: PUT  /api/v1/formats/{id}/
    delete: DELETE /api/v1/formats/{id}/
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Format.objects.filter(
            title__user=self.request.user
        ).select_related('title').prefetch_related('jobs')

    def get_serializer_class(self):
        if self.action == 'create':
            return FormatCreateSerializer
        return FormatSerializer

    @action(detail=True, methods=['post'])
    def format_job(self, request, pk=None):
        """Queue a format-generation job via Celery per FDD §3.4.2."""
        fmt = self.get_object()
        serializer = FormatJobCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        job = FormatJob.objects.create(
            format=fmt,
            job_type=serializer.validated_data['job_type'],
            template_name=serializer.validated_data['template_name'],
            template_config=serializer.validated_data.get('template_config', {}),
        )

        from celery_workers.format_tasks import run_format_job
        run_format_job.delay(str(job.id))

        return Response(
            FormatJobSerializer(job).data,
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=True, methods=['get'], url_path='job-status')
    def job_status(self, request, pk=None):
        """Get status of all format jobs for a given format."""
        fmt = self.get_object()
        jobs = fmt.jobs.all()
        return Response(FormatJobSerializer(jobs, many=True).data)

    @action(detail=False, methods=['get'])
    def templates(self, request):
        """List available formatting templates per FDD §3.4.3."""
        return Response(TEMPLATE_CATALOG)

    @action(detail=True, methods=['post'])
    def preview(self, request, pk=None):
        """Generate a preview of the formatted output per FDD §3.4.4."""
        fmt = self.get_object()
        serializer = FormatPreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        job = FormatJob.objects.create(
            format=fmt,
            job_type=FormatJob.JobType.PDF,
            template_name=serializer.validated_data['template_name'],
            template_config={
                **serializer.validated_data.get('template_config', {}),
                'preview': True,
                'preview_pages': serializer.validated_data.get('pages', 5),
            },
        )

        from celery_workers.format_tasks import run_format_job
        run_format_job.delay(str(job.id))

        return Response({
            'job_id': str(job.id),
            'status': 'queued',
            'message': 'Preview generation queued. Poll job-status for progress.',
        }, status=status.HTTP_202_ACCEPTED)
