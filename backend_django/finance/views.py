"""Finance views — royalty calculations, earnings, and disbursement per FDD SS3.7."""
import csv
from decimal import Decimal

from django.db.models import Sum, Count, F
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SaleRecord, Disbursement
from .serializers import (
    SaleRecordSerializer,
    DisbursementSerializer,
    RoyaltyCalculatorRequestSerializer,
    EarningsDashboardFilterSerializer,
    DisburseRequestSerializer,
)


# Channel royalty rates per FDD SS3.7.1
CHANNEL_ROYALTY_RATES = {
    'amazon_kdp': {
        'ebook': {
            'tiers': [
                {'min_price': Decimal('2.99'), 'max_price': Decimal('9.99'), 'rate': Decimal('0.70')},
            ],
            'default_rate': Decimal('0.35'),
        },
        'paperback': {
            'rate': Decimal('0.60'),
            'deduct_printing_cost': True,
        },
    },
    'ingram_spark': {
        'ebook': {
            'rate': Decimal('0.45'),
        },
        'paperback': {
            'rate': Decimal('0.40'),
            'deduct_printing_cost': True,
        },
        'hardcover': {
            'rate': Decimal('0.40'),
            'deduct_printing_cost': True,
        },
    },
    'apple_books': {
        'ebook': {
            'rate': Decimal('0.70'),
        },
    },
    'kobo': {
        'ebook': {
            'tiers': [
                {'min_price': Decimal('1.99'), 'max_price': Decimal('99999.99'), 'rate': Decimal('0.70')},
            ],
            'default_rate': Decimal('0.45'),
        },
    },
    'barnes_noble': {
        'ebook': {
            'rate': Decimal('0.65'),
        },
        'paperback': {
            'rate': Decimal('0.65'),
        },
    },
    'google_play': {
        'ebook': {
            'rate': Decimal('0.70'),
        },
    },
    'guttenberg_store': {
        'ebook': {
            'rate': Decimal('0.97'),
            'note': '3% processing fee only',
        },
    },
}


def _calculate_royalty(channel_id, format_type, price, printing_cost=Decimal('0')):
    """Calculate royalty for a given channel, format, and price."""
    channel_rates = CHANNEL_ROYALTY_RATES.get(channel_id, {})
    format_rates = channel_rates.get(format_type)

    if format_rates is None:
        return None

    # Determine the applicable rate
    rate = format_rates.get('rate')

    # Check for tiered pricing
    tiers = format_rates.get('tiers', [])
    for tier in tiers:
        if tier['min_price'] <= price <= tier['max_price']:
            rate = tier['rate']
            break
    else:
        if tiers:
            rate = format_rates.get('default_rate', rate)

    if rate is None:
        return None

    # Calculate royalty
    if format_rates.get('deduct_printing_cost', False):
        royalty = (price - printing_cost) * rate
    else:
        royalty = price * rate

    return max(royalty, Decimal('0'))


