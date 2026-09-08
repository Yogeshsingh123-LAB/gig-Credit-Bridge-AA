from fastapi import APIRouter

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("/")
def transactions_index():
    return {"module": "transactions", "status": "placeholder"}
