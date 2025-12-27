from .models import Sensor, Profile, Ticket, AuditLog
from .utils import send_alert_email, send_alert_telegram
from .audit import create_audit

def notify_user(user, sensor, measurement, level="USER"):
    # Utilisation de temperature au lieu de temp
    message = f"Alerte niveau {level} - Capteur {sensor.sensor_id}\nTempérature: {measurement.temperature}"
    if not user or not user.email:
        print(f"⚠ Impossible d'envoyer l'alerte à level {level} : email manquant")
        return
    send_alert_email(user, sensor, measurement, message)
    send_alert_telegram(user, sensor, measurement, message)

    create_audit(
        action="EMAIL_SENT",
        sensor=sensor,
        details=f"Alerte envoyée à {user.email} (niveau {level})"
    )

def escalation_process(sensor, measurement):
    """
    Processus d'escalade :
    1- Alerte 1 → notifier USER
    2- Alerte 3 → notifier MANAGER
    3- Alerte 6 → notifier SUPERVISOR
    """

    # Incrémenter compteur du sensor
    sensor.alert_count += 1
    sensor.save()

    # Verifier que le capteur a un utilisateur assigné
    responsible_user = sensor.user
    if not responsible_user:
        print("⚠ Aucun utilisateur assigné à ce capteur")
        return

    # Recuperer le profil utilisateur
    profile = Profile.objects.filter(user=responsible_user).first()
    if not profile:
        print("⚠ Aucun profil associé à l’utilisateur")
        return

    # Étape 1 — 1ère alerte → notifier USER
    if sensor.alert_count <= 3:
        notify_user(responsible_user, sensor, measurement, "USER")
        create_and_assign_ticket(
            sensor=sensor,
            assigned_user=responsible_user,
            priority="LOW"
        )
        return

    # Étape 2 — 3 alertes → notifier MANAGER
    if sensor.alert_count > 3 and sensor.alert_count <= 6:
        if profile.manager:  # Le user a un manager dans Profile
            notify_user(profile.manager, sensor, measurement, "MANAGER")
            create_and_assign_ticket(
                sensor=sensor,
                assigned_user=profile.manager,
                priority="MEDIUM"
            )
        else:
            print("⚠ Pas de manager → impossible d'escalader")
        return

    # Étape 3 — 6 alertes → notifier SUPERVISOR
    if sensor.alert_count > 6:
        # On récupère le profil du manager pour accéder à son manager (supervisor)
        manager_profile = Profile.objects.filter(user=profile.manager).first()

        if manager_profile and manager_profile.manager:
            supervisor = manager_profile.manager
            notify_user(supervisor, sensor, measurement, "SUPERVISOR")
            create_and_assign_ticket(
                sensor=sensor,
                assigned_user=supervisor,
                priority="HIGH"
            )
        else:
            print("⚠ Pas de supervisor → fin de l'escalade")
        return

def create_and_assign_ticket(sensor, assigned_user, priority="MEDIUM"):
    try:
        ticket = Ticket.objects.create(
            sensor=sensor,
            assigned_to=assigned_user,
            status="ASSIGNED",
            priority=priority
        )

        AuditLog.objects.create(
            action="TICKET_CREATED",
            sensor=sensor,
            details=f"Ticket #{ticket.id} créé et assigné à {assigned_user.username}"
        )

        print(f"✅ Ticket {ticket.id} créé")

        return ticket

    except Exception as e:
        print("❌ ERREUR création ticket :", e)
        return None

