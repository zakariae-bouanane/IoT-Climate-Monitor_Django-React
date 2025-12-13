from rest_framework import serializers
from rest_framework import serializers
from .models import Dht11, Sensor, Measurement
from django.utils import timezone
from .utils import send_alert_notification
from .audit import create_audit
from .models import AuditLog
from .escalation import escalation_process

class DHT11serialize(serializers.ModelSerializer) :
    class Meta :
        model = Dht11
        fields ='__all__'

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = "__all__"

class MeasurementSerializer(serializers.ModelSerializer):
    sensor_id = serializers.IntegerField(write_only=True, required=True)
    sensor = SensorSerializer(read_only=True)

    class Meta:
        model = Measurement
        fields = ["id", "sensor", "sensor_id", "temperature", "humidity", "timestamp", "status", "created_at"]
        read_only_fields = ["id", "sensor", "status", "created_at"]

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

        # retirer timestamp de validated_data s’il existe
        timestamp = validated_data.pop("timestamp", None)

        # find or create sensor
        sensor, created = Sensor.objects.get_or_create(
            sensor_id=sensor_id,
            defaults={"name": f"Sensor-{sensor_id}"}
        )

        # si pas de timestamp fourni
        if timestamp is None:
            timestamp = timezone.now()

        # now safe: timestamp won't appear twice
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

        # simple alert detection
        # if measurement.temp < 2 or measurement.temp > 8:
        # Vérifier si alerte (dépasse seuils)
        if (
                measurement.temperature < sensor.min_temp or
                measurement.temperature > sensor.max_temp
        ):
            measurement.status = "ALERT"
            measurement.save()
            create_audit(
                action="ALERT_TRIGGERED",
                sensor=sensor,
                details=f"Temp={measurement.temperature} dépasse les seuils autorisés : en dehors des seuils [{sensor.min_temp} - {sensor.max_temp}]"
            )
            # 🔥 Envoi notifications (email + Telegram)
            # send_alert_notification(sensor, measurement)
            escalation_process(sensor, measurement)


        return measurement

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"