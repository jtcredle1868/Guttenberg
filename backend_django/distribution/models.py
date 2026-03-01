"""
Distribution models — channel management and distribution tracking.
FDD §3.6
"""
import uuid
from django.db import models


class DistributionChannel(models.Model):
    """A retail or library distribution channel per FDD §3.6."""

    class ApiType(models.TextChoices):
        REST = 'rest', 'REST'
        SOAP = 'soap', 'SOAP'
        SFTP = 'sftp', 'SFTP'
        ONIX = 'onix', 'ONIX'

    class AuthMethod(models.TextChoices):
        OAUTH2 = 'oauth2', 'OAuth2'
        API_KEY = 'api_key', 'API Key'
        BASIC = 'basic', 'Basic Auth'
        CERTIFICATE = 'certificate', 'Certificate'

    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    api_type = models.CharField(max_length=20, choices=ApiType.choices)
    auth_method = models.CharField(max_length=20, choices=AuthMethod.choices)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class DistributionRecord(models.Model):
    """Tracks submission and status of a format on a distribution channel."""

    class ChannelStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        LIVE = 'live', 'Live'
        REJECTED = 'rejected', 'Rejected'
        UNLISTED = 'unlisted', 'Unlisted'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    format = models.ForeignKey(
        'formats.Format', on_delete=models.CASCADE, related_name='distributions'
    )
    channel = models.ForeignKey(
        DistributionChannel, on_delete=models.CASCADE, related_name='distributions'
    )
    submission_timestamp = models.DateTimeField(null=True, blank=True)
    live_timestamp = models.DateTimeField(null=True, blank=True)
    channel_status = models.CharField(
        max_length=20, choices=ChannelStatus.choices, default=ChannelStatus.PENDING
    )
    channel_url = models.URLField(blank=True, default='')
    channel_asin = models.CharField(max_length=20, blank=True, default='')
    rejection_reason = models.TextField(blank=True, default='')
    exclusivity = models.BooleanField(default=False)
    exclusivity_end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['format', 'channel']

    def __str__(self):
        return f"{self.format} — {self.channel} ({self.get_channel_status_display()})"