class FinanceViewSet(viewsets.GenericViewSet):
    """
    Finance endpoints per FDD SS3.7.

    royalty_calculator: POST /api/v1/finance/royalty-calculator/
    earnings_dashboard: GET  /api/v1/finance/earnings/
    sales_by_channel:   GET  /api/v1/finance/sales-by-channel/
    sales_by_territory: GET  /api/v1/finance/sales-by-territory/
    export:             GET  /api/v1/finance/export/
    disburse:           POST /api/v1/finance/disburse/
    """
    permission_classes = [IsAuthenticated]

    def _get_filtered_sales(self, request):
        """Get sales queryset filtered by query parameters."""
        queryset = SaleRecord.objects.filter(
            title__user=request.user
        ).select_related('title', 'format', 'channel')

        filter_serializer = EarningsDashboardFilterSerializer(data=request.query_params)
        filter_serializer.is_valid(raise_exception=True)
        filters = filter_serializer.validated_data

        if 'date_from' in filters:
            queryset = queryset.filter(sale_date__gte=filters['date_from'])
        if 'date_to' in filters:
            queryset = queryset.filter(sale_date__lte=filters['date_to'])
        if 'channel' in filters:
            queryset = queryset.filter(channel_id=filters['channel'])
        if 'title_id' in filters:
            queryset = queryset.filter(title_id=filters['title_id'])

        return queryset

    @action(detail=False, methods=['post'], url_path='royalty-calculator')
    def royalty_calculator(self, request):
        """
        Calculate royalties for a given price across all channels per FDD SS3.7.1.

        Returns a breakdown table showing estimated royalty per channel.
        """
        serializer = RoyaltyCalculatorRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        price = serializer.validated_data['price']
        format_type = serializer.validated_data['format_type']
        printing_cost = serializer.validated_data.get('printing_cost', Decimal('0'))

        breakdown = []
        for channel_id, channel_rates in CHANNEL_ROYALTY_RATES.items():
            royalty = _calculate_royalty(channel_id, format_type, price, printing_cost)
            if royalty is not None:
                format_rates = channel_rates.get(format_type, {})
                rate = format_rates.get('rate')

                # Determine effective rate for tiered channels
                tiers = format_rates.get('tiers', [])
                effective_rate = None
                for tier in tiers:
                    if tier['min_price'] <= price <= tier['max_price']:
                        effective_rate = tier['rate']
                        break
                if effective_rate is None and tiers:
                    effective_rate = format_rates.get('default_rate', rate)
                elif effective_rate is None:
                    effective_rate = rate

                entry = {
                    'channel': channel_id,
                    'format_type': format_type,
                    'list_price': str(price),
                    'royalty_rate': str(effective_rate),
                    'royalty_amount': str(royalty.quantize(Decimal('0.01'))),
                }
                if format_rates.get('deduct_printing_cost', False):
                    entry['printing_cost'] = str(printing_cost)
                    entry['net_after_printing'] = str(
                        (price - printing_cost).quantize(Decimal('0.01'))
                    )
                note = format_rates.get('note')
                if note:
                    entry['note'] = note
                breakdown.append(entry)

        return Response({
            'price': str(price),
            'format_type': format_type,
            'printing_cost': str(printing_cost),
            'breakdown': breakdown,
        })

    @action(detail=False, methods=['get'], url_path='earnings')
    def earnings_dashboard(self, request):
        """
        Consolidated earnings dashboard with filtering per FDD SS3.7.

        Query params: date_from, date_to, channel, title_id
        """
        queryset = self._get_filtered_sales(request)

        totals = queryset.aggregate(
            total_units=Sum('units_sold'),
            total_gross_revenue=Sum('gross_revenue'),
            total_royalty_earned=Sum('royalty_earned'),
            sale_count=Count('id'),
        )

        # Per-title breakdown
        by_title = queryset.values(
            'title__id', 'title__title'
        ).annotate(
            units=Sum('units_sold'),
            gross_revenue=Sum('gross_revenue'),
            royalty_earned=Sum('royalty_earned'),
        ).order_by('-royalty_earned')

        return Response({
            'totals': {
                'units_sold': totals['total_units'] or 0,
                'gross_revenue': str(totals['total_gross_revenue'] or Decimal('0')),
                'royalty_earned': str(totals['total_royalty_earned'] or Decimal('0')),
                'sale_records': totals['sale_count'] or 0,
            },
            'by_title': [
                {
                    'title_id': str(row['title__id']),
                    'title': row['title__title'],
                    'units_sold': row['units'],
                    'gross_revenue': str(row['gross_revenue']),
                    'royalty_earned': str(row['royalty_earned']),
                }
                for row in by_title
            ],
        })

    @action(detail=False, methods=['get'], url_path='sales-by-channel')
    def sales_by_channel(self, request):
        """Sales breakdown by distribution channel."""
        queryset = self._get_filtered_sales(request)

        by_channel = queryset.values(
            'channel__id', 'channel__name'
        ).annotate(
            units=Sum('units_sold'),
            gross_revenue=Sum('gross_revenue'),
            royalty_earned=Sum('royalty_earned'),
            sale_count=Count('id'),
        ).order_by('-gross_revenue')

        return Response({
            'channels': [
                {
                    'channel_id': row['channel__id'],
                    'channel_name': row['channel__name'],
                    'units_sold': row['units'],
                    'gross_revenue': str(row['gross_revenue']),
                    'royalty_earned': str(row['royalty_earned']),
                    'sale_records': row['sale_count'],
                }
                for row in by_channel
            ],
        })

    @action(detail=False, methods=['get'], url_path='sales-by-territory')
    def sales_by_territory(self, request):
        """Geographic sales data breakdown."""
        queryset = self._get_filtered_sales(request)

        by_territory = queryset.values(
            'territory'
        ).annotate(
            units=Sum('units_sold'),
            gross_revenue=Sum('gross_revenue'),
            royalty_earned=Sum('royalty_earned'),
            sale_count=Count('id'),
        ).order_by('-gross_revenue')

        return Response({
            'territories': [
                {
                    'territory': row['territory'],
                    'units_sold': row['units'],
                    'gross_revenue': str(row['gross_revenue']),
                    'royalty_earned': str(row['royalty_earned']),
                    'sale_records': row['sale_count'],
                }
                for row in by_territory
            ],
        })

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export earnings data as CSV."""
        queryset = self._get_filtered_sales(request)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="guttenberg_earnings.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Sale Date', 'Title', 'Format', 'Channel',
            'Units Sold', 'Gross Revenue', 'Royalty Earned',
            'Currency', 'Territory',
        ])

        for sale in queryset.order_by('-sale_date'):
            writer.writerow([
                sale.sale_date.isoformat(),
                sale.title.title,
                sale.format.format_type,
                sale.channel.name,
                sale.units_sold,
                str(sale.gross_revenue),
                str(sale.royalty_earned),
                sale.currency,
                sale.territory,
            ])

        return response

    @action(detail=False, methods=['post'])
    def disburse(self, request):
        """Trigger a royalty disbursement."""
        serializer = DisburseRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        period_start = serializer.validated_data['period_start']
        period_end = serializer.validated_data['period_end']
        payment_method = serializer.validated_data['payment_method']

        # Calculate total owed for the period
        sales = SaleRecord.objects.filter(
            title__user=request.user,
            sale_date__gte=period_start,
            sale_date__lte=period_end,
        )

        totals = sales.aggregate(
            total_royalty=Sum('royalty_earned'),
        )
        total_amount = totals['total_royalty'] or Decimal('0')

        if total_amount <= 0:
            return Response(
                {'error': 'No earnings to disburse for the specified period.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check for existing disbursement in the same period
        existing = Disbursement.objects.filter(
            user=request.user,
            period_start=period_start,
            period_end=period_end,
            payment_status__in=[
                Disbursement.PaymentStatus.PENDING,
                Disbursement.PaymentStatus.PROCESSING,
                Disbursement.PaymentStatus.COMPLETED,
            ],
        ).exists()

        if existing:
            return Response(
                {'error': 'A disbursement already exists for this period.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        disbursement = Disbursement.objects.create(
            user=request.user,
            amount=total_amount,
            currency='USD',
            payment_method=payment_method,
            payment_status=Disbursement.PaymentStatus.PENDING,
            period_start=period_start,
            period_end=period_end,
        )

        return Response(
            {
                'message': 'Disbursement created successfully.',
                'disbursement': DisbursementSerializer(disbursement).data,
            },
            status=status.HTTP_201_CREATED,
        )
