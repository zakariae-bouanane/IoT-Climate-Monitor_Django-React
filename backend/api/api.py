from .models import Dht11
from .serializers import DHT11serialize
from rest_framework.decorators import api_view
from rest_framework import generics
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .utils import send_telegram

@api_view(['GET'])
def Dlist(request):
    all_data = Dht11.objects.all()
    data = DHT11serialize(all_data, many=True).data
    return Response({'data': data})

class Dhtviews(generics.CreateAPIView):
    queryset = Dht11.objects.all()
    serializer_class = DHT11serialize

    def perform_create(self, serializer):
        instance = serializer.save()
        temperature = instance.temperature  # anciennement instance.temp
        humidity = getattr(instance, "humidity", None)  # si besoin, sinon supprime

        if temperature > 25:
            # 1) Email (optionnel)
            try:
                send_mail(
                    subject="⚠️ Alerte Température élevée (EL MIR Ahmed, BOUANANE Zakariae)",
                    message=f"La température a atteint {temperature:.1f} °C à {instance.dt}.",
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=["onejack872@gmail.com"],
                    fail_silently=True,
                )
            except Exception:
                pass

            # 2) Telegram
            msg = f"⚠️ Alerte DHT11: {temperature:.1f} °C (>25) à {instance.dt}"
            send_telegram(msg)
