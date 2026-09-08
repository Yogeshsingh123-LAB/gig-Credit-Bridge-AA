from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.db.session import get_db
from app.api.deps import require_worker
from app.models.worker_profile import WorkerProfile
from app.models.enums import TransactionType, TransactionCategory
from app.services.transaction_service import get_worker_transactions, create_manual_transaction

router = APIRouter()

class CreateTransactionSchema(BaseModel):
    platform_id: Optional[str] = None
    transaction_date: datetime
    transaction_type: TransactionType
    amount: float = Field(gt=0)
    category: TransactionCategory
    source: str
    description: Optional[str] = None
    reference_id: str

@router.get("")
def list_transactions(
    platform_id: Optional[str] = Query(None),
    transaction_type: Optional[TransactionType] = Query(None),
    category: Optional[TransactionCategory] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    items, total = get_worker_transactions(
        db, worker.id,
        platform_id=platform_id,
        transaction_type=transaction_type,
        category=category,
        search=search,
        limit=limit,
        offset=offset
    )

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": [
            {
                "id": t.id,
                "platform_id": t.platform_id,
                "transaction_date": t.transaction_date,
                "transaction_type": t.transaction_type.value,
                "amount": t.amount,
                "category": t.category.value,
                "source": t.source,
                "description": t.description,
                "reference_id": t.reference_id,
                "created_at": t.created_at
            } for t in items
        ]
    }

@router.post("")
def add_transaction(
    req: CreateTransactionSchema,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    tx = create_manual_transaction(
        db, worker.id,
        platform_id=req.platform_id,
        transaction_date=req.transaction_date,
        transaction_type=req.transaction_type,
        amount=req.amount,
        category=req.category,
        source=req.source,
        description=req.description,
        reference_id=req.reference_id
    )
    return {
        "message": "Transaction added successfully.",
        "transaction_id": tx.id
    }
