"""Notifications URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.notification_list, name='notification-list'),
    path('mark-read/', views.mark_read, name='notification-mark-read'),
    path('mark-all-read/', views.mark_all_read, name='notification-mark-all-read'),
    path('preferences/', views.preferences, name='notification-preferences'),
]
