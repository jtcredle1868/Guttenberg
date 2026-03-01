"""
Guttenberg URL Configuration.

API versioned at /api/v1/ per FDD specification.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
import time

_start_time = time.time()


def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'version': '2.0.0',
        'platform': 'Guttenberg — Master Prose Ecosystem',
        'uptime': round(time.time() - _start_time, 2),
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health', health_check, name='health-check'),
    # API v1
    path('api/v1/auth/', include('titles.auth_urls')),
    path('api/v1/titles/', include('titles.urls')),
    path('api/v1/manuscripts/', include('manuscripts.urls')),
    path('api/v1/formats/', include('formats.urls')),
    path('api/v1/isbn/', include('isbn_service.urls')),
    path('api/v1/distribution/', include('distribution.urls')),
    path('api/v1/finance/', include('finance.urls')),
    path('api/v1/marketing/', include('marketing.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/covers/', include('covers.urls')),
    path('api/v1/enterprise/', include('enterprise.urls')),
    path('api/v1/ecosystem/', include('ecosystem.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/ai/', include('ai_services.urls')),
]
