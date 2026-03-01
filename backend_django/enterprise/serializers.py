"""Enterprise serializers — organizations, imprints, and team management."""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Organization, Imprint, TeamMember


class OrganizationSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    imprint_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug', 'logo', 'subscription_tier',
            'member_count', 'imprint_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()

    def get_imprint_count(self, obj):
        return obj.imprints.count()


class ImprintSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(
        source='organization.name', read_only=True,
    )

    class Meta:
        model = Imprint
        fields = [
            'id', 'organization', 'organization_name', 'name', 'logo',
            'default_isbn_block', 'default_copyright_template',
            'default_distribution_channels', 'default_royalty_split',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class TeamMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    invited_by_username = serializers.CharField(
        source='invited_by.username', read_only=True, default=None,
    )

    class Meta:
        model = TeamMember
        fields = [
            'id', 'organization', 'user', 'username', 'email',
            'role', 'invited_by', 'invited_by_username',
            'joined_at', 'is_active',
        ]
        read_only_fields = ['id', 'joined_at']


class TeamMemberInviteSerializer(serializers.Serializer):
    """Serializer for inviting a new team member."""
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=TeamMember.Role.choices, default='author')


class TeamMemberRoleUpdateSerializer(serializers.Serializer):
    """Serializer for updating a team member's role."""
    role = serializers.ChoiceField(choices=TeamMember.Role.choices)


class CatalogTitleSerializer(serializers.Serializer):
    """Serializer for the consolidated catalog view."""
    id = serializers.UUIDField()
    title = serializers.CharField()
    primary_author = serializers.CharField()
    status = serializers.CharField()
    format_count = serializers.IntegerField()
    channel_count = serializers.IntegerField()
    lifetime_sales = serializers.IntegerField()
    lifetime_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)


class BulkOperationSerializer(serializers.Serializer):
    """Serializer for bulk operations on multiple titles."""
    title_ids = serializers.ListField(child=serializers.UUIDField())
    operation = serializers.ChoiceField(choices=[
        ('update_pricing', 'Update Pricing'),
        ('add_channels', 'Add Channels'),
        ('remove_channels', 'Remove Channels'),
        ('update_metadata', 'Update Metadata'),
    ])
    payload = serializers.JSONField(help_text='Operation-specific data payload.')
