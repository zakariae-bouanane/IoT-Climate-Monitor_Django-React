from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Measurement
from .serializers import MeasurementSerializer

from django.http import HttpResponse
# views.py
from django.http import JsonResponse
from .models import Dht11

from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Sensor, Measurement
from .serializers import SensorSerializer, MeasurementSerializer, AuditLogSerializer
from rest_framework.decorators import action
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import AuditLog


@api_view(['GET', 'POST'])
def measurement_list(request):
    if request.method == 'GET':
        data = Measurement.objects.all().order_by('created_at')
        serializer = MeasurementSerializer(data, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = MeasurementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


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
        if self.action == "create":  # capteur → POST /api/mesures/
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        sensor = self.request.query_params.get("sensor")
        since = self.request.query_params.get("since")
        if sensor:
            qs = qs.filter(sensor__sensor_id=sensor)
        if since:
            try:
                dt = parse_datetime(since)
                if dt is None:
                    raise ValueError()
                qs = qs.filter(timestamp__gte=dt)
            except Exception:
                pass
        return qs

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



