from django.contrib import admin
from .models import ISBNRecord


@admin.register(ISBNRecord)
class ISBNRecordAdmin(admin.ModelAdmin):
    list_display = ['isbn', 'isbn_source', 'format', 'bowker_registered', 'registration_status', 'created_at']
    list_filter = ['isbn_source', 'bowker_registered', 'registration_status']
    search_fields = ['isbn', 'format__title__title']
    readonly_fields = ['id', 'created_at']
