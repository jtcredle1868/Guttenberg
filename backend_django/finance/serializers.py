"""Finance serializers."""
import datetime
from rest_framework import serializers
from .models import SaleRecord, Disbursement


class SaleRecordSerializer(serializers.ModelSerializer):
    title_name = serializers.CharField(source='title.title', read_only=True)
    channel_name = serializers.CharField(source='channel.name', read_only=True)
    format_type = serializers.CharField(source='format.format_type', read_only=True)

    class Meta:
        model = SaleRecord
        fields = [
            'id', 'title', 'title_name', 'format', 'format_type',
            'channel', 'channel_name', 'sale_date', 'units_sold',
            'gross_revenue', 'royalty_earned', 'currency', 'territory',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class DisbursementSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Disbursement
        fields = [
            'id', 'user', 'username', 'amount', 'currency',
            'payment_method', 'payment_status', 'period_start',
            'period_end', 'created_at',
        ]
        read_only_fields = ['id', 'user', 'payment_status', 'created_at']


class RoyaltyCalculatorRequestSerializer(serializers.Serializer):
    """Serializer for royalty calculation requests per FDD SS3.7.1."""
    price = serializers.DecimalField(max_digits=8, decimal_places=2)
    format_type = serializers.ChoiceField(
        choices=['ebook', 'paperback', 'hardcover'],
        default='ebook',
    )
    printing_cost = serializers.DecimalField(
        max_digits=8, decimal_places=2, required=False, default=0,
        help_text='Printing cost per unit (for print formats)',
    )


class EarningsDashboardFilterSerializer(serializers.Serializer):
    """Serializer for earnings dashboard query parameters."""
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    channel = serializers.CharField(max_length=50, required=False)
    title_id = serializers.UUIDField(required=False)


class DisburseRequestSerializer(serializers.Serializer):
    """Serializer for triggering a disbursement."""
    payment_method = serializers.CharField(max_length=50)
    period_start = serializers.DateField()
    period_end = serializers.DateField()

    def validate(self, data):
        if data['period_start'] > data['period_end']:
            raise serializers.ValidationError(
                'period_start must be before period_end.'
            )
        if data['period_end'] > datetime.date.today():
            raise serializers.ValidationError(
                'period_end cannot be in the future.'
            )
        return data
