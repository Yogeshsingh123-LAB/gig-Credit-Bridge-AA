"""
FastAPI Router for Financial Analytics Endpoints.
Exposes GET /api/v1/analytics/financial-summary for authenticated gig workers.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_worker
from app.models.worker_profile import WorkerProfile
from intelligence.src.models.analytics_result import FinancialAnalyticsResult
from app.services.analytics_service import get_worker_financial_summary

router = APIRouter()

@router.get(
    "/financial-summary",
    response_model=FinancialAnalyticsResult,
    summary="Get Authenticated Worker Financial Summary",
    description="Returns deterministic financial analytics (income, expenses, monthly breakdown, source contribution, volatility, trend, and evidence quality score) for the authenticated gig worker."
)
def get_financial_summary(
    start_date: Optional[str] = Query(default=None, description="Optional start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(default=None, description="Optional end date filter (YYYY-MM-DD)"),
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    return get_worker_financial_summary(
        db,
        worker_id=worker.id,
        start_date=start_date,
        end_date=end_date
    )
