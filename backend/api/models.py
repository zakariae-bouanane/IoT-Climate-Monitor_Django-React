from django.db import models
from django.contrib.auth.models import User


class Dht11(models.Model):
    # Remplacement de temp et hum par temperature et humidity
    temperature = models.FloatField(null=True)
    humidity = models.FloatField(null=True)
    dt = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"DHT11 at {self.dt}: {self.temperature}°C / {self.humidity}%"


class Sensor(models.Model):
    """
    Capteur (Sensor) — identifiant unique côté matériel = sensor_id
    """
    name = models.CharField(max_length=120)
    sensor_id = models.PositiveIntegerField(unique=True)
    location = models.CharField(max_length=255, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sensors"
    )
    alert_count = models.IntegerField(default=0)
    min_temp = models.FloatField(default=2)
    max_temp = models.FloatField(default=8)

    def __str__(self):
        return f"{self.name} (#{self.sensor_id})"


class Measurement(models.Model):
    STATUS_CHOICES = [
        ("OK", "OK"),
        ("ALERT", "ALERT"),
    ]

    sensor = models.ForeignKey("Sensor", on_delete=models.CASCADE, related_name="measurements")
    temperature = models.FloatField(default=0)
    humidity = models.FloatField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)  # <-- auto_now_add
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="OK")
    created_at = models.DateTimeField(auto_now_add=True)  # <-- auto_now_add

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Sensor {self.sensor.sensor_id}: {self.temperature}°C / {self.humidity}%"


class AuditLog(models.Model):
    ACTION_TYPES = [
        ("MEASUREMENT_RECEIVED", "Measurement received"),
        ("ALERT_TRIGGERED", "Alert triggered"),
        ("EMAIL_SENT", "Email sent"),
        ("TELEGRAM_SENT", "Telegram sent"),
    ]

    action = models.CharField(max_length=50, choices=ACTION_TYPES)
    sensor = models.ForeignKey("Sensor", on_delete=models.SET_NULL, null=True, blank=True)
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} - {self.created_at}"


class Profile(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("manager", "Manager"),
        ("supervisor", "Supervisor")
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    manager = models.ForeignKey(
        User, related_name="managed_users",
        on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return f"{self.user.username} ({self.role})"
