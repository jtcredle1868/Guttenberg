"""Distribution views — channel management and submission endpoints per FDD §3.6."""
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from titles.models import Title
from formats.models import Format
from .models import DistributionChannel, DistributionRecord
from .serializers import (
    DistributionChannelSerializer,
    DistributionRecordSerializer,
    DistributionSubmitSerializer,
    DistributionWithdrawSerializer,
    DistributionPricingSerializer,
)


# Seed channel data per FDD §3.6
CHANNEL_SEED_DATA = [
    {'id': 'amazon_kdp', 'name': 'Amazon KDP', 'api_type': 'rest', 'auth_method': 'oauth2'},
    {'id': 'ingram_spark', 'name': 'IngramSpark', 'api_type': 'onix', 'auth_method': 'api_key'},
    {'id': 'apple_books', 'name': 'Apple Books', 'api_type': 'rest', 'auth_method': 'oauth2'},
    {'id': 'kobo', 'name': 'Kobo', 'api_type': 'rest', 'auth_method': 'api_key'},
    {'id': 'barnes_noble', 'name': 'Barnes & Noble', 'api_type': 'rest', 'auth_method': 'api_key'},
    {'id': 'google_play', 'name': 'Google Play Books', 'api_type': 'rest', 'auth_method': 'oauth2'},
    {'id': 'overdrive', 'name': 'OverDrive', 'api_type': 'rest', 'auth_method': 'api_key'},
    {'id': 'bibliotheca', 'name': 'Bibliotheca', 'api_type': 'sftp', 'auth_method': 'certificate'},
]

# Channel requirements for readiness validation
CHANNEL_REQUIREMENTS = {
    'amazon_kdp': {
        'formats': ['ebook', 'paperback'],
        'requires_isbn': False,
        'min_description_length': 50,
        'max_description_length': 4000,
        'min_bisac_codes': 1,
    },
    'ingram_spark': {
        'formats': ['ebook', 'paperback', 'hardcover'],
        'requires_isbn': True,
        'min_description_length': 100,
        'max_description_length': 5000,
        'min_bisac_codes': 2,
    },
    'apple_books': {
        'formats': ['ebook'],
        'requires_isbn': True,
        'min_description_length': 50,
        'max_description_length': 4000,
        'min_bisac_codes': 1,
    },
    'kobo': {
        'formats': ['ebook'],
        'requires_isbn': True,
        'min_description_length': 50,
        'max_description_length': 5000,
        'min_bisac_codes': 1,
    },
    'barnes_noble': {
        'formats': ['ebook', 'paperback'],
        'requires_isbn': True,
        'min_description_length': 50,
        'max_description_length': 5000,
        'min_bisac_codes': 1,
    },
    'google_play': {
        'formats': ['ebook'],
        'requires_isbn': False,
        'min_description_length': 50,
        'max_description_length': 4000,
        'min_bisac_codes': 1,
    },
    'overdrive': {
        'formats': ['ebook', 'audiobook'],
        'requires_isbn': True,
        'min_description_length': 100,
        'max_description_length': 5000,
        'min_bisac_codes': 1,
    },
    'bibliotheca': {
        'formats': ['ebook'],
        'requires_isbn': True,
        'min_description_length': 100,
        'max_description_length': 4000,
        'min_bisac_codes': 1,
    },
}


class DistributionChannelViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Distribution channel endpoints.

    list: GET /api/v1/distribution/channels/
    read: GET /api/v1/distribution/channels/{id}/
    """
    queryset = DistributionChannel.objects.filter(is_active=True)
    serializer_class = DistributionChannelSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """List all distribution channels with their requirements."""
        channels = self.get_queryset()
        data = []
        for channel in channels:
            serialized = DistributionChannelSerializer(channel).data
            serialized['requirements'] = CHANNEL_REQUIREMENTS.get(channel.id, {})
            data.append(serialized)
        return Response(data)


class DistributionViewSet(viewsets.GenericViewSet):
    """
    Distribution management endpoints per FDD §3.6.

    submit:  POST /api/v1/distribution/titles/{title_id}/submit/
    status:  GET  /api/v1/distribution/titles/{title_id}/status/
    withdraw: POST /api/v1/distribution/withdraw/
    pricing: PUT  /api/v1/distribution/pricing/
    """
    permission_classes = [IsAuthenticated]

    def _get_title(self, request, title_id):
        """Get a title owned by the requesting user."""
        try:
            return Title.objects.get(id=title_id, user=request.user)
        except Title.DoesNotExist:
            return None

    def _validate_readiness(self, title, channel_id, format_obj):
        """Validate that a title/format is ready for a specific channel."""
        errors = []
        requirements = CHANNEL_REQUIREMENTS.get(channel_id, {})

        if format_obj.format_type not in requirements.get('formats', []):
            errors.append(
                f"Format type '{format_obj.format_type}' not supported by channel '{channel_id}'."
            )

        if requirements.get('requires_isbn') and not format_obj.isbn:
            errors.append(f"ISBN required for channel '{channel_id}'.")

        min_desc = requirements.get('min_description_length', 0)
        if len(title.synopsis_short) < min_desc and len(title.synopsis_long) < min_desc:
            errors.append(
                f"Description must be at least {min_desc} characters for channel '{channel_id}'."
            )

        min_bisac = requirements.get('min_bisac_codes', 0)
        if len(title.bisac_codes) < min_bisac:
            errors.append(
                f"At least {min_bisac} BISAC code(s) required for channel '{channel_id}'."
            )

        if not title.primary_author:
            errors.append('Primary author is required.')

        return errors

    @action(detail=False, methods=['post'], url_path='titles/(?P<title_id>[^/.]+)/submit')
    def submit(self, request, title_id=None):
        """Submit a title to selected distribution channels per FDD §3.6."""
        title = self._get_title(request, title_id)
        if title is None:
            return Response(
                {'error': 'Title not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DistributionSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        channel_ids = serializer.validated_data['channel_ids']
        format_ids = serializer.validated_data['format_ids']

        # Validate channels exist
        channels = DistributionChannel.objects.filter(id__in=channel_ids, is_active=True)
        if channels.count() != len(channel_ids):
            found_ids = set(channels.values_list('id', flat=True))
            missing = set(channel_ids) - found_ids
            return Response(
                {'error': f"Invalid or inactive channels: {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate formats belong to this title
        formats = Format.objects.filter(id__in=format_ids, title=title)
        if formats.count() != len(format_ids):
            return Response(
                {'error': 'One or more format IDs do not belong to this title.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate readiness for each channel/format combination
        all_errors = {}
        for channel in channels:
            for fmt in formats:
                errors = self._validate_readiness(title, channel.id, fmt)
                if errors:
                    key = f"{channel.id}:{fmt.id}"
                    all_errors[key] = errors

        if all_errors:
            return Response(
                {'error': 'Readiness validation failed.', 'details': all_errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create distribution records and queue Celery tasks
        records = []
        for channel in channels:
            for fmt in formats:
                record, created = DistributionRecord.objects.get_or_create(
                    format=fmt,
                    channel=channel,
                    defaults={
                        'channel_status': DistributionRecord.ChannelStatus.SUBMITTED,
                        'submission_timestamp': timezone.now(),
                    },
                )
                if not created:
                    if record.channel_status in (
                        DistributionRecord.ChannelStatus.REJECTED,
                        DistributionRecord.ChannelStatus.UNLISTED,
                    ):
                        record.channel_status = DistributionRecord.ChannelStatus.SUBMITTED
                        record.submission_timestamp = timezone.now()
                        record.rejection_reason = ''
                        record.save()
                    else:
                        continue  # Skip already-submitted records

                records.append(record)

                # Queue Celery distribution task
                from celery_workers.distribution_tasks import submit_to_channel
                submit_to_channel.delay(str(record.id))

        return Response(
            {
                'message': f"Submitted to {len(records)} channel/format combination(s).",
                'records': DistributionRecordSerializer(records, many=True).data,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=False, methods=['get'], url_path='titles/(?P<title_id>[^/.]+)/status')
    def distribution_status(self, request, title_id=None):
        """Get all distribution statuses for a title per FDD §3.6."""
        title = self._get_title(request, title_id)
        if title is None:
            return Response(
                {'error': 'Title not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        records = DistributionRecord.objects.filter(
            format__title=title
        ).select_related('channel', 'format')

        return Response({
            'title_id': str(title.id),
            'title': title.title,
            'distributions': DistributionRecordSerializer(records, many=True).data,
            'summary': {
                'total': records.count(),
                'live': records.filter(
                    channel_status=DistributionRecord.ChannelStatus.LIVE
                ).count(),
                'pending': records.filter(
                    channel_status__in=[
                        DistributionRecord.ChannelStatus.PENDING,
                        DistributionRecord.ChannelStatus.SUBMITTED,
                        DistributionRecord.ChannelStatus.UNDER_REVIEW,
                    ]
                ).count(),
                'rejected': records.filter(
                    channel_status=DistributionRecord.ChannelStatus.REJECTED
                ).count(),
            },
        })

    @action(detail=False, methods=['post'])
    def withdraw(self, request):
        """Withdraw a title from a distribution channel."""
        serializer = DistributionWithdrawSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            record = DistributionRecord.objects.select_related(
                'format__title', 'channel'
            ).get(
                id=serializer.validated_data['record_id'],
                format__title__user=request.user,
            )
        except DistributionRecord.DoesNotExist:
            return Response(
                {'error': 'Distribution record not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if record.channel_status == DistributionRecord.ChannelStatus.UNLISTED:
            return Response(
                {'error': 'Already unlisted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        record.channel_status = DistributionRecord.ChannelStatus.UNLISTED
        record.save()

        return Response({
            'message': f"Withdrawn from {record.channel.name}.",
            'record': DistributionRecordSerializer(record).data,
        })

    @action(detail=False, methods=['put'])
    def pricing(self, request):
        """Update pricing on a live distribution."""
        serializer = DistributionPricingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            record = DistributionRecord.objects.select_related(
                'format__title', 'channel'
            ).get(
                id=serializer.validated_data['record_id'],
                format__title__user=request.user,
            )
        except DistributionRecord.DoesNotExist:
            return Response(
                {'error': 'Distribution record not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if record.channel_status != DistributionRecord.ChannelStatus.LIVE:
            return Response(
                {'error': 'Pricing can only be updated on live distributions.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update format pricing
        fmt = record.format
        new_price = serializer.validated_data['new_price']
        currency = serializer.validated_data['currency']

        if currency == 'USD':
            fmt.list_price_usd = new_price
        channel_pricing = fmt.channel_pricing or {}
        channel_pricing[record.channel.id] = {
            'price': str(new_price),
            'currency': currency,
        }
        fmt.channel_pricing = channel_pricing
        fmt.save()

        return Response({
            'message': f"Pricing updated on {record.channel.name}.",
            'record': DistributionRecordSerializer(record).data,
            'new_price': str(new_price),
            'currency': currency,
        })
