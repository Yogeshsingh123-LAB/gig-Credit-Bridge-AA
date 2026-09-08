from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1 import workers, transactions, verification, analytics, passport, lenders

api_v1_router = APIRouter()

api_v1_router.include_router(health_router, tags=["Health"])
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(workers.router)
api_v1_router.include_router(transactions.router)
api_v1_router.include_router(verification.router)
api_v1_router.include_router(analytics.router)
api_v1_router.include_router(passport.router)
api_v1_router.include_router(lenders.router)
