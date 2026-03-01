"""Ecosystem URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('readiness/<uuid:title_id>/', views.readiness, name='ecosystem-readiness'),
    path('refinery-import/', views.refinery_import, name='ecosystem-refinery-import'),
    path('activity-feed/', views.activity_feed, name='ecosystem-activity-feed'),
    path('scrybe/book-page/', views.scrybe_sync, name='ecosystem-scrybe-book-page'),
    path('entitlements/', views.entitlements, name='ecosystem-entitlements'),
]
