"""Title views — CRUD and management endpoints per FDD."""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Title
from .serializers import TitleListSerializer, TitleDetailSerializer, TitleCreateSerializer


class TitleViewSet(viewsets.ModelViewSet):
    """
    Title management endpoints.

    list:   GET  /api/v1/titles/
    create: POST /api/v1/titles/
    read:   GET  /api/v1/titles/{id}/
    update: PUT  /api/v1/titles/{id}/
    delete: DELETE /api/v1/titles/{id}/
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'genre', 'language']
    search_fields = ['title', 'primary_author', 'synopsis_short']
    ordering_fields = ['title', 'created_at', 'updated_at', 'publishing_readiness_score']
    ordering = ['-updated_at']

    def get_queryset(self):
        return Title.objects.filter(user=self.request.user).select_related('imprint')

    def get_serializer_class(self):
        if self.action == 'list':
            return TitleListSerializer
        if self.action == 'create':
            return TitleCreateSerializer
        return TitleDetailSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        instance.calculate_metadata_completeness()
        instance.calculate_readiness_score()
        instance.save()

    @action(detail=True, methods=['get'])
    def channel_readiness(self, request, pk=None):
        """Get per-channel readiness validation per FDD §3.2.2."""
        title = self.get_object()
        channels = {
            'amazon_kdp': self._check_channel_readiness(title, 'amazon_kdp'),
            'ingram_spark': self._check_channel_readiness(title, 'ingram_spark'),
            'apple_books': self._check_channel_readiness(title, 'apple_books'),
            'kobo': self._check_channel_readiness(title, 'kobo'),
            'barnes_noble': self._check_channel_readiness(title, 'barnes_noble'),
        }
        return Response(channels)

    def _check_channel_readiness(self, title, channel):
        """Channel-specific metadata validation per FDD §3.2.2."""
        checks = []
        all_pass = True

        # Common checks
        checks.append({'field': 'title', 'required': True, 'status': bool(title.title)})
        checks.append({'field': 'author', 'required': True, 'status': bool(title.primary_author)})
        checks.append({'field': 'language', 'required': True, 'status': bool(title.language)})

        # Channel-specific
        if channel == 'amazon_kdp':
            checks.append({
                'field': 'description',
                'required': True,
                'status': len(title.synopsis_short) >= 50,
                'note': 'Min 50 characters',
            })
            checks.append({
                'field': 'bisac_code',
                'required': True,
                'status': len(title.bisac_codes) >= 1,
            })
        elif channel == 'ingram_spark':
            checks.append({
                'field': 'description',
                'required': True,
                'status': len(title.synopsis_long) >= 100,
                'note': 'Min 100 characters',
            })
            checks.append({
                'field': 'bisac_codes',
                'required': True,
                'status': len(title.bisac_codes) >= 2,
                'note': 'Min 2 required',
            })
            checks.append({
                'field': 'isbn',
                'required': True,
                'status': title.formats.filter(isbn__isnull=False).exists() if hasattr(title, 'formats') else False,
            })
            checks.append({
                'field': 'publication_date',
                'required': True,
                'status': title.publication_date is not None,
                'note': '30 days ahead required',
            })

        for check in checks:
            if check['required'] and not check['status']:
                all_pass = False

        return {
            'channel': channel,
            'ready': all_pass,
            'checks': checks,
            'score': sum(1 for c in checks if c['status']) / max(len(checks), 1) * 100,
        }

    @action(detail=True, methods=['post'])
    def recalculate_readiness(self, request, pk=None):
        """Force recalculation of publishing readiness score."""
        title = self.get_object()
        title.calculate_metadata_completeness()
        title.calculate_readiness_score()
        title.save()
        return Response({
            'publishing_readiness_score': float(title.publishing_readiness_score),
            'breakdown': {
                'refinery': float(title.refinery_score),
                'metadata': float(title.metadata_completeness_score),
                'preflight': float(title.preflight_score),
            }
        })
