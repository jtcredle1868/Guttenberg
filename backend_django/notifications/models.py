"""
Notifications models — user notification delivery and preferences.
"""
import uuid
from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):
    """A notification delivered to a user via one or more channels."""

    class Channel(models.TextChoices):
        IN_APP = 'in_app', 'In-App'
        EMAIL = 'email', 'Email'
        PUSH = 'push', 'Push'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    event = models.ForeignKey(
        'ecosystem.ActivityEvent', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='notifications',
    )
    channel = models.CharField(max_length=10, choices=Channel.choices, default=Channel.IN_APP)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} — {self.user.username} ({self.get_channel_display()})"


class NotificationPreference(models.Model):
    """Per-user notification preferences."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='notification_preferences',
    )
    email_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=True)
    in_app_enabled = models.BooleanField(default=True)
    distribution_updates = models.BooleanField(default=True)
    sales_milestones = models.BooleanField(default=True)
    royalty_disbursements = models.BooleanField(default=True)
    marketing_reminders = models.BooleanField(default=True)
    format_updates = models.BooleanField(default=True)
    review_alerts = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'notification preferences'

    def __str__(self):
        return f"Notification Preferences — {self.user.username}"
