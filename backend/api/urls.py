from django.urls import path
from .views import measurement_list

urlpatterns = [
    path('measurements/', measurement_list, name='measurements'),
]