"""Marketing URL configuration."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LandingPageViewSet, ARCCampaignViewSet, MarketingViewSet

router = DefaultRouter()
router.register('landing-pages', LandingPageViewSet, basename='landing-page')
router.register('arc-campaigns', ARCCampaignViewSet, basename='arc-campaign')
router.register('', MarketingViewSet, basename='marketing')

urlpatterns = [
    path('', include(router.urls)),
]
