"""
Enterprise models — multi-author organizations, imprints, and team management.
FDD §3.11
"""
import uuid
from django.db import models
from django.contrib.auth.models import User


class Organization(models.Model):
    """A publishing organization or imprint group."""

    class SubscriptionTier(models.TextChoices):
        STARTER = 'starter', 'Starter'
        AUTHOR = 'author', 'Author'
        PUBLISHER = 'publisher', 'Publisher'
        ENTERPRISE = 'enterprise', 'Enterprise'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    logo = models.FileField(upload_to='org_logos/', null=True, blank=True)
    subscription_tier = models.CharField(
        max_length=20, choices=SubscriptionTier.choices, default=SubscriptionTier.STARTER,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Imprint(models.Model):
    """A publishing imprint under an organization."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name='imprints',
    )
    name = models.CharField(max_length=255)
    logo = models.FileField(upload_to='imprint_logos/', null=True, blank=True)
    default_isbn_block = models.CharField(max_length=255, blank=True, default='')
    default_copyright_template = models.TextField(blank=True, default='')
    default_distribution_channels = models.JSONField(default=list, blank=True)
    default_royalty_split = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.organization.name})"


class TeamMember(models.Model):
    """A member of an organization with a specific role."""

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        EDITOR = 'editor', 'Editor'
        AUTHOR = 'author', 'Author'
        FINANCE = 'finance', 'Finance'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name='members',
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.AUTHOR)
    invited_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='invitations_sent',
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-joined_at']
        unique_together = ['organization', 'user']

    def __str__(self):
        return f"{self.user.username} — {self.organization.name} ({self.get_role_display()})"
