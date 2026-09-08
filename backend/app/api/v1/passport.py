from fastapi import APIRouter

router = APIRouter(prefix="/passport", tags=["Credit Passport"])

@router.get("/")
def passport_index():
    return {"module": "passport", "status": "placeholder"}
