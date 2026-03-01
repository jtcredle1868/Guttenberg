from django.contrib import admin
from .models import Format, FormatJob


@admin.register(Format)
class FormatAdmin(admin.ModelAdmin):
    list_display = ['title', 'format_type', 'isbn', 'status', 'list_price_usd', 'updated_at']
    list_filter = ['format_type', 'status', 'drm_enabled']
    search_fields = ['title__title', 'isbn']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(FormatJob)
class FormatJobAdmin(admin.ModelAdmin):
    list_display = ['format', 'job_type', 'template_name', 'status', 'progress', 'created_at']
    list_filter = ['job_type', 'status', 'template_name']
    search_fields = ['format__title__title']
    readonly_fields = ['id', 'created_at', 'started_at', 'completed_at']
