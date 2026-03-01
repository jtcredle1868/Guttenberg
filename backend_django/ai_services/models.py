"""AI Services models — track AI generation requests and results."""
import uuid
from django.db import models
from django.contrib.auth.models import User


class AIGenerationRequest(models.Model):
    """Track all AI generation requests for audit and billing."""

    class RequestType(models.TextChoices):
        SYNOPSIS = 'synopsis', 'Synopsis Generation'
        KEYWORDS = 'keywords', 'Keyword Optimization'
        LAYOUT = 'layout', 'Layout Optimization'
        COVER_CONCEPT = 'cover_concept', 'Cover Concept'
        NARRATION = 'narration', 'AI Narration'
        METADATA = 'metadata', 'Metadata Enhancement'

    class Status(models.TextChoices):
        QUEUED = 'queued', 'Queued'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_requests')
    title = models.ForeignKey('titles.Title', on_delete=models.CASCADE, null=True, blank=True)
    request_type = models.CharField(max_length=20, choices=RequestType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)

    input_data = models.JSONField(default=dict)
    output_data = models.JSONField(default=dict, blank=True)
    model_used = models.CharField(max_length=100, default='claude-sonnet-4-20250514')
    tokens_used = models.IntegerField(default=0)
    cost_usd = models.DecimalField(max_digits=8, decimal_places=4, default=0)
    error_message = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.request_type} — {self.status} ({self.id})"
