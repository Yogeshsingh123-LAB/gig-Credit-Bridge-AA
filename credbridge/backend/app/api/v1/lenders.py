from fastapi import APIRouter

router = APIRouter(prefix="/lenders", tags=["Lenders"])

@router.get("/")
def lenders_index():
    return {"module": "lenders", "status": "placeholder"}
