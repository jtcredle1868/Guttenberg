from django.contrib import admin
from .models import LandingPage, ARCCampaign, ARCReviewer, PressKit, SocialAsset


@admin.register(LandingPage)
class LandingPageAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'slug', 'theme', 'is_published', 'updated_at']
    list_filter = ['is_published', 'theme']
    search_fields = ['title__title', 'slug']
    readonly_fields = ['id', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(ARCCampaign)
class ARCCampaignAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'title', 'status', 'max_reviewers', 'reviewers_count',
        'reviews_received', 'start_date', 'end_date', 'created_at',
    ]
    list_filter = ['status']
    search_fields = ['title__title']
    readonly_fields = ['id', 'reviewers_count', 'reviews_received', 'created_at']
    raw_id_fields = ['title']


@admin.register(ARCReviewer)
class ARCReviewerAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'campaign', 'name', 'email', 'status',
        'invited_at', 'downloaded_at',
    ]
    list_filter = ['status']
    search_fields = ['name', 'email', 'campaign__title__title']
    readonly_fields = ['id', 'invited_at']
    raw_id_fields = ['campaign']


@admin.register(PressKit)
class PressKitAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'file', 'generated_at']
    search_fields = ['title__title']
    readonly_fields = ['id', 'generated_at']
    raw_id_fields = ['title']


@admin.register(SocialAsset)
class SocialAssetAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'asset_type', 'file', 'created_at']
    list_filter = ['asset_type']
    search_fields = ['title__title', 'caption']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['title']
