from fastapi import APIRouter

router = APIRouter()

@router.get("/health", summary="Health Check Endpoint")
def health_check():
    """
    Independent service health check endpoint for Phase 1.
    """
    return {
        "status": "ok",
        "service": "credbridge-api"
    }
