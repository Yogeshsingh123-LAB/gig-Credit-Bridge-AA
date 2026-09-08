from fastapi import APIRouter

router = APIRouter(prefix="/workers", tags=["Gig Workers"])

@router.get("/")
def workers_index():
    return {"module": "workers", "status": "placeholder"}
