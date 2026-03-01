"""Manuscript views — upload, preflight, versioning, Refinery import."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Manuscript, ManuscriptVersion
from .serializers import ManuscriptSerializer, ManuscriptUploadSerializer, RefineryImportSerializer
from titles.models import Title
import os


class ManuscriptViewSet(viewsets.ModelViewSet):
    serializer_class = ManuscriptSerializer

    def get_queryset(self):
        return Manuscript.objects.filter(user=self.request.user).select_related('title')

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload(self, request):
        """Upload a manuscript file per FDD §3.1.1."""
        serializer = ManuscriptUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        title = Title.objects.get(id=serializer.validated_data['title_id'], user=request.user)
        uploaded_file = serializer.validated_data['file']

        ext = os.path.splitext(uploaded_file.name)[1].lower()
        allowed = ['.docx', '.doc', '.rtf', '.odt', '.txt', '.pdf']
        if ext not in allowed:
            return Response(
                {'error': {'code': 'GUT-4010', 'message': f'Unsupported format: {ext}. Allowed: {", ".join(allowed)}'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        manuscript, created = Manuscript.objects.get_or_create(
            title=title,
            user=request.user,
            defaults={
                'original_filename': uploaded_file.name,
                'file_format': ext,
                'file_size': uploaded_file.size,
                'file': uploaded_file,
            }
        )
        if not created:
            manuscript.file = uploaded_file
            manuscript.original_filename = uploaded_file.name
            manuscript.file_format = ext
            manuscript.file_size = uploaded_file.size
            manuscript.save()

        # Create version record
        version_num = manuscript.versions.count() + 1
        ManuscriptVersion.objects.create(
            manuscript=manuscript,
            version_number=version_num,
            file=uploaded_file,
            uploader=request.user,
            change_note=serializer.validated_data.get('change_note', ''),
        )

        # Queue preflight validation via Celery
        from celery_workers.manuscript_tasks import run_preflight_validation
        run_preflight_validation.delay(str(manuscript.id))

        return Response({
            'id': str(manuscript.id),
            'filename': uploaded_file.name,
            'version': version_num,
            'preflight_status': 'pending',
            'message': 'Manuscript uploaded. Preflight validation queued.',
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def import_refinery(self, request):
        """Import manuscript from The Refinery per FDD §3.1.3."""
        serializer = RefineryImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from celery_workers.manuscript_tasks import import_from_refinery
        task = import_from_refinery.delay(
            str(request.user.id),
            str(serializer.validated_data['refinery_project_id']),
            str(serializer.validated_data.get('title_id', '')),
        )

        return Response({
            'task_id': task.id,
            'status': 'queued',
            'message': 'Refinery import initiated. This will create a new title with pre-populated metadata.',
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['get'])
    def preflight(self, request, pk=None):
        """Get preflight validation report per FDD §3.1.2."""
        manuscript = self.get_object()
        return Response({
            'status': manuscript.preflight_status,
            'report': manuscript.preflight_report,
            'manuscript_id': str(manuscript.id),
        })

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """List all manuscript versions per FDD §3.1.4."""
        manuscript = self.get_object()
        versions = manuscript.versions.all()
        from .serializers import ManuscriptVersionSerializer
        return Response(ManuscriptVersionSerializer(versions, many=True).data)

    @action(detail=True, methods=['post'], url_path='restore/(?P<version_id>[^/.]+)')
    def restore(self, request, pk=None, version_id=None):
        """Restore a previous manuscript version."""
        manuscript = self.get_object()
        try:
            version = manuscript.versions.get(id=version_id)
        except ManuscriptVersion.DoesNotExist:
            return Response(
                {'error': {'code': 'GUT-4004', 'message': 'Version not found'}},
                status=status.HTTP_404_NOT_FOUND,
            )
        manuscript.file = version.file
        manuscript.word_count = version.word_count
        manuscript.chapter_count = version.chapter_count
        manuscript.save()
        return Response({'message': f'Restored to version {version.version_number}'})
