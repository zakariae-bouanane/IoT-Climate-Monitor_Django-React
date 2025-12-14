from .models import AuditLog

def create_audit(action, sensor=None, details=""):
    AuditLog.objects.create(
        action=action,
        sensor=sensor,
        details=details
    )
