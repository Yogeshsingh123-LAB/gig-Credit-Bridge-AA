# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from app.api.v1 import auth, workers, transactions, verification, analytics, passport, lenders

api_v1_router = APIRouter(prefix="/api/v1")

@api_v1_router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "credbridge-api"
    }

api_v1_router.include_router(auth.router)
api_v1_router.include_router(workers.router)
api_v1_router.include_router(transactions.router)
api_v1_router.include_router(verification.router)
api_v1_router.include_router(analytics.router)
api_v1_router.include_router(passport.router)
api_v1_router.include_router(lenders.router)
