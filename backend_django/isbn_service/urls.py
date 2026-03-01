"""ISBN service URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('purchase/', views.purchase, name='isbn-purchase'),
    path('validate/', views.validate, name='isbn-validate'),
    path('assign/', views.assign, name='isbn-assign'),
]
