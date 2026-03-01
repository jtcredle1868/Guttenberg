"""Distribution serializers."""
from rest_framework import serializers
from .models import DistributionChannel, DistributionRecord


class DistributionChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistributionChannel
        fields = ['id', 'name', 'api_type', 'auth_method', 'is_active']


class DistributionRecordSerializer(serializers.ModelSerializer):
    channel_name = serializers.CharField(source='channel.name', read_only=True)
    format_type = serializers.CharField(source='format.format_type', read_only=True)
    title_name = serializers.CharField(source='format.title.title', read_only=True)

    class Meta:
        model = DistributionRecord
        fields = [
            'id', 'format', 'channel', 'channel_name', 'format_type', 'title_name',
            'submission_timestamp', 'live_timestamp', 'channel_status',
            'channel_url', 'channel_asin', 'rejection_reason',
            'exclusivity', 'exclusivity_end_date', 'created_at',
        ]
        read_only_fields = [
            'id', 'submission_timestamp', 'live_timestamp', 'channel_status',
            'channel_url', 'channel_asin', 'rejection_reason', 'created_at',
        ]


class DistributionSubmitSerializer(serializers.Serializer):
    """Serializer for submitting a title to distribution channels."""
    channel_ids = serializers.ListField(
        child=serializers.CharField(max_length=50),
        min_length=1,
        help_text='List of channel IDs to submit to',
    )
    format_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        help_text='List of format IDs to distribute',
    )


class DistributionWithdrawSerializer(serializers.Serializer):
    """Serializer for withdrawing from a distribution channel."""
    record_id = serializers.UUIDField(help_text='Distribution record ID to withdraw')
    reason = serializers.CharField(required=False, default='', help_text='Reason for withdrawal')


class DistributionPricingSerializer(serializers.Serializer):
    """Serializer for updating pricing on live distributions."""
    record_id = serializers.UUIDField(help_text='Distribution record ID')
    new_price = serializers.DecimalField(max_digits=8, decimal_places=2)
    currency = serializers.CharField(max_length=3, default='USD')
