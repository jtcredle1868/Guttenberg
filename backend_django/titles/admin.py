from django.contrib import admin
from .models import Title


@admin.register(Title)
class TitleAdmin(admin.ModelAdmin):
    list_display = ['title', 'primary_author', 'status', 'publishing_readiness_score', 'updated_at']
    list_filter = ['status', 'genre', 'language']
    search_fields = ['title', 'primary_author']
