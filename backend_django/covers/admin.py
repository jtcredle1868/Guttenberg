from django.contrib import admin
from .models import Cover


@admin.register(Cover)
class CoverAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'format', 'file_type', 'resolution_dpi', 'color_mode',
        'width_px', 'height_px', 'validation_status', 'has_barcode', 'created_at',
    ]
    list_filter = ['validation_status', 'file_type', 'color_mode', 'has_barcode']
    search_fields = ['title__title']
    readonly_fields = ['id', 'created_at']
