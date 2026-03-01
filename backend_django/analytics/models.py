"""
Analytics models — snapshot-based KPI tracking and Amazon rank history.
FDD §3.12
"""
import uuid
from django.db import models
from django.contrib.auth.models import User


class AnalyticsSnapshot(models.Model):
    """Point-in-time analytics snapshot aggregating sales data."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.ForeignKey(
        'titles.Title', on_delete=models.CASCADE,
        null=True, blank=True, related_name='analytics_snapshots',
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics_snapshots')
    snapshot_date = models.DateField()
    total_units = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_royalties = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    channel_breakdown = models.JSONField(default=dict, blank=True)
    territory_breakdown = models.JSONField(default=dict, blank=True)
    format_breakdown = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-snapshot_date']

    def __str__(self):
        title_str = self.title.title if self.title else 'All Titles'
        return f"{self.user.username} — {title_str} — {self.snapshot_date}"


class AmazonRankHistory(models.Model):
    """Amazon bestseller rank tracking over time."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.ForeignKey(
        'titles.Title', on_delete=models.CASCADE, related_name='rank_history',
    )
    rank = models.IntegerField()
    category = models.CharField(max_length=200)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']

    def __str__(self):
        return f"{self.title.title} — #{self.rank} in {self.category}"
