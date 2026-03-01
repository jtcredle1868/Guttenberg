"""Analytics URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.overview, name='analytics-overview'),
    path('time-series/', views.sales_time_series, name='analytics-time-series'),
    path('by-channel/', views.sales_by_channel, name='analytics-by-channel'),
    path('by-territory/', views.sales_by_territory, name='analytics-by-territory'),
    path('by-format/', views.sales_by_format, name='analytics-by-format'),
    path('rank-history/<uuid:title_id>/', views.rank_history, name='analytics-rank-history'),
    path('title/<uuid:title_id>/', views.title_summary, name='analytics-title-summary'),
    path('export/', views.export, name='analytics-export'),
]
