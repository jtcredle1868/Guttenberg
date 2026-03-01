"""Format serializers."""
from rest_framework import serializers
from .models import Format, FormatJob


class FormatJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormatJob
        fields = [
            'id', 'format', 'job_type', 'template_name', 'template_config',
            'status', 'progress', 'output_file', 'error_message',
            'started_at', 'completed_at', 'created_at',
        ]
        read_only_fields = [
            'id', 'status', 'progress', 'output_file', 'error_message',
            'started_at', 'completed_at', 'created_at',
        ]


class FormatJobCreateSerializer(serializers.Serializer):
    """Serializer for queuing a new format job."""
    job_type = serializers.ChoiceField(choices=FormatJob.JobType.choices)
    template_name = serializers.ChoiceField(choices=FormatJob.TemplateName.choices)
    template_config = serializers.JSONField(required=False, default=dict)


class FormatSerializer(serializers.ModelSerializer):
    jobs = FormatJobSerializer(many=True, read_only=True)

    class Meta:
        model = Format
        fields = [
            'id', 'title', 'format_type', 'isbn', 'isbn_source',
            'trim_size', 'page_count', 'file_interior', 'file_cover',
            'list_price_usd', 'channel_pricing', 'drm_enabled', 'status',
            'jobs', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FormatCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new format."""

    class Meta:
        model = Format
        fields = [
            'title', 'format_type', 'isbn', 'isbn_source', 'trim_size',
            'page_count', 'list_price_usd', 'channel_pricing', 'drm_enabled',
        ]


class FormatPreviewSerializer(serializers.Serializer):
    """Serializer for requesting a format preview."""
    template_name = serializers.ChoiceField(choices=FormatJob.TemplateName.choices)
    template_config = serializers.JSONField(required=False, default=dict)
    pages = serializers.IntegerField(required=False, default=5, help_text='Number of pages to preview')
