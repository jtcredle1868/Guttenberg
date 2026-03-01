"""Marketing views — landing pages, ARC campaigns, press kits, and social assets per FDD SS3.8."""
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from titles.models import Title
from .models import LandingPage, ARCCampaign, ARCReviewer, PressKit, SocialAsset
from .serializers import (
    LandingPageSerializer,
    ARCCampaignSerializer,
    ARCCampaignCreateSerializer,
    ARCReviewerSerializer,
    ARCReviewerCreateSerializer,
    PressKitSerializer,
    SocialAssetSerializer,
    SocialAssetGenerateSerializer,
    SynopsisAISerializer,
)


class LandingPageViewSet(viewsets.GenericViewSet):
    """
    Landing page endpoints per FDD SS3.8.

    retrieve: GET  /api/v1/marketing/landing-pages/{title_id}/
    update:   PUT  /api/v1/marketing/landing-pages/{title_id}/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LandingPageSerializer
    lookup_field = 'title_id'

    def get_queryset(self):
        return LandingPage.objects.filter(
            title__user=self.request.user
        ).select_related('title')

    def retrieve(self, request, title_id=None):
        """Get a title's landing page configuration."""
        try:
            title = Title.objects.get(id=title_id, user=request.user)
        except Title.DoesNotExist:
            return Response(
                {'error': 'Title not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        landing_page, created = LandingPage.objects.get_or_create(
            title=title,
            defaults={'slug': str(title.id)[:8]},
        )

        return Response(LandingPageSerializer(landing_page).data)

    def update(self, request, title_id=None):
        """Update a title's landing page configuration."""
        try:
            title = Title.objects.get(id=title_id, user=request.user)
        except Title.DoesNotExist:
            return Response(
                {'error': 'Title not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        landing_page, created = LandingPage.objects.get_or_create(
            title=title,
            defaults={'slug': str(title.id)[:8]},
        )

        serializer = LandingPageSerializer(landing_page, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


class ARCCampaignViewSet(viewsets.ModelViewSet):
    """
    ARC campaign CRUD endpoints per FDD SS3.8.

    list:     GET    /api/v1/marketing/arc-campaigns/
    create:   POST   /api/v1/marketing/arc-campaigns/
    retrieve: GET    /api/v1/marketing/arc-campaigns/{id}/
    update:   PUT    /api/v1/marketing/arc-campaigns/{id}/
    delete:   DELETE /api/v1/marketing/arc-campaigns/{id}/
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ARCCampaign.objects.filter(
            title__user=self.request.user
        ).select_related('title').prefetch_related('reviewers')

    def get_serializer_class(self):
        if self.action == 'create':
            return ARCCampaignCreateSerializer
        return ARCCampaignSerializer

    def perform_create(self, serializer):
        # Verify title ownership
        title = serializer.validated_data['title']
        if title.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You do not own this title.')
        serializer.save()

    @action(detail=True, methods=['get', 'post'], url_path='reviewers')
    def reviewers(self, request, pk=None):
        """List or add reviewers for an ARC campaign."""
        campaign = self.get_object()

        if request.method == 'GET':
            reviewers = campaign.reviewers.all()
            return Response(ARCReviewerSerializer(reviewers, many=True).data)

        # POST — invite a new reviewer
        serializer = ARCReviewerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if campaign.reviewers_count >= campaign.max_reviewers:
            return Response(
                {'error': f'Maximum reviewers ({campaign.max_reviewers}) reached.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check for duplicate email
        if campaign.reviewers.filter(email=serializer.validated_data['email']).exists():
            return Response(
                {'error': 'This reviewer has already been invited.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reviewer = ARCReviewer.objects.create(
            campaign=campaign,
            email=serializer.validated_data['email'],
            name=serializer.validated_data['name'],
        )

        campaign.reviewers_count = campaign.reviewers.count()
        campaign.save(update_fields=['reviewers_count'])

        return Response(
            ARCReviewerSerializer(reviewer).data,
            status=status.HTTP_201_CREATED,
        )


class MarketingViewSet(viewsets.GenericViewSet):
    """
    Marketing action endpoints per FDD SS3.8.

    press_kit:     POST /api/v1/marketing/titles/{title_id}/press-kit/
    social_assets: POST /api/v1/marketing/titles/{title_id}/social-assets/
    synopsis_ai:   POST /api/v1/marketing/titles/{title_id}/synopsis-ai/
    """
    permission_classes = [IsAuthenticated]

    def _get_title(self, request, title_id):
        """Get a title owned by the requesting user."""
        try:
            return Title.objects.get(id=title_id, user=request.user)
        except Title.DoesNotExist:
            return None

    @action(detail=False, methods=['post'], url_path='titles/(?P<title_id>[^/.]+)/press-kit')
    def press_kit(self, request, title_id=None):
        """Generate a press kit for a title via Celery."""
        title = self._get_title(request, title_id)
        if title is None:
            return Response(
                {'error': 'Title not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        press_kit = PressKit.objects.create(title=title)

        # Queue Celery task for press kit generation
        from celery_workers.marketing_tasks import generate_press_kit
        generate_press_kit.delay(str(press_kit.id))

        return Response(
            {
                'message': 'Press kit generation queued.',
                'press_kit': PressKitSerializer(press_kit).data,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=False, methods=['post'], url_path='titles/(?P<title_id>[^/.]+)/social-assets')
    def social_assets(self, request, title_id=None):
        """Generate social media assets for a title."""
        title = self._get_title(request, title_id)
        if title is None:
            return Response(
                {'error': 'Title not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SocialAssetGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        asset = SocialAsset.objects.create(
            title=title,
            asset_type=serializer.validated_data['asset_type'],
            caption=serializer.validated_data.get('caption', ''),
        )

        # Queue Celery task for social asset generation
        from celery_workers.marketing_tasks import generate_social_asset
        generate_social_asset.delay(str(asset.id))

        return Response(
            {
                'message': 'Social asset generation queued.',
                'asset': SocialAssetSerializer(asset).data,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=False, methods=['post'], url_path='titles/(?P<title_id>[^/.]+)/synopsis-ai')
    def synopsis_ai(self, request, title_id=None):
        """Trigger AI synopsis generation for a title."""
        title = self._get_title(request, title_id)
        if title is None:
            return Response(
                {'error': 'Title not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SynopsisAISerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Queue Celery AI task
        from celery_workers.ai_tasks import generate_synopsis
        generate_synopsis.delay(
            str(title.id),
            tone=serializer.validated_data['tone'],
            max_length=serializer.validated_data['max_length'],
        )

        return Response(
            {
                'message': 'AI synopsis generation queued.',
                'title_id': str(title.id),
                'tone': serializer.validated_data['tone'],
                'max_length': serializer.validated_data['max_length'],
            },
            status=status.HTTP_202_ACCEPTED,
        )
