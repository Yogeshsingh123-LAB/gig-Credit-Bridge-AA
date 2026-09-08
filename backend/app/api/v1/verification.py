from fastapi import APIRouter

router = APIRouter(prefix="/verification", tags=["AA Verification"])

@router.get("/")
def verification_index():
    return {"module": "verification", "status": "placeholder"}
