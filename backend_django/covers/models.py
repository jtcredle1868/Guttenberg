"""
Cover models — cover file management, validation, and barcode injection.
FDD §3.5
"""
import uuid
from django.db import models


class Cover(models.Model):
    """A cover image linked to a Title and optionally a specific Format."""

    class ValidationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VALID = 'valid', 'Valid'
        INVALID = 'invalid', 'Invalid'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.ForeignKey(
        'titles.Title', on_delete=models.CASCADE, related_name='covers'
    )
    format = models.ForeignKey(
        'formats.Format', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='covers',
    )
    file = models.FileField(upload_to='covers/%Y/%m/')
    file_type = models.CharField(max_length=20, help_text='e.g. png, jpg, tiff, pdf')
    resolution_dpi = models.IntegerField(default=0)
    color_mode = models.CharField(max_length=20, blank=True, default='', help_text='e.g. RGB, CMYK')
    width_px = models.IntegerField(default=0)
    height_px = models.IntegerField(default=0)
    file_size = models.BigIntegerField(default=0, help_text='File size in bytes')
    validation_status = models.CharField(
        max_length=20, choices=ValidationStatus.choices, default=ValidationStatus.PENDING,
    )
    validation_report = models.JSONField(default=dict, blank=True)
    has_barcode = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Cover for {self.title} ({self.file_type}, {self.width_px}x{self.height_px})"
