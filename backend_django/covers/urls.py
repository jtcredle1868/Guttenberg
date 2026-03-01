"""Cover URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload, name='cover-upload'),
    path('validate/', views.validate_cover, name='cover-validate'),
    path('inject-barcode/', views.inject_barcode, name='cover-inject-barcode'),
    path('generate-variants/', views.generate_variants, name='cover-generate-variants'),
    path('templates/', views.templates, name='cover-templates'),
]
