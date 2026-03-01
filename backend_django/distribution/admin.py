from django.contrib import admin
from .models import DistributionChannel, DistributionRecord


@admin.register(DistributionChannel)
class DistributionChannelAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'api_type', 'auth_method', 'is_active']
    list_filter = ['api_type', 'auth_method', 'is_active']
    search_fields = ['name']


@admin.register(DistributionRecord)
class DistributionRecordAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'format', 'channel', 'channel_status',
        'submission_timestamp', 'live_timestamp', 'exclusivity', 'created_at',
    ]
    list_filter = ['channel_status', 'channel', 'exclusivity']
    search_fields = ['format__title__title', 'channel_asin']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['format', 'channel']
