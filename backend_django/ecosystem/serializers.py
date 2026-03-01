"""Ecosystem serializers."""
from rest_framework import serializers
from .models import ActivityEvent, RefinerySync


class ActivityEventSerializer(serializers.ModelSerializer):
    title_name = serializers.CharField(source='title.title', read_only=True, default=None)
    event_type_display = serializers.CharField(
        source='get_event_type_display', read_only=True,
    )

    class Meta:
        model = ActivityEvent
        fields = [
            'id', 'user', 'title', 'title_name', 'event_type',
            'event_type_display', 'message', 'metadata',
            'is_read', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class RefinerySyncSerializer(serializers.ModelSerializer):
    title_name = serializers.CharField(source='title.title', read_only=True)

    class Meta:
        model = RefinerySync
        fields = [
            'id', 'title', 'title_name', 'refinery_manuscript_id',
            'last_synced', 'sync_status', 'evaluation_score',
            'genre_classification', 'sync_data',
        ]
        read_only_fields = ['id']


class ReadinessBreakdownSerializer(serializers.Serializer):
    """Serializer for the publishing readiness score breakdown."""
    composite_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    refinery_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    metadata_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    preflight_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    level = serializers.CharField()
    checklist = serializers.ListField(child=serializers.DictField())


class RefineryImportSerializer(serializers.Serializer):
    """Serializer for initiating a Refinery import."""
    refinery_manuscript_id = serializers.UUIDField()
    title_id = serializers.UUIDField(required=False, help_text='Existing title to link, or omit to create new.')


class ScrybeBookPageSerializer(serializers.Serializer):
    """Serializer for creating/updating a Scrybe book page."""
    title_id = serializers.UUIDField()
    include_synopsis = serializers.BooleanField(default=True)
    include_purchase_links = serializers.BooleanField(default=True)
    include_reviews = serializers.BooleanField(default=True)
    custom_content = serializers.CharField(required=False, allow_blank=True, default='')


class EntitlementSerializer(serializers.Serializer):
    """Serializer for feature entitlements."""
    feature = serializers.CharField()
    enabled = serializers.BooleanField()
    limit = serializers.IntegerField(allow_null=True, default=None)
