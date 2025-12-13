from django.urls import path
from .views import measurement_list

from django.contrib import admin
from rest_framework.routers import DefaultRouter
from django.urls import path,include
from . import views, admin, api
from .views import SensorViewSet, MeasurementViewSet, AuditLogViewSet

router = DefaultRouter()
router.register(r"sensors", SensorViewSet, basename="sensors")
router.register(r"mesures", MeasurementViewSet, basename="mesures")
router.register(r"audit", AuditLogViewSet)

urlpatterns = [
    path('measurements/', measurement_list, name='measurements'),
    # path('api/', api.Dlist,name='json'),
    path("measurements/", include(router.urls)),
    path("latest/", views.latest_json, name="latest_json"),
]