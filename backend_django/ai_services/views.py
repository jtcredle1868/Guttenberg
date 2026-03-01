"""
AI Services views — Claude-powered intelligent features.

All AI endpoints queue work via Celery for non-blocking execution.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import SynopsisRequestSerializer, KeywordRequestSerializer, MetadataEnhanceSerializer
from .models import AIGenerationRequest
from titles.models import Title


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_synopsis(request):
    """
    Generate AI-powered book synopsis per FDD §3.2.3.

    Uses Claude to generate two variants:
    - Retail-focused (emotional, reader-benefit-oriented)
    - Press-release style (formal)
    """
    serializer = SynopsisRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        title = Title.objects.get(id=serializer.validated_data['title_id'], user=request.user)
    except Title.DoesNotExist:
        return Response({'error': {'code': 'GUT-4004', 'message': 'Title not found'}}, status=status.HTTP_404_NOT_FOUND)

    # Create tracking record
    ai_request = AIGenerationRequest.objects.create(
        user=request.user,
        title=title,
        request_type=AIGenerationRequest.RequestType.SYNOPSIS,
        input_data={
            'title': title.title,
            'genre': title.genre,
            'primary_author': title.primary_author,
            'word_count': title.word_count,
            'synopsis_short': title.synopsis_short,
            'style': serializer.validated_data['style'],
        },
    )

    # Queue via Celery
    from celery_workers.ai_tasks import generate_synopsis_task
    generate_synopsis_task.delay(str(ai_request.id))

    return Response({
        'request_id': str(ai_request.id),
        'status': 'queued',
        'message': 'Synopsis generation queued. Poll /api/v1/ai/status/<request_id>/ for results.',
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_keywords(request):
    """Generate optimized keywords using Claude per RDD GUT-META-006."""
    serializer = KeywordRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        title = Title.objects.get(id=serializer.validated_data['title_id'], user=request.user)
    except Title.DoesNotExist:
        return Response({'error': {'code': 'GUT-4004', 'message': 'Title not found'}}, status=status.HTTP_404_NOT_FOUND)

    ai_request = AIGenerationRequest.objects.create(
        user=request.user,
        title=title,
        request_type=AIGenerationRequest.RequestType.KEYWORDS,
        input_data={
            'title': title.title,
            'genre': title.genre,
            'bisac_codes': title.bisac_codes,
            'keywords': title.keywords,
            'synopsis_short': title.synopsis_short,
        },
    )

    from celery_workers.ai_tasks import optimize_keywords_task
    optimize_keywords_task.delay(str(ai_request.id))

    return Response({
        'request_id': str(ai_request.id),
        'status': 'queued',
        'message': 'Keyword optimization queued.',
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enhance_metadata(request):
    """Use Claude to analyze and suggest metadata improvements."""
    serializer = MetadataEnhanceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        title = Title.objects.get(id=serializer.validated_data['title_id'], user=request.user)
    except Title.DoesNotExist:
        return Response({'error': {'code': 'GUT-4004', 'message': 'Title not found'}}, status=status.HTTP_404_NOT_FOUND)

    ai_request = AIGenerationRequest.objects.create(
        user=request.user,
        title=title,
        request_type=AIGenerationRequest.RequestType.METADATA,
        input_data={
            'title': title.title,
            'subtitle': title.subtitle,
            'genre': title.genre,
            'primary_author': title.primary_author,
            'bisac_codes': title.bisac_codes,
            'keywords': title.keywords,
            'synopsis_short': title.synopsis_short,
            'synopsis_long': title.synopsis_long,
            'language': title.language,
            'audience_age_min': title.audience_age_min,
            'audience_age_max': title.audience_age_max,
        },
    )

    from celery_workers.ai_tasks import enhance_metadata_task
    enhance_metadata_task.delay(str(ai_request.id))

    return Response({
        'request_id': str(ai_request.id),
        'status': 'queued',
        'message': 'Metadata enhancement analysis queued.',
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_request_status(request, request_id):
    """Poll AI generation request status and get results."""
    try:
        ai_request = AIGenerationRequest.objects.get(id=request_id, user=request.user)
    except AIGenerationRequest.DoesNotExist:
        return Response({'error': {'code': 'GUT-4004', 'message': 'AI request not found'}}, status=status.HTTP_404_NOT_FOUND)

    response_data = {
        'request_id': str(ai_request.id),
        'request_type': ai_request.request_type,
        'status': ai_request.status,
        'created_at': ai_request.created_at.isoformat(),
    }

    if ai_request.status == AIGenerationRequest.Status.COMPLETED:
        response_data['result'] = ai_request.output_data
        response_data['completed_at'] = ai_request.completed_at.isoformat() if ai_request.completed_at else None
        response_data['tokens_used'] = ai_request.tokens_used
    elif ai_request.status == AIGenerationRequest.Status.FAILED:
        response_data['error'] = ai_request.error_message

    return Response(response_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_usage(request):
    """Get AI usage statistics for the current user."""
    from django.db.models import Sum, Count
    stats = AIGenerationRequest.objects.filter(user=request.user).aggregate(
        total_requests=Count('id'),
        total_tokens=Sum('tokens_used'),
        total_cost=Sum('cost_usd'),
    )
    by_type = AIGenerationRequest.objects.filter(user=request.user).values('request_type').annotate(
        count=Count('id'),
        tokens=Sum('tokens_used'),
    )
    return Response({
        'total_requests': stats['total_requests'] or 0,
        'total_tokens': stats['total_tokens'] or 0,
        'total_cost': float(stats['total_cost'] or 0),
        'by_type': list(by_type),
    })
