from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Measurement
from .serializers import MeasurementSerializer

from django.http import HttpResponse
# views.py
from django.http import JsonResponse
from .models import Dht11
from django.contrib.auth.models import User
from rest_framework.viewsets import ModelViewSet
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Sensor, Measurement, AuditLog, User, Ticket, IncidentAcknowledgement
from .serializers import SensorSerializer, MeasurementSerializer, AuditLogSerializer, CustomTokenObtainPairSerializer, UserSerializer, TicketSerializer, IncidentAcknowledgementSerializer
from rest_framework.decorators import action, api_view, permission_classes
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsManagerOrSupervisor
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from rest_framework import generics
import csv
from django.http import HttpResponse
from django.utils.timezone import now


@api_view(['GET', 'POST'])
def measurement_list(request):
    if request.method == 'GET':
        sensor_id = request.query_params.get("sensor")
        qs = Measurement.objects.all().select_related("sensor").order_by("timestamp")

        if sensor_id:
            qs = qs.filter(sensor__sensor_id=sensor_id)
            try:
                sensor = Sensor.objects.get(sensor_id=sensor_id)
            except Sensor.DoesNotExist:
                sensor = None
        else:
            sensor = None

        # Gestion des alertes successives
        if sensor and getattr(sensor, "alert_count", 0) > 0:
            measurements = list(qs)
            filtered = []
            last_status = None
            for m in measurements:
                if m.status == "ALERT":
                    if last_status != "ALERT":
                        filtered.append(m)
                else:  # OK/NORMAL
                    filtered.append(m)
                last_status = m.status

            # Retour en ordre décroissant pour l'affichage
            qs = Measurement.objects.filter(id__in=[m.id for m in filtered]).order_by("-timestamp")

        serializer = MeasurementSerializer(qs, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = MeasurementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
def measurement_latest(request):
    sensor_id = request.query_params.get("sensor")

    qs = Measurement.objects.all().select_related("sensor")

    if sensor_id:
        qs = qs.filter(sensor__sensor_id=sensor_id)

    latest_measurement = qs.order_by("-timestamp").first()

    if not latest_measurement:
        return Response(
            {"message": "Aucune mesure trouvée"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = MeasurementSerializer(latest_measurement)
    return Response(serializer.data)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def incident_acknowledgement(request, measurement_id):
    user_role = request.user.profile.role.upper()

    role_visibility = {
        "USER": ["USER"],
        "MANAGER": ["USER", "MANAGER"],
        "SUPERVISOR": ["USER", "MANAGER", "SUPERVISOR"],
    }

    allowed_levels = role_visibility.get(user_role, [])

    acks = IncidentAcknowledgement.objects.filter(
        measurement_id=measurement_id,
        level__in=allowed_levels
    ).order_by("level")

    serializer = IncidentAcknowledgementSerializer(acks, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def acknowledge_incident(request, measurement_id):
    user = request.user
    level = request.data.get("level")
    comment = request.data.get("comment", "").strip()

    if not level:
        return Response({"error": "level requis"}, status=400)

    user_role = user.profile.role.upper()

    if user_role != level:
        return Response(
            {"error": "Vous ne pouvez valider que votre niveau"},
            status=403
        )

    ack = get_object_or_404(
        IncidentAcknowledgement,
        measurement_id=measurement_id,
        level=level
    )

    if ack.acknowledged:
        return Response(
            {"error": "Déjà validé"},
            status=400
        )

    ack.acknowledged = True
    ack.comment = comment
    ack.acknowledged_at = timezone.now()
    ack.save()

    return Response({
        "message": "Validation enregistrée",
        "comment": ack.comment
    })


def test(request):
    return HttpResponse("Hello World");

def dashboard(request):
    # Rend juste la page; les données sont chargées via JS
    return render(request, "dashboard.html")

def latest_json(request):
    # Fournit la dernière mesure en JSON (sans passer par api.py)
    last = Dht11.objects.order_by('-dt').values('temp', 'hum', 'dt').first()
    if not last:
        return JsonResponse({"detail": "no data"}, status=404)
    return JsonResponse({
        "temperature": last["temp"],
        "humidity":    last["hum"],
        "timestamp":   last["dt"].isoformat()
    })

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    lookup_field = "sensor_id"  # permettre GET /sensors/1/ via sensor_id
    permission_classes = [IsAuthenticated]  # besoin JWT

    @action(detail=True, methods=['post'])
    def resolve_alert(self, request, pk=None):
        sensor = self.get_object()
        sensor.alert_count = 0
        sensor.save()
        return Response({"message": "Alerte résolue et compteur remis à zéro."})

class MeasurementViewSet(viewsets.ModelViewSet):
    queryset = Measurement.objects.all().select_related("sensor")
    serializer_class = MeasurementSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        sensor_id = self.request.query_params.get("sensor")

        if sensor_id:
            qs = qs.filter(sensor__sensor_id=sensor_id)
            try:
                sensor = Sensor.objects.get(sensor_id=sensor_id)
            except Sensor.DoesNotExist:
                sensor = None
        else:
            sensor = None

        if sensor and getattr(sensor, "alert_count", 0) > 0:
            # Parcours chronologique pour détecter correctement la première alerte de chaque série
            measurements = list(qs.order_by("timestamp"))
            filtered = []
            last_status = None

            for m in measurements:
                if m.status == "ALERT":
                    if last_status != "ALERT":
                        filtered.append(m)  # Première alerte d’une série
                else:  # OK/NORMAL
                    filtered.append(m)
                last_status = m.status

            # Retour en QuerySet pour DRF, trié par timestamp décroissant
            return qs.filter(id__in=[m.id for m in filtered]).order_by("-timestamp")

        return qs.order_by("-timestamp")

    def create(self, request, *args, **kwargs):
        """
        Permet aux capteurs d'envoyer : {"sensor_id":1,"temp":6.2,"hum":62.0,"timestamp":"2025-12-11T12:00:00Z"}
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        measurement = serializer.save()
        out_serializer = self.get_serializer(measurement)
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by("-created_at")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Supervisor voit tout
        if user.profile.role.lower() == "supervisor":
            return User.objects.all().order_by("id")

        # Manager voit ses users + lui-même
        return User.objects.filter(profile__manager=user) | User.objects.filter(id=user.id)

    def get_object(self):
        """
        Surcharge pour s'assurer que l'utilisateur ne peut accéder qu'à
        ses users autorisés (selon get_queryset)
        """
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs.get('pk'))
        return obj

    def update(self, request, *args, **kwargs):
        """
        Permettre de mettre à jour un utilisateur selon les permissions
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class UserRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    profile = getattr(user, "profile", None)
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": profile.role if profile else None
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_audit_logs(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="audit_logs.csv"'

    writer = csv.writer(response, delimiter=",")
    writer.writerow([
        "ID",
        "Action",
        "Sensor",
        "Details",
        "Created At"
    ])

    logs = AuditLog.objects.select_related("sensor").order_by("-created_at")

    for log in logs:
        writer.writerow([
            log.id,
            log.action,
            log.sensor.name if log.sensor else "",
            log.details,
            log.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])

    return response

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketSerializer

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        ticket = self.get_object()
        user_id = request.data.get("user_id")

        if not user_id:
            return Response({"error": "user_id requis"}, status=400)

        ticket.assigned_to_id = user_id
        ticket.status = "ASSIGNED"
        ticket.save()

        AuditLog.objects.create(
            action="TICKET_ASSIGNED",
            sensor=ticket.sensor,
            details=f"Ticket #{ticket.id} assigné manuellement"
        )

        return Response({"message": "Ticket assigné"})

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        ticket = self.get_object()

        if ticket.status == "CLOSED":
            return Response({"message": "Déjà clôturé"}, status=400)

        ticket.status = "CLOSED"
        ticket.closed_at = now()
        ticket.save()

        AuditLog.objects.create(
            action="TICKET_CLOSED",
            sensor=ticket.sensor,
            details=f"Ticket #{ticket.id} clôturé"
        )

        return Response({"message": "Ticket clôturé"})

