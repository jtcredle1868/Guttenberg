"""Enterprise URL configuration."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrganizationViewSet, ImprintViewSet

router = DefaultRouter()
router.register('organizations', OrganizationViewSet, basename='organization')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'organizations/<uuid:org_id>/imprints/',
        ImprintViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='org-imprint-list',
    ),
    path(
        'organizations/<uuid:org_id>/imprints/<uuid:pk>/',
        ImprintViewSet.as_view({
            'get': 'retrieve', 'put': 'update',
            'patch': 'partial_update', 'delete': 'destroy',
        }),
        name='org-imprint-detail',
    ),
]
