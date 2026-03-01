"""AI Services URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('synopsis/', views.generate_synopsis, name='ai-synopsis'),
    path('keywords/', views.optimize_keywords, name='ai-keywords'),
    path('enhance-metadata/', views.enhance_metadata, name='ai-enhance-metadata'),
    path('status/<uuid:request_id>/', views.ai_request_status, name='ai-request-status'),
    path('usage/', views.ai_usage, name='ai-usage'),
]
