from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.api.deps import require_worker
from app.models.worker_profile import WorkerProfile
from app.services.platform_service import (
    get_worker_platforms, connect_platform, disconnect_platform, generate_demo_financial_data
)
from app.services.audit_service import log_audit_action

router = APIRouter()

class PlatformConnectSchema(BaseModel):
    platform_name: str
    account_identifier: str

class GenerateDemoDataSchema(BaseModel):
    months: int = 6

@router.get("")
def list_platforms(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    platforms = get_worker_platforms(db, worker.id)
    return [
        {
            "id": p.id,
            "platform_name": p.platform_name,
            "account_identifier": p.account_identifier,
            "connection_status": p.connection_status.value,
            "connected_at": p.connected_at
        } for p in platforms
    ]

@router.post("/connect")
def connect_gig_platform(
    req: PlatformConnectSchema,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    platform = connect_platform(db, worker.id, req.platform_name, req.account_identifier)
    log_audit_action(db, worker.user_id, "CONNECT_PLATFORM", "GigPlatform", platform.id, {"platform": req.platform_name})
    return {
        "message": f"Successfully connected {req.platform_name} (DEMO Connection).",
        "platform": {
            "id": platform.id,
            "platform_name": platform.platform_name,
            "connection_status": platform.connection_status.value
        }
    }

@router.delete("/{platform_id}")
def disconnect_gig_platform(
    platform_id: str,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    platform = disconnect_platform(db, worker.id, platform_id)
    log_audit_action(db, worker.user_id, "DISCONNECT_PLATFORM", "GigPlatform", platform.id)
    return {"message": "Platform disconnected successfully."}

@router.post("/generate-demo-data")
def generate_demo_data(
    req: GenerateDemoDataSchema = GenerateDemoDataSchema(),
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    res = generate_demo_financial_data(db, worker.id, months=req.months)
    log_audit_action(db, worker.user_id, "GENERATE_DEMO_DATA", "Transaction", None, res)
    return res
