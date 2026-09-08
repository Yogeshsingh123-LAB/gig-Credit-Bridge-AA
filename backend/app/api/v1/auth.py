from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/")
def auth_index():
    return {"module": "auth", "status": "placeholder"}
