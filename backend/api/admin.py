from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Sensor, Measurement, AuditLog, Profile
from . import models


admin.site.register(models.Dht11)

@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "sensor_id", "location", "active", "created_at")
    search_fields = ("name", "sensor_id", "location")

@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    list_display = ("id", "sensor", "temperature", "humidity", "timestamp", "status", "created_at")
    list_filter = ("status", "sensor")
    search_fields = ("sensor__name", "sensor__sensor_id")

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "sensor", "details", "created_at")
    list_filter = ("action",)
    search_fields = ("details", "sensor__name")

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "manager")
    search_fields = ("user__username", "role")
    list_filter = ("role",)