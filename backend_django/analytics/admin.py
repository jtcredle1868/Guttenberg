from django.contrib import admin
from .models import AnalyticsSnapshot, AmazonRankHistory


@admin.register(AnalyticsSnapshot)
class AnalyticsSnapshotAdmin(admin.ModelAdmin):
    list_display = [
        'snapshot_date', 'user', 'title', 'total_units',
        'total_revenue', 'total_royalties', 'created_at',
    ]
    list_filter = ['snapshot_date', 'user']
    search_fields = ['title__title', 'user__username']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['title', 'user']


@admin.register(AmazonRankHistory)
class AmazonRankHistoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'rank', 'category', 'recorded_at']
    list_filter = ['category']
    search_fields = ['title__title', 'category']
    readonly_fields = ['id', 'recorded_at']
    raw_id_fields = ['title']
