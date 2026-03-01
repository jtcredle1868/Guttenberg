from django.contrib import admin
from .models import SaleRecord, Disbursement


@admin.register(SaleRecord)
class SaleRecordAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'title', 'format', 'channel', 'sale_date',
        'units_sold', 'gross_revenue', 'royalty_earned',
        'currency', 'territory', 'created_at',
    ]
    list_filter = ['channel', 'currency', 'territory', 'sale_date']
    search_fields = ['title__title', 'channel__name']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['title', 'format', 'channel']
    date_hierarchy = 'sale_date'


@admin.register(Disbursement)
class DisbursementAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'amount', 'currency', 'payment_method',
        'payment_status', 'period_start', 'period_end', 'created_at',
    ]
    list_filter = ['payment_status', 'currency', 'payment_method']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['user']
    date_hierarchy = 'period_start'
