"""ISBN service serializers."""
from rest_framework import serializers
from .models import ISBNRecord


class ISBNRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ISBNRecord
        fields = [
            'id', 'format', 'isbn', 'isbn_source', 'purchase_price',
            'purchased_at', 'bowker_registered', 'registration_status',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ISBNPurchaseSerializer(serializers.Serializer):
    """Serializer for purchasing ISBNs through the platform."""
    format_id = serializers.UUIDField()
    quantity = serializers.ChoiceField(
        choices=[(1, 'Single — $15'), (10, '10-Pack — $75'), (100, '100-Pack — $250')],
        help_text='Number of ISBNs to purchase',
    )
    stripe_token = serializers.CharField(
        help_text='Stripe payment token for processing',
    )


class ISBNValidateSerializer(serializers.Serializer):
    """Serializer for ISBN-13 validation."""
    isbn = serializers.CharField(max_length=13, min_length=13)


class ISBNAssignSerializer(serializers.Serializer):
    """Serializer for assigning an author-supplied ISBN to a format."""
    format_id = serializers.UUIDField()
    isbn = serializers.CharField(max_length=13, min_length=13)
