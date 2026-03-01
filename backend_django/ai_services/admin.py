from django.contrib import admin
from .models import AIGenerationRequest


@admin.register(AIGenerationRequest)
class AIGenerationRequestAdmin(admin.ModelAdmin):
    list_display = ['request_type', 'status', 'user', 'title', 'tokens_used', 'created_at']
    list_filter = ['request_type', 'status']
    search_fields = ['user__username', 'title__title']
