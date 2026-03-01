"""Analytics serializers."""
from rest_framework import serializers
from .models import AnalyticsSnapshot, AmazonRankHistory


class AnalyticsSnapshotSerializer(serializers.ModelSerializer):
    title_name = serializers.CharField(source='title.title', read_only=True, default=None)

    class Meta:
        model = AnalyticsSnapshot
        fields = [
            'id', 'title', 'title_name', 'snapshot_date',
            'total_units', 'total_revenue', 'total_royalties',
            'channel_breakdown', 'territory_breakdown', 'format_breakdown',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class AmazonRankHistorySerializer(serializers.ModelSerializer):
    title_name = serializers.CharField(source='title.title', read_only=True)

    class Meta:
        model = AmazonRankHistory
        fields = ['id', 'title', 'title_name', 'rank', 'category', 'recorded_at']
        read_only_fields = ['id', 'recorded_at']


class OverviewSerializer(serializers.Serializer):
    """Serializer for the analytics overview response."""
    total_units = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_royalties = serializers.DecimalField(max_digits=10, decimal_places=2)
    active_channels = serializers.IntegerField()
    active_titles = serializers.IntegerField()


class TimeSeriesPointSerializer(serializers.Serializer):
    """Single data point in a time series."""
    date = serializers.CharField()
    units = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    royalties = serializers.DecimalField(max_digits=10, decimal_places=2)


class ExportParamsSerializer(serializers.Serializer):
    """Query params for CSV export."""
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    title_id = serializers.UUIDField(required=False)
