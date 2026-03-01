"""
Finance models — sales tracking and disbursement management.
FDD §3.7
"""
import uuid
from django.db import models
from django.contrib.auth.models import User


class SaleRecord(models.Model):
    """Individual sale record from a distribution channel."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.ForeignKey(
        'titles.Title', on_delete=models.CASCADE, related_name='sales'
    )
    format = models.ForeignKey(
        'formats.Format', on_delete=models.CASCADE, related_name='sales'
    )
    channel = models.ForeignKey(
        'distribution.DistributionChannel', on_delete=models.CASCADE, related_name='sales'
    )
    sale_date = models.DateField()
    units_sold = models.IntegerField()
    gross_revenue = models.DecimalField(max_digits=10, decimal_places=2)
    royalty_earned = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    territory = models.CharField(max_length=2, help_text='ISO 3166-1 alpha-2 country code')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sale_date']

    def __str__(self):
        return f"{self.title} — {self.channel} — {self.sale_date} ({self.units_sold} units)"


class Disbursement(models.Model):
    """A royalty disbursement to an author."""

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disbursements')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    period_start = models.DateField()
    period_end = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"{self.user.username} — ${self.amount} "
            f"({self.get_payment_status_display()})"
        )
