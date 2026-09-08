from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/")
def analytics_index():
    return {"module": "analytics", "status": "placeholder"}
