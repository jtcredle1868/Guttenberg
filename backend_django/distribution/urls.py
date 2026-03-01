"""Distribution URL configuration."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DistributionChannelViewSet, DistributionViewSet

router = DefaultRouter()
router.register('channels', DistributionChannelViewSet, basename='distribution-channel')
router.register('', DistributionViewSet, basename='distribution')

urlpatterns = [
    path('', include(router.urls)),
]
