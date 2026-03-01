"""
Manuscript models — file management, versioning, and preflight validation.
FDD §3.1
"""
import uuid
from django.db import models
from django.contrib.auth.models import User


class Manuscript(models.Model):
    """Manuscript record linked to a Title."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.ForeignKey('titles.Title', on_delete=models.CASCADE, related_name='manuscripts')
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    file = models.FileField(upload_to='manuscripts/%Y/%m/', null=True, blank=True)
    original_filename = models.CharField(max_length=500)
    file_format = models.CharField(max_length=10)  # .docx, .pdf, etc.
    file_size = models.BigIntegerField(default=0)  # bytes

    source = models.CharField(max_length=20, choices=[
        ('upload', 'Direct Upload'),
        ('refinery', 'Refinery Import'),
        ('google_drive', 'Google Drive'),
    ], default='upload')

    word_count = models.IntegerField(default=0)
    chapter_count = models.IntegerField(default=0)
    chapter_outline = models.JSONField(default=list, blank=True)

    preflight_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('passed', 'Passed'),
        ('warnings', 'Passed with Warnings'),
        ('failed', 'Failed'),
    ], default='pending')
    preflight_report = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.original_filename} (v{self.versions.count()})"


class ManuscriptVersion(models.Model):
    """Version history per FDD §3.1.4."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    manuscript = models.ForeignKey(Manuscript, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    file = models.FileField(upload_to='manuscripts/versions/%Y/%m/')
    uploader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    change_note = models.TextField(blank=True, default='')
    word_count = models.IntegerField(default=0)
    chapter_count = models.IntegerField(default=0)
    upload_timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-version_number']
        unique_together = ['manuscript', 'version_number']
