"""
Title models — the central data entity in Guttenberg (FDD §2.1).
All other objects (formats, distribution records, sales data) link to a Title.
"""
import uuid
from django.db import models
from django.contrib.auth.models import User


class Title(models.Model):
    """Core Title entity per FDD §2.1."""

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        FORMATTING = 'formatting', 'Formatting'
        READY = 'ready', 'Ready'
        SUBMITTED = 'submitted', 'Submitted'
        LIVE = 'live', 'Live'
        UNLISTED = 'unlisted', 'Unlisted'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='titles')
    imprint = models.ForeignKey(
        'enterprise.Imprint', on_delete=models.SET_NULL, null=True, blank=True, related_name='titles'
    )
    refinery_manuscript_id = models.UUIDField(null=True, blank=True)

    title = models.CharField(max_length=500)
    subtitle = models.CharField(max_length=500, blank=True, default='')
    series_name = models.CharField(max_length=255, blank=True, default='')
    series_number = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    primary_author = models.CharField(max_length=255)
    contributors = models.JSONField(default=list, blank=True)  # [{name, role, bio}]

    synopsis_short = models.TextField(blank=True, default='', help_text='Max 400 chars')
    synopsis_long = models.TextField(blank=True, default='', help_text='Max 4000 chars')

    bisac_codes = models.JSONField(default=list, blank=True)  # Up to 7
    keywords = models.JSONField(default=list, blank=True)  # Up to 7
    language = models.CharField(max_length=2, default='en')
    publication_date = models.DateField(null=True, blank=True)
    edition = models.CharField(max_length=50, blank=True, default='1st')

    audience_age_min = models.IntegerField(null=True, blank=True)
    audience_age_max = models.IntegerField(null=True, blank=True)
    content_advisories = models.JSONField(default=list, blank=True)

    publishing_readiness_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        help_text='Composite: Refinery(60%) + Metadata(20%) + Preflight(20%)'
    )
    refinery_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    metadata_completeness_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    preflight_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    word_count = models.IntegerField(default=0)
    genre = models.CharField(max_length=100, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title

    def calculate_readiness_score(self):
        """Calculate composite publishing readiness score per FDD §3.10.2."""
        self.publishing_readiness_score = (
            float(self.refinery_score) * 0.6 +
            float(self.metadata_completeness_score) * 0.2 +
            float(self.preflight_score) * 0.2
        )
        return self.publishing_readiness_score

    def calculate_metadata_completeness(self):
        """Score metadata completeness 0-100."""
        score = 0
        fields = [
            (self.title, 15),
            (self.primary_author, 15),
            (self.synopsis_short, 10),
            (self.synopsis_long, 10),
            (len(self.bisac_codes) >= 1, 10),
            (len(self.keywords) >= 1, 10),
            (self.language, 5),
            (self.publication_date, 10),
            (self.genre, 5),
            (len(self.contributors) > 0, 5),
            (self.word_count > 0, 5),
        ]
        for val, weight in fields:
            if val:
                score += weight
        self.metadata_completeness_score = min(score, 100)
        return self.metadata_completeness_score
