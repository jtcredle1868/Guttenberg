"""Notifications serializers."""
from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    channel_display = serializers.CharField(
        source='get_channel_display', read_only=True,
    )

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'event', 'channel', 'channel_display',
            'title', 'message', 'is_read', 'sent_at', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class MarkReadSerializer(serializers.Serializer):
    """Serializer for marking notification(s) as read."""
    notification_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        help_text='List of notification UUIDs to mark as read.',
    )


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'email_enabled', 'push_enabled', 'in_app_enabled',
            'distribution_updates', 'sales_milestones',
            'royalty_disbursements', 'marketing_reminders',
            'format_updates', 'review_alerts', 'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']
