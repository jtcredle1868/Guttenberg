"""Title serializers."""
from rest_framework import serializers
from .models import Title


class TitleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    format_count = serializers.SerializerMethodField()
    channel_count = serializers.SerializerMethodField()

    class Meta:
        model = Title
        fields = [
            'id', 'title', 'subtitle', 'primary_author', 'genre', 'status',
            'publishing_readiness_score', 'publication_date', 'word_count',
            'format_count', 'channel_count', 'created_at', 'updated_at',
        ]

    def get_format_count(self, obj):
        return obj.formats.count() if hasattr(obj, 'formats') else 0

    def get_channel_count(self, obj):
        if hasattr(obj, 'formats'):
            return sum(f.distributions.count() for f in obj.formats.all())
        return 0


class TitleDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail views."""
    formats = serializers.SerializerMethodField()
    readiness_breakdown = serializers.SerializerMethodField()

    class Meta:
        model = Title
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']

    def get_formats(self, obj):
        from formats.serializers import FormatSerializer
        return FormatSerializer(obj.formats.all(), many=True).data if hasattr(obj, 'formats') else []

    def get_readiness_breakdown(self, obj):
        return {
            'composite': float(obj.publishing_readiness_score),
            'refinery': float(obj.refinery_score),
            'metadata': float(obj.metadata_completeness_score),
            'preflight': float(obj.preflight_score),
            'level': (
                'ready' if obj.publishing_readiness_score >= 80
                else 'nearly_ready' if obj.publishing_readiness_score >= 60
                else 'not_ready'
            ),
        }


class TitleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new titles."""

    class Meta:
        model = Title
        fields = [
            'title', 'subtitle', 'primary_author', 'genre', 'synopsis_short',
            'synopsis_long', 'bisac_codes', 'keywords', 'language',
            'publication_date', 'edition', 'series_name', 'series_number',
            'audience_age_min', 'audience_age_max', 'content_advisories',
            'contributors', 'imprint',
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        title = super().create(validated_data)
        title.calculate_metadata_completeness()
        title.calculate_readiness_score()
        title.save()
        return title
