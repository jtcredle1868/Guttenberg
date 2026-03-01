from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'user', 'channel', 'is_read', 'sent_at', 'created_at',
    ]
    list_filter = ['channel', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user__username']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['user', 'event']


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'email_enabled', 'push_enabled', 'in_app_enabled',
        'updated_at',
    ]
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['id', 'updated_at']
    raw_id_fields = ['user']
