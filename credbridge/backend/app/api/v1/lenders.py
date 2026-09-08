from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.db.session import get_db
from app.api.deps import require_lender
from app.models.lender_profile import LenderProfile
from app.services.lender_service import (
    get_lender_dashboard_stats, get_lender_applicants, get_lender_applicant_detail, run_lender_simulator
)
from intelligence.src.analytics.whatif_simulator import WhatIfSimulationRequest

router = APIRouter()

class SimulatorRequestSchema(BaseModel):
    worker_id: str
    income_change_pct: float = Field(default=0.0)
    expense_change_pct: float = Field(default=0.0)
    additional_monthly_income: float = Field(default=0.0, ge=0)
    additional_income_source: Optional[str] = None
    improved_consistency_months: int = Field(default=0, ge=0)

@router.get("/dashboard")
def lender_dashboard(
    lender: LenderProfile = Depends(require_lender),
    db: Session = Depends(get_db)
):
    return get_lender_dashboard_stats(db, lender.id)

@router.get("/applicants")
def list_applicants(
    lender: LenderProfile = Depends(require_lender),
    db: Session = Depends(get_db)
):
    return get_lender_applicants(db, lender.id)

@router.get("/applicant/{worker_id}")
def get_applicant_detail(
    worker_id: str,
    lender: LenderProfile = Depends(require_lender),
    db: Session = Depends(get_db)
):
    return get_lender_applicant_detail(db, lender.id, worker_id)

@router.post("/simulator")
def run_simulator(
    req: SimulatorRequestSchema,
    lender: LenderProfile = Depends(require_lender),
    db: Session = Depends(get_db)
):
    sim_req = WhatIfSimulationRequest(
        income_change_pct=req.income_change_pct,
        expense_change_pct=req.expense_change_pct,
        additional_monthly_income=req.additional_monthly_income,
        additional_income_source=req.additional_income_source,
        improved_consistency_months=req.improved_consistency_months
    )
    return run_lender_simulator(db, lender.id, req.worker_id, sim_req)
