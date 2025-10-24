from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Measurement
from .serializers import MeasurementSerializer

@api_view(['GET', 'POST'])
def measurement_list(request):
    if request.method == 'GET':
        data = Measurement.objects.all().order_by('-created_at')
        serializer = MeasurementSerializer(data, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = MeasurementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
