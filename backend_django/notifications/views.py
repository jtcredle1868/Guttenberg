"""Notifications views — list, mark read, and preferences."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer,
    MarkReadSerializer,
    NotificationPreferenceSerializer,
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """
    GET /api/v1/notifications/

    List the authenticated user's notifications with pagination.
    Query params: is_read (true/false), page, page_size.
    """
    notifications = Notification.objects.filter(
        user=request.user,
    ).select_related('event')

    # Filter by is_read
    is_read = request.query_params.get('is_read')
    if is_read is not None:
        notifications = notifications.filter(
            is_read=is_read.lower() in ('true', '1', 'yes'),
        )

    # Simple pagination
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    page_size = min(page_size, 100)  # Cap at 100

    total = notifications.count()
    start = (page - 1) * page_size
    end = start + page_size

    paginated = notifications[start:end]
    serializer = NotificationSerializer(paginated, many=True)

    return Response({
        'count': total,
        'page': page,
        'page_size': page_size,
        'results': serializer.data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_read(request):
    """
    POST /api/v1/notifications/mark-read/

    Mark one or more notifications as read.
    Body: {"notification_ids": ["uuid1", "uuid2", ...]}
    """
    serializer = MarkReadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    notification_ids = serializer.validated_data['notification_ids']
    updated = Notification.objects.filter(
        id__in=notification_ids,
        user=request.user,
        is_read=False,
    ).update(is_read=True)

    return Response({
        'marked_read': updated,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """
    POST /api/v1/notifications/mark-all-read/

    Mark all unread notifications as read for the authenticated user.
    """
    updated = Notification.objects.filter(
        user=request.user,
        is_read=False,
    ).update(is_read=True)

    return Response({
        'marked_read': updated,
    })


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def preferences(request):
    """
    GET /api/v1/notifications/preferences/  — retrieve current preferences
    PUT /api/v1/notifications/preferences/  — update preferences
    """
    prefs, created = NotificationPreference.objects.get_or_create(
        user=request.user,
    )

    if request.method == 'GET':
        serializer = NotificationPreferenceSerializer(prefs)
        return Response(serializer.data)

    # PUT
    serializer = NotificationPreferenceSerializer(
        prefs, data=request.data, partial=True,
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)
