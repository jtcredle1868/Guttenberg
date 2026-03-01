"""Ecosystem views — readiness, Refinery import, activity feed, Scrybe, entitlements per FDD SS3.10."""
from decimal import Decimal

from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from titles.models import Title
from .models import ActivityEvent, RefinerySync
from .serializers import (
    ActivityEventSerializer,
    RefinerySyncSerializer,
    RefineryImportSerializer,
    ScrybeBookPageSerializer,
)


# Entitlement definitions per subscription tier
TIER_ENTITLEMENTS = {
    'starter': [
        {'feature': 'titles', 'enabled': True, 'limit': 3},
        {'feature': 'formats', 'enabled': True, 'limit': 2},
        {'feature': 'distribution_channels', 'enabled': True, 'limit': 2},
        {'feature': 'analytics', 'enabled': False, 'limit': None},
        {'feature': 'marketing_tools', 'enabled': False, 'limit': None},
        {'feature': 'ai_services', 'enabled': False, 'limit': None},
        {'feature': 'team_members', 'enabled': False, 'limit': None},
        {'feature': 'imprints', 'enabled': False, 'limit': None},
    ],
    'author': [
        {'feature': 'titles', 'enabled': True, 'limit': 25},
        {'feature': 'formats', 'enabled': True, 'limit': None},
        {'feature': 'distribution_channels', 'enabled': True, 'limit': None},
        {'feature': 'analytics', 'enabled': True, 'limit': None},
        {'feature': 'marketing_tools', 'enabled': True, 'limit': 5},
        {'feature': 'ai_services', 'enabled': True, 'limit': 10},
        {'feature': 'team_members', 'enabled': False, 'limit': None},
        {'feature': 'imprints', 'enabled': False, 'limit': None},
    ],
    'publisher': [
        {'feature': 'titles', 'enabled': True, 'limit': 250},
        {'feature': 'formats', 'enabled': True, 'limit': None},
        {'feature': 'distribution_channels', 'enabled': True, 'limit': None},
        {'feature': 'analytics', 'enabled': True, 'limit': None},
        {'feature': 'marketing_tools', 'enabled': True, 'limit': None},
        {'feature': 'ai_services', 'enabled': True, 'limit': 100},
        {'feature': 'team_members', 'enabled': True, 'limit': 10},
        {'feature': 'imprints', 'enabled': True, 'limit': 5},
    ],
    'enterprise': [
        {'feature': 'titles', 'enabled': True, 'limit': None},
        {'feature': 'formats', 'enabled': True, 'limit': None},
        {'feature': 'distribution_channels', 'enabled': True, 'limit': None},
        {'feature': 'analytics', 'enabled': True, 'limit': None},
        {'feature': 'marketing_tools', 'enabled': True, 'limit': None},
        {'feature': 'ai_services', 'enabled': True, 'limit': None},
        {'feature': 'team_members', 'enabled': True, 'limit': None},
        {'feature': 'imprints', 'enabled': True, 'limit': None},
    ],
}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def readiness(request, title_id):
    """
    GET /api/v1/ecosystem/readiness/{title_id}/

    Publishing readiness score breakdown for a title per FDD SS3.10.2.
    Returns composite score plus individual component scores and checklist.
    """
    try:
        title = Title.objects.get(id=title_id, user=request.user)
    except Title.DoesNotExist:
        return Response({'error': 'Title not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Recalculate scores
    title.calculate_metadata_completeness()
    title.calculate_readiness_score()

    composite = float(title.publishing_readiness_score)
    level = (
        'ready' if composite >= 80
        else 'nearly_ready' if composite >= 60
        else 'not_ready'
    )

    # Build checklist
    checklist = [
        {
            'component': 'refinery',
            'label': 'Manuscript Evaluation',
            'score': float(title.refinery_score),
            'weight': 0.6,
            'status': 'pass' if title.refinery_score >= 70 else 'fail',
        },
        {
            'component': 'metadata',
            'label': 'Metadata Completeness',
            'score': float(title.metadata_completeness_score),
            'weight': 0.2,
            'status': 'pass' if title.metadata_completeness_score >= 70 else 'fail',
        },
        {
            'component': 'preflight',
            'label': 'Preflight Checks',
            'score': float(title.preflight_score),
            'weight': 0.2,
            'status': 'pass' if title.preflight_score >= 70 else 'fail',
        },
    ]

    return Response({
        'title_id': str(title.id),
        'title': title.title,
        'composite_score': composite,
        'refinery_score': float(title.refinery_score),
        'metadata_score': float(title.metadata_completeness_score),
        'preflight_score': float(title.preflight_score),
        'level': level,
        'checklist': checklist,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refinery_import(request):
    """
    POST /api/v1/ecosystem/refinery-import/

    Initiate a Refinery manuscript import into Guttenberg.
    Links an existing or creates a new title with Refinery manuscript data.
    """
    serializer = RefineryImportSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    refinery_manuscript_id = serializer.validated_data['refinery_manuscript_id']
    title_id = serializer.validated_data.get('title_id')

    if title_id:
        try:
            title = Title.objects.get(id=title_id, user=request.user)
        except Title.DoesNotExist:
            return Response(
                {'error': 'Title not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
    else:
        # Create a placeholder title to be enriched by the Refinery sync
        title = Title.objects.create(
            user=request.user,
            title=f'Refinery Import — {refinery_manuscript_id}',
            primary_author=request.user.get_full_name() or request.user.username,
            refinery_manuscript_id=refinery_manuscript_id,
        )

    # Link the Refinery manuscript ID
    title.refinery_manuscript_id = refinery_manuscript_id
    title.save(update_fields=['refinery_manuscript_id'])

    # Create a sync record
    sync = RefinerySync.objects.create(
        title=title,
        refinery_manuscript_id=refinery_manuscript_id,
        last_synced=timezone.now(),
        sync_status='initiated',
    )

    # Create activity event
    ActivityEvent.objects.create(
        user=request.user,
        title=title,
        event_type=ActivityEvent.EventType.FORMAT_COMPLETE,
        message=f'Refinery import initiated for "{title.title}".',
        metadata={
            'refinery_manuscript_id': str(refinery_manuscript_id),
            'sync_id': str(sync.id),
        },
    )

    return Response(
        {
            'message': 'Refinery import initiated.',
            'title_id': str(title.id),
            'sync': RefinerySyncSerializer(sync).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_feed(request):
    """
    GET /api/v1/ecosystem/activity-feed/

    Guttenberg activity events for the Forge widget.
    Returns the latest 10 events. Supports filtering by title_id.
    """
    events = ActivityEvent.objects.filter(
        user=request.user,
    ).select_related('title')

    title_id = request.query_params.get('title_id')
    if title_id:
        events = events.filter(title_id=title_id)

    events = events[:10]
    serializer = ActivityEventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scrybe_sync(request):
    """
    POST /api/v1/ecosystem/scrybe/book-page/

    Create or update a Scrybe book page for a published title.
    Gathers title data and pushes it to the Scrybe platform.
    """
    serializer = ScrybeBookPageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    title_id = serializer.validated_data['title_id']

    try:
        title = Title.objects.get(id=title_id, user=request.user)
    except Title.DoesNotExist:
        return Response(
            {'error': 'Title not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if title.status != Title.Status.LIVE:
        return Response(
            {'error': 'Title must be live to create a Scrybe book page.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Build Scrybe page payload
    page_data = {
        'title': title.title,
        'subtitle': title.subtitle,
        'author': title.primary_author,
        'genre': title.genre,
        'language': title.language,
        'publication_date': (
            title.publication_date.isoformat() if title.publication_date else None
        ),
    }

    if serializer.validated_data.get('include_synopsis', True):
        page_data['synopsis'] = title.synopsis_long or title.synopsis_short

    if serializer.validated_data.get('include_purchase_links', True):
        # Gather live distribution links
        purchase_links = []
        if hasattr(title, 'formats'):
            for fmt in title.formats.all():
                for dist in fmt.distributions.filter(channel_status='live'):
                    if dist.channel_url:
                        purchase_links.append({
                            'channel': dist.channel.name,
                            'url': dist.channel_url,
                            'format': fmt.format_type,
                        })
        page_data['purchase_links'] = purchase_links

    custom_content = serializer.validated_data.get('custom_content', '')
    if custom_content:
        page_data['custom_content'] = custom_content

    # In production, this would push to Scrybe API via Celery
    # For now, return the payload that would be sent
    return Response({
        'message': 'Scrybe book page sync initiated.',
        'title_id': str(title.id),
        'page_data': page_data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def entitlements(request):
    """
    GET /api/v1/ecosystem/entitlements/

    Return the author's Guttenberg feature entitlements based on subscription tier.
    Looks up the user's organization membership to determine tier.
    """
    from enterprise.models import TeamMember

    # Determine the user's highest subscription tier
    membership = TeamMember.objects.filter(
        user=request.user, is_active=True,
    ).select_related('organization').order_by(
        '-organization__subscription_tier',
    ).first()

    if membership:
        tier = membership.organization.subscription_tier
    else:
        tier = 'starter'

    features = TIER_ENTITLEMENTS.get(tier, TIER_ENTITLEMENTS['starter'])

    return Response({
        'tier': tier,
        'features': features,
    })
