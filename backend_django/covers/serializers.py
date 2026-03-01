"""Cover serializers."""
from rest_framework import serializers
from .models import Cover


class CoverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cover
        fields = [
            'id', 'title', 'format', 'file', 'file_type',
            'resolution_dpi', 'color_mode', 'width_px', 'height_px',
            'file_size', 'validation_status', 'validation_report',
            'has_barcode', 'created_at',
        ]
        read_only_fields = [
            'id', 'file_type', 'resolution_dpi', 'color_mode',
            'width_px', 'height_px', 'file_size', 'validation_status',
            'validation_report', 'has_barcode', 'created_at',
        ]


class CoverUploadSerializer(serializers.Serializer):
    """Serializer for uploading a cover file."""
    title_id = serializers.UUIDField()
    format_id = serializers.UUIDField(required=False, allow_null=True)
    file = serializers.FileField()


class CoverValidateSerializer(serializers.Serializer):
    """Serializer for requesting cover validation."""
    cover_id = serializers.UUIDField()


class CoverBarcodeSerializer(serializers.Serializer):
    """Serializer for barcode injection request."""
    cover_id = serializers.UUIDField()
    isbn = serializers.CharField(max_length=13, min_length=13)
    position = serializers.ChoiceField(
        choices=[
            ('bottom_right', 'Bottom Right'),
            ('bottom_left', 'Bottom Left'),
            ('bottom_center', 'Bottom Center'),
        ],
        default='bottom_right',
    )


class CoverGenerateVariantsSerializer(serializers.Serializer):
    """Serializer for generating cover format variants."""
    cover_id = serializers.UUIDField()
    target_formats = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            ('ebook', 'eBook'),
            ('paperback', 'Paperback'),
            ('hardcover', 'Hardcover'),
            ('audiobook', 'Audiobook'),
            ('large_print', 'Large Print'),
        ]),
        help_text='List of format types to generate variants for.',
    )
