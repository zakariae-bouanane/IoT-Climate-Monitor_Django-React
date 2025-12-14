import requests
from django.conf import settings
from django.core.mail import send_mail
from .audit import create_audit

def send_alert_email(user, sensor, measurement, msg):
    subject = f"⚠️ Alerte Température - Capteur #{sensor.sensor_id}"
    message = (
        f"Alerte : {msg}\n"
        f"Capteur : {sensor.name} (ID {sensor.sensor_id})\n"
        f"Localisation : {sensor.location}\n\n"
        f"Température : {measurement.temperature}°C\n"
        f"Humidité : {measurement.humidity}%\n"
        f"Heure : {measurement.timestamp}\n\n"
        f"⚠️ Valeur en dehors des seuils autorisés !"
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],  # tu peux mettre la liste interne
        fail_silently=True,
    )
    create_audit("EMAIL_SENT", sensor=sensor, details="Email alert sent")

def send_telegram(text: str) -> bool:
    """Envoie un message Telegram via l'API officielle. Retourne True si OK."""
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        r = requests.post(url, data={"chat_id": chat_id, "text": text})
        return r.ok
    except Exception:
        return False
def send_alert_telegram(user, sensor, measurement, msg):
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    text = (
        f"⚠️ *ALERTE TEMPÉRATURE : {msg}*\n"
        f"Capteur: {sensor.name} (ID {sensor.sensor_id})\n"
        f"Température : {measurement.temperature}°C\n"
        f"Humidité : {measurement.humidity}%\n"
        f"Heure: {measurement.timestamp}\n"
        f"User Email address : {user.email}\n"
    )

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}

    try:
        requests.post(url, data=payload)
        create_audit("TELEGRAM_SENT", sensor=sensor, details="Telegram alert sent")
    except Exception:
        pass


def send_alert_notification(sensor, measurement):
    """Envoie email + Telegram"""
    send_alert_email(sensor, measurement)
    send_alert_telegram(sensor, measurement)