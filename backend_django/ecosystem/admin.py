from django.contrib import admin
from .models import ActivityEvent, RefinerySync


@admin.register(ActivityEvent)
class ActivityEventAdmin(admin.ModelAdmin):
    list_display = [
        'event_type', 'user', 'title', 'is_read', 'created_at',
    ]
    list_filter = ['event_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title__title', 'message']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['user', 'title']


@admin.register(RefinerySync)
class RefinerySyncAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'refinery_manuscript_id', 'sync_status',
        'evaluation_score', 'last_synced',
    ]
    list_filter = ['sync_status']
    search_fields = ['title__title', 'refinery_manuscript_id']
    readonly_fields = ['id']
    raw_id_fields = ['title']
