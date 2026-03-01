"""
ISBN service models — ISBN acquisition, validation, and assignment.
FDD §3.3
"""
import uuid
from django.db import models


class ISBNRecord(models.Model):
    """An ISBN record linked to a specific Format."""

    class ISBNSource(models.TextChoices):
        PLATFORM_PURCHASED = 'platform_purchased', 'Platform Purchased'
        AUTHOR_SUPPLIED = 'author_supplied', 'Author Supplied'
        FREE_KDP = 'free_kdp', 'Free KDP'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    format = models.ForeignKey(
        'formats.Format', on_delete=models.CASCADE, related_name='isbn_records'
    )
    isbn = models.CharField(max_length=13)
    isbn_source = models.CharField(max_length=20, choices=ISBNSource.choices)
    purchase_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    purchased_at = models.DateTimeField(null=True, blank=True)
    bowker_registered = models.BooleanField(default=False)
    registration_status = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'ISBN Record'
        verbose_name_plural = 'ISBN Records'

    def __str__(self):
        return f"ISBN {self.isbn} ({self.get_isbn_source_display()})"
