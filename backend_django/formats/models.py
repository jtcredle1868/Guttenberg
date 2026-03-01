"""
Format models — book format generation and template management.
FDD §3.4
"""
import uuid
from django.db import models
from django.contrib.auth.models import User


class Format(models.Model):
    """A specific output format (ebook, paperback, etc.) for a Title."""

    class FormatType(models.TextChoices):
        EBOOK = 'ebook', 'eBook'
        PAPERBACK = 'paperback', 'Paperback'
        HARDCOVER = 'hardcover', 'Hardcover'
        AUDIOBOOK = 'audiobook', 'Audiobook'
        LARGE_PRINT = 'large_print', 'Large Print'

    class ISBNSource(models.TextChoices):
        PLATFORM_PURCHASED = 'platform_purchased', 'Platform Purchased'
        AUTHOR_SUPPLIED = 'author_supplied', 'Author Supplied'
        FREE_KDP = 'free_kdp', 'Free KDP'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        READY = 'ready', 'Ready'
        SUBMITTED = 'submitted', 'Submitted'
        LIVE = 'live', 'Live'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.ForeignKey('titles.Title', on_delete=models.CASCADE, related_name='formats')
    format_type = models.CharField(max_length=20, choices=FormatType.choices)
    isbn = models.CharField(max_length=13, null=True, blank=True)
    isbn_source = models.CharField(max_length=20, choices=ISBNSource.choices, blank=True, default='')
    trim_size = models.CharField(max_length=20, null=True, blank=True, help_text='e.g. 6x9')
    page_count = models.IntegerField(null=True, blank=True)
    file_interior = models.FileField(upload_to='formats/interior/%Y/%m/', null=True, blank=True)
    file_cover = models.FileField(upload_to='formats/covers/%Y/%m/', null=True, blank=True)
    list_price_usd = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    channel_pricing = models.JSONField(default=dict, blank=True)
    drm_enabled = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} — {self.get_format_type_display()}"


class FormatJob(models.Model):
    """A format-generation job (PDF, EPUB, MOBI, KFX) per FDD §3.4.2."""

    class JobType(models.TextChoices):
        PDF = 'pdf', 'PDF'
        EPUB = 'epub', 'EPUB'
        MOBI = 'mobi', 'MOBI'
        KFX = 'kfx', 'KFX'

    class Status(models.TextChoices):
        QUEUED = 'queued', 'Queued'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    # Template choices per FDD §3.4.3
    class TemplateName(models.TextChoices):
        MERIDIAN = 'Meridian', 'Meridian'
        VELOCITY = 'Velocity', 'Velocity'
        EMBER = 'Ember', 'Ember'
        CODEX = 'Codex', 'Codex'
        PINNACLE = 'Pinnacle', 'Pinnacle'
        HORIZON = 'Horizon', 'Horizon'
        SPECTRUM = 'Spectrum', 'Spectrum'
        ATLAS = 'Atlas', 'Atlas'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    format = models.ForeignKey(Format, on_delete=models.CASCADE, related_name='jobs')
    job_type = models.CharField(max_length=10, choices=JobType.choices)
    template_name = models.CharField(max_length=50, choices=TemplateName.choices)
    template_config = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)
    progress = models.IntegerField(default=0, help_text='0-100')
    output_file = models.FileField(upload_to='formats/output/%Y/%m/', null=True, blank=True)
    error_message = models.TextField(blank=True, default='')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.format} — {self.get_job_type_display()} ({self.get_status_display()})"
