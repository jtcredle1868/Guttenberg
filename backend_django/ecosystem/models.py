"""
Ecosystem models — activity events and Refinery integration.
FDD SS3.10
"""
import uuid
from django.db import models
from django.contrib.auth.models import User


class ActivityEvent(models.Model):
    """Activity event for Forge widget and Guttenberg activity feed."""

    class EventType(models.TextChoices):
        DISTRIBUTION_LIVE = 'distribution_live', 'Distribution Live'
        DISTRIBUTION_REJECTED = 'distribution_rejected', 'Distribution Rejected'
        SALES_MILESTONE = 'sales_milestone', 'Sales Milestone'
        ROYALTY_DISBURSED = 'royalty_disbursed', 'Royalty Disbursed'
        MARKETING_TASK_DUE = 'marketing_task_due', 'Marketing Task Due'
        FORMAT_COMPLETE = 'format_complete', 'Format Complete'
        ISBN_ASSIGNED = 'isbn_assigned', 'ISBN Assigned'
        NEW_REVIEW = 'new_review', 'New Review'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_events')
    title = models.ForeignKey(
        'titles.Title', on_delete=models.CASCADE,
        null=True, blank=True, related_name='activity_events',
    )
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    message = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_event_type_display()} — {self.user.username} — {self.created_at}"


class RefinerySync(models.Model):
    """Tracks synchronization state between Guttenberg and Refinery."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.ForeignKey(
        'titles.Title', on_delete=models.CASCADE, related_name='refinery_syncs',
    )
    refinery_manuscript_id = models.UUIDField()
    last_synced = models.DateTimeField()
    sync_status = models.CharField(max_length=50)
    evaluation_score = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
    )
    genre_classification = models.CharField(max_length=255, blank=True, default='')
    sync_data = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-last_synced']

    def __str__(self):
        return f"Refinery Sync — {self.title.title} ({self.sync_status})"
