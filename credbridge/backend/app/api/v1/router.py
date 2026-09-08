from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.platforms import router as platform_router
from app.api.v1.transactions import router as transaction_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.verification import router as verification_router
from app.api.v1.score import router as score_router
from app.api.v1.passport import router as passport_router
from app.api.v1.consent import router as consent_router
from app.api.v1.lenders import router as legacy_lender_router
from app.api.v1.admin_portal import router as admin_portal_router
from app.api.v1.lender_portal import router as lender_portal_router
from app.api.v1.worker_flow import router as worker_flow_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router, tags=["Health"])
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(profile_router, prefix="/profile", tags=["Profile"])
api_v1_router.include_router(platform_router, prefix="/platforms", tags=["Platforms"])
api_v1_router.include_router(transaction_router, prefix="/transactions", tags=["Transactions"])
api_v1_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_v1_router.include_router(verification_router, prefix="/verification", tags=["Verification"])
api_v1_router.include_router(score_router, prefix="/score", tags=["Financial Readiness Score"])
api_v1_router.include_router(passport_router, prefix="/passport", tags=["Credit Passport"])
api_v1_router.include_router(consent_router, prefix="/consent", tags=["Consent Management"])
api_v1_router.include_router(legacy_lender_router, prefix="/lenders", tags=["Legacy Lender"])
api_v1_router.include_router(lender_portal_router, tags=["Lender Portal"])
api_v1_router.include_router(admin_portal_router, tags=["Platform Admin Portal"])

api_v1_router.include_router(worker_flow_router, tags=["Worker Workflow & Verification"])
