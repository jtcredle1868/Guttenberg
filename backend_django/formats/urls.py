"""Format URL configuration."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FormatViewSet

router = DefaultRouter()
router.register('', FormatViewSet, basename='format')

urlpatterns = [
    path('', include(router.urls)),
]
