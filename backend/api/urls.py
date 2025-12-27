from django.urls import path
from .views import measurement_list, measurement_latest

from django.contrib import admin
from rest_framework.routers import DefaultRouter
from django.urls import path,include
from . import views, admin, api
from .views import SensorViewSet, MeasurementViewSet, AuditLogViewSet, incident_acknowledgement, acknowledge_incident
from .views import UserViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import CustomTokenObtainPairView, me, UserRetrieveUpdateView, TicketViewSet

router = DefaultRouter()
router.register(r"sensors", SensorViewSet, basename="sensors")
router.register(r"mesures", MeasurementViewSet, basename="mesures")
router.register(r"audit", AuditLogViewSet)
router.register("users", UserViewSet, basename="users")
router.register(r'tickets', TicketViewSet)

urlpatterns = [
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("token/", TokenObtainPairView.as_view(), name="token"),
    path("auth/me/", me, name="me"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('measurements/', measurement_list, name='measurements'),
    path('measurements/latest/', measurement_latest, name='measurement-latest'),
    path(
        "measurements/<int:measurement_id>/acknowledgements/",
        incident_acknowledgement
    ),
    path(
        "measurements/<int:measurement_id>/acknowledge/",
        acknowledge_incident,
        name="acknowledge-incident"
    ),
    path("audit/export/", views.export_audit_logs, name="export_audit_logs"),
    # path('api/', api.Dlist,name='json'),
    path("", include(router.urls)),
    path('users/<int:pk>/', UserRetrieveUpdateView.as_view(), name='user-detail'),
    path("latest/", views.latest_json, name="latest_json"),
]