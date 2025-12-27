from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Dht11, Sensor, Measurement, AuditLog
from django.utils import timezone
from .utils import send_alert_notification
from .audit import create_audit
from .escalation import escalation_process
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Profile, Ticket, IncidentAcknowledgement


class DHT11serialize(serializers.ModelSerializer) :
    class Meta :
        model = Dht11
        fields ='__all__'

class SensorSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )

    class Meta:
        model = Sensor
        fields = "__all__"

class MeasurementSerializer(serializers.ModelSerializer):
    sensor_id = serializers.IntegerField(write_only=True, required=True)

    sensor = SensorSerializer(read_only=True)

    # 🔥 NOUVEAU : alert_count du sensor
    sensor_alert_count = serializers.IntegerField(
        source="sensor.alert_count",
        read_only=True
    )

    class Meta:
        model = Measurement
        fields = [
            "id",
            "sensor",
            "sensor_id",
            "temperature",
            "humidity",
            "timestamp",
            "status",
            "created_at",
            "sensor_alert_count",   # 👈 ajouté ici
        ]
        read_only_fields = [
            "id",
            "sensor",
            "status",
            "created_at",
            "sensor_alert_count"
        ]

    def validate_temperature(self, value):
        # Validation simple — ajustez selon cahier des charges
        if value < -50 or value > 100:
            raise serializers.ValidationError("Température hors de portée réaliste.")
        return value

    def validate_humidity(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Humidité doit être entre 0 et 100.")
        return value

    def create(self, validated_data):
        sensor_id = validated_data.pop("sensor_id")
        timestamp = validated_data.pop("timestamp", None)

        # find or create sensor
        sensor, created = Sensor.objects.get_or_create(
            sensor_id=sensor_id,
            defaults={"name": f"Sensor-{sensor_id}"}
        )

        # si pas de timestamp fourni
        if timestamp is None:
            timestamp = timezone.now()

        measurement = Measurement.objects.create(
            sensor=sensor,
            timestamp=timestamp,
            **validated_data
        )

        create_audit(
            action="MEASUREMENT_RECEIVED",
            sensor=sensor,
            details=f"Temp={measurement.temperature}, Hum={measurement.humidity}"
        )

        # Vérification alerte
        if measurement.temperature < sensor.min_temp or measurement.temperature > sensor.max_temp:
            measurement.status = "ALERT"
            measurement.save()
            for level in ["USER", "MANAGER", "SUPERVISOR"]:
                IncidentAcknowledgement.objects.get_or_create(
                    measurement=measurement,
                    level=level
                )
            create_audit(
                action="ALERT_TRIGGERED",
                sensor=sensor,
                details=f"Temp={measurement.temperature} dépasse les seuils autorisés : [{sensor.min_temp} - {sensor.max_temp}]"
            )

            # Notifications et escalade
            escalation_process(sensor, measurement)

            # Créer un ticket seulement s'il n'y en a pas déjà un ouvert pour ce sensor
            existing_ticket = Ticket.objects.filter(
                sensor=sensor,
                status__in=["OPEN", "ASSIGNED"]
            ).first()

            if not existing_ticket:
                Ticket.objects.create(
                    title="Dépassement température",
                    description=f"Température = {measurement.temperature}°C",
                    sensor=sensor,
                    priority="HIGH",
                    status="OPEN"
                )

        else:
            measurement.status = "NORMAL"
            measurement.save()
            if sensor.alert_count > 0:
                sensor.alert_count = 0
            sensor.save()

        return measurement

class IncidentAcknowledgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentAcknowledgement
        fields = "__all__"
        read_only_fields = ["id", "acknowledged_at"]


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"

class ProfileSerializer(serializers.ModelSerializer):
    manager = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        allow_null=True,   # autorise null
        required=False     # pas obligatoire
    )

    class Meta:
        model = Profile
        fields = ["role", "manager"]

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "is_active",
            "profile",
        ]

    def create(self, validated_data):
        profile_data = validated_data.pop("profile")
        password = validated_data.pop("password", None)

        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()

        Profile.objects.create(
            user=user,
            role=profile_data.get("role", "user"),
            manager=profile_data.get("manager"),
        )

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        password = validated_data.pop("password", None)

        # update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        # update profile
        profile, _ = Profile.objects.get_or_create(user=instance)
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["user_id"] = user.id
        token["username"] = user.username
        token["email"] = user.email

        if hasattr(user, "profile"):
            token["role"] = user.profile.role
            token["manager_id"] = (
                user.profile.manager.id if user.profile.manager else None
            )

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Inject custom claims into response
        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "role": self.user.profile.role if hasattr(self.user, "profile") else None,
        }

        return data

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = "__all__"