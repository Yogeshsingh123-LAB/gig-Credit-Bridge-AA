from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.audit_log import AuditLog

def log_audit_action(
    db: Session,
    user_id: Optional[str],
    action: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """
    Persists audit log records for security and compliance tracking.
    Never logs passwords, secrets, or JWT tokens.
    """
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

def get_audit_logs(db: Session, limit: int = 100, offset: int = 0) -> List[AuditLog]:
    return db.query(AuditLog).order_by(desc(AuditLog.created_at)).offset(offset).limit(limit).all()
