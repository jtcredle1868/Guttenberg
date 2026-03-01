from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ManuscriptViewSet

router = DefaultRouter()
router.register('', ManuscriptViewSet, basename='manuscript')

urlpatterns = [
    path('', include(router.urls)),
]
