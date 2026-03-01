from django.contrib import admin
from .models import Organization, Imprint, TeamMember


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'subscription_tier', 'created_at', 'updated_at']
    list_filter = ['subscription_tier']
    search_fields = ['name', 'slug']
    readonly_fields = ['id', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Imprint)
class ImprintAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'default_isbn_block', 'created_at']
    list_filter = ['organization']
    search_fields = ['name', 'organization__name']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['organization']


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'organization', 'role', 'is_active',
        'invited_by', 'joined_at',
    ]
    list_filter = ['role', 'is_active', 'organization']
    search_fields = ['user__username', 'user__email', 'organization__name']
    readonly_fields = ['id', 'joined_at']
    raw_id_fields = ['user', 'organization', 'invited_by']
