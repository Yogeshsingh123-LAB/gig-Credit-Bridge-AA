from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_admin
from app.models.user import User
from app.services.admin_service import get_admin_dashboard_metrics, get_admin_users_list
from app.services.audit_service import get_audit_logs

router = APIRouter()

@router.get("/dashboard")
def admin_dashboard(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return get_admin_dashboard_metrics(db)

@router.get("/users")
def list_users(
    role: Optional[str] = Query(None),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return get_admin_users_list(db, role=role)

@router.get("/audit-logs")
def list_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = get_audit_logs(db, limit=limit, offset=offset)
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at
        } for log in logs
    ]
