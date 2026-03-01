"""
Marketing models — landing pages, ARC campaigns, press kits, and social assets.
FDD SS3.8
"""
import uuid
from django.db import models


class LandingPage(models.Model):
    """Author landing page for a title per FDD SS3.8."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.OneToOneField(
        'titles.Title', on_delete=models.CASCADE, related_name='landing_page'
    )
    slug = models.SlugField(unique=True)
    theme = models.CharField(max_length=100, default='default')
    custom_css = models.TextField(blank=True, default='')
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Landing Page: {self.title} ({self.slug})"


class ARCCampaign(models.Model):
    """Advance Reader Copy campaign per FDD SS3.8."""

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.ForeignKey(
        'titles.Title', on_delete=models.CASCADE, related_name='arc_campaigns'
    )
    max_reviewers = models.IntegerField(default=50)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    reviewers_count = models.IntegerField(default=0)
    reviews_received = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"ARC Campaign: {self.title} ({self.get_status_display()})"


class ARCReviewer(models.Model):
    """A reviewer invited to an ARC campaign."""

    class Status(models.TextChoices):
        INVITED = 'invited', 'Invited'
        ACCEPTED = 'accepted', 'Accepted'
        DOWNLOADED = 'downloaded', 'Downloaded'
        REVIEWED = 'reviewed', 'Reviewed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(
        ARCCampaign, on_delete=models.CASCADE, related_name='reviewers'
    )
    email = models.EmailField()
    name = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.INVITED
    )
    review_url = models.URLField(blank=True, default='')
    invited_at = models.DateTimeField(auto_now_add=True)
    downloaded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-invited_at']
        unique_together = ['campaign', 'email']

    def __str__(self):
        return f"{self.name} <{self.email}> ({self.get_status_display()})"


class PressKit(models.Model):
    """Generated press kit for a title per FDD SS3.8."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.ForeignKey(
        'titles.Title', on_delete=models.CASCADE, related_name='press_kits'
    )
    file = models.FileField(upload_to='marketing/press_kits/%Y/%m/', null=True, blank=True)
    generated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-generated_at']

    def __str__(self):
        return f"Press Kit: {self.title}"


class SocialAsset(models.Model):
    """Social media asset for a title per FDD SS3.8."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.ForeignKey(
        'titles.Title', on_delete=models.CASCADE, related_name='social_assets'
    )
    asset_type = models.CharField(max_length=50)
    file = models.FileField(upload_to='marketing/social_assets/%Y/%m/', null=True, blank=True)
    caption = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Social Asset: {self.title} ({self.asset_type})"
