"""Analytics views — dashboard KPIs, time series, and export per FDD §3.12."""
import csv
from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from titles.models import Title
from .models import AnalyticsSnapshot, AmazonRankHistory
from .serializers import (
    AnalyticsSnapshotSerializer,
    AmazonRankHistorySerializer,
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overview(request):
    """
    GET /api/v1/analytics/overview/

    Summary KPIs: total units, revenue, royalties, active channels, active titles.
    """
    snapshots = AnalyticsSnapshot.objects.filter(user=request.user)
    aggregates = snapshots.aggregate(
        total_units=Sum('total_units'),
        total_revenue=Sum('total_revenue'),
        total_royalties=Sum('total_royalties'),
    )

    active_titles = Title.objects.filter(user=request.user, status='live').count()

    # Count distinct channels from channel_breakdown keys
    channel_set = set()
    for snapshot in snapshots.exclude(channel_breakdown={}):
        channel_set.update(snapshot.channel_breakdown.keys())

    return Response({
        'total_units': aggregates['total_units'] or 0,
        'total_revenue': str(aggregates['total_revenue'] or Decimal('0.00')),
        'total_royalties': str(aggregates['total_royalties'] or Decimal('0.00')),
        'active_channels': len(channel_set),
        'active_titles': active_titles,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_time_series(request):
    """
    GET /api/v1/analytics/time-series/

    Query params: start_date, end_date, granularity (daily/weekly/monthly).
    Returns time series data for charting.
    """
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    granularity = request.query_params.get('granularity', 'daily')

    snapshots = AnalyticsSnapshot.objects.filter(user=request.user)

    if start_date:
        snapshots = snapshots.filter(snapshot_date__gte=start_date)
    if end_date:
        snapshots = snapshots.filter(snapshot_date__lte=end_date)

    trunc_map = {
        'daily': TruncDay('snapshot_date'),
        'weekly': TruncWeek('snapshot_date'),
        'monthly': TruncMonth('snapshot_date'),
    }
    trunc_fn = trunc_map.get(granularity, TruncDay('snapshot_date'))

    time_series = (
        snapshots
        .annotate(period=trunc_fn)
        .values('period')
        .annotate(
            units=Sum('total_units'),
            revenue=Sum('total_revenue'),
            royalties=Sum('total_royalties'),
        )
        .order_by('period')
    )

    data = [
        {
            'date': entry['period'].isoformat() if entry['period'] else None,
            'units': entry['units'] or 0,
            'revenue': str(entry['revenue'] or Decimal('0.00')),
            'royalties': str(entry['royalties'] or Decimal('0.00')),
        }
        for entry in time_series
    ]

    return Response({
        'granularity': granularity,
        'start_date': start_date,
        'end_date': end_date,
        'data': data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_by_channel(request):
    """
    GET /api/v1/analytics/by-channel/

    Donut chart data — aggregate channel_breakdown across all snapshots.
    """
    snapshots = AnalyticsSnapshot.objects.filter(user=request.user)
    channel_totals = {}

    for snapshot in snapshots.exclude(channel_breakdown={}):
        for channel, data in snapshot.channel_breakdown.items():
            if channel not in channel_totals:
                channel_totals[channel] = {'units': 0, 'revenue': Decimal('0.00')}
            channel_totals[channel]['units'] += data.get('units', 0)
            channel_totals[channel]['revenue'] += Decimal(str(data.get('revenue', 0)))

    result = [
        {
            'channel': channel,
            'units': totals['units'],
            'revenue': str(totals['revenue']),
        }
        for channel, totals in channel_totals.items()
    ]

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_by_territory(request):
    """
    GET /api/v1/analytics/by-territory/

    Geographic breakdown of sales data.
    """
    snapshots = AnalyticsSnapshot.objects.filter(user=request.user)
    territory_totals = {}

    for snapshot in snapshots.exclude(territory_breakdown={}):
        for territory, data in snapshot.territory_breakdown.items():
            if territory not in territory_totals:
                territory_totals[territory] = {'units': 0, 'revenue': Decimal('0.00')}
            territory_totals[territory]['units'] += data.get('units', 0)
            territory_totals[territory]['revenue'] += Decimal(str(data.get('revenue', 0)))

    result = [
        {
            'territory': territory,
            'units': totals['units'],
            'revenue': str(totals['revenue']),
        }
        for territory, totals in territory_totals.items()
    ]

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_by_format(request):
    """
    GET /api/v1/analytics/by-format/

    Format type breakdown of sales data.
    """
    snapshots = AnalyticsSnapshot.objects.filter(user=request.user)
    format_totals = {}

    for snapshot in snapshots.exclude(format_breakdown={}):
        for fmt, data in snapshot.format_breakdown.items():
            if fmt not in format_totals:
                format_totals[fmt] = {'units': 0, 'revenue': Decimal('0.00')}
            format_totals[fmt]['units'] += data.get('units', 0)
            format_totals[fmt]['revenue'] += Decimal(str(data.get('revenue', 0)))

    result = [
        {
            'format': fmt,
            'units': totals['units'],
            'revenue': str(totals['revenue']),
        }
        for fmt, totals in format_totals.items()
    ]

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rank_history(request, title_id):
    """
    GET /api/v1/analytics/rank-history/{title_id}/

    Amazon rank history for a specific title.
    """
    try:
        title = Title.objects.get(id=title_id, user=request.user)
    except Title.DoesNotExist:
        return Response({'error': 'Title not found.'}, status=404)

    ranks = AmazonRankHistory.objects.filter(title=title)

    # Optional date range filtering
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    if start_date:
        ranks = ranks.filter(recorded_at__date__gte=start_date)
    if end_date:
        ranks = ranks.filter(recorded_at__date__lte=end_date)

    serializer = AmazonRankHistorySerializer(ranks, many=True)
    return Response({
        'title_id': str(title.id),
        'title': title.title,
        'rank_history': serializer.data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def title_summary(request, title_id):
    """
    GET /api/v1/analytics/title/{title_id}/

    All KPIs for one specific title.
    """
    try:
        title = Title.objects.get(id=title_id, user=request.user)
    except Title.DoesNotExist:
        return Response({'error': 'Title not found.'}, status=404)

    snapshots = AnalyticsSnapshot.objects.filter(user=request.user, title=title)
    aggregates = snapshots.aggregate(
        total_units=Sum('total_units'),
        total_revenue=Sum('total_revenue'),
        total_royalties=Sum('total_royalties'),
    )

    latest_snapshot = snapshots.first()
    latest_rank = AmazonRankHistory.objects.filter(title=title).first()

    return Response({
        'title_id': str(title.id),
        'title': title.title,
        'status': title.status,
        'total_units': aggregates['total_units'] or 0,
        'total_revenue': str(aggregates['total_revenue'] or Decimal('0.00')),
        'total_royalties': str(aggregates['total_royalties'] or Decimal('0.00')),
        'channel_breakdown': latest_snapshot.channel_breakdown if latest_snapshot else {},
        'territory_breakdown': latest_snapshot.territory_breakdown if latest_snapshot else {},
        'format_breakdown': latest_snapshot.format_breakdown if latest_snapshot else {},
        'latest_amazon_rank': {
            'rank': latest_rank.rank,
            'category': latest_rank.category,
            'recorded_at': latest_rank.recorded_at.isoformat(),
        } if latest_rank else None,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export(request):
    """
    GET /api/v1/analytics/export/

    Export analytics snapshots as CSV.
    Query params: start_date, end_date, title_id.
    """
    snapshots = AnalyticsSnapshot.objects.filter(user=request.user)

    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    title_id = request.query_params.get('title_id')

    if start_date:
        snapshots = snapshots.filter(snapshot_date__gte=start_date)
    if end_date:
        snapshots = snapshots.filter(snapshot_date__lte=end_date)
    if title_id:
        snapshots = snapshots.filter(title_id=title_id)

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="analytics_export.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'Snapshot Date', 'Title', 'Total Units',
        'Total Revenue', 'Total Royalties',
    ])

    for snapshot in snapshots.select_related('title'):
        writer.writerow([
            snapshot.snapshot_date.isoformat(),
            snapshot.title.title if snapshot.title else 'All Titles',
            snapshot.total_units,
            snapshot.total_revenue,
            snapshot.total_royalties,
        ])

    return response
