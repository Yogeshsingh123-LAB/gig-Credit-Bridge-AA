"""
FastAPI Router for Financial Analytics Endpoints (Phase 2).
Exposes GET /api/v1/analytics/financial-summary for authenticated gig workers.
"""

from typing import Optional
from fastapi import APIRouter, Header, Query, HTTPException, status
from intelligence.src.models.analytics_result import FinancialAnalyticsResult
from app.services.analytics_service import get_worker_financial_summary

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/")
def analytics_index():
    return {"module": "analytics", "status": "active"}


@router.get(
    "/financial-summary",
    response_model=FinancialAnalyticsResult,
    summary="Get Authenticated Worker Financial Summary",
    description="Returns deterministic financial analytics (income, expenses, monthly breakdown, source contribution, volatility, trend, and evidence quality score) for the authenticated gig worker."
)
def get_financial_summary(
    start_date: Optional[str] = Query(default=None, description="Optional start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(default=None, description="Optional end date filter (YYYY-MM-DD)"),
    x_worker_id: Optional[str] = Header(default="worker_gig_101", description="Authenticated Worker ID context header")
):
    if not x_worker_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials missing or invalid"
        )

    return get_worker_financial_summary(
        worker_id=x_worker_id,
        start_date=start_date,
        end_date=end_date
    )
