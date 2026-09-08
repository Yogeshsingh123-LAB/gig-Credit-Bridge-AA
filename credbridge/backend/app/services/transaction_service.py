from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.transaction import Transaction
from app.models.enums import TransactionType, TransactionCategory

def get_worker_transactions(
    db: Session,
    worker_id: str,
    platform_id: Optional[str] = None,
    transaction_type: Optional[TransactionType] = None,
    category: Optional[TransactionCategory] = None,
    search: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 50,
    offset: int = 0
) -> tuple[List[Transaction], int]:
    """
    Retrieves paginated transactions for an authenticated worker with search and filter capabilities.
    """
    query = db.query(Transaction).filter(Transaction.worker_id == worker_id)

    if platform_id:
        query = query.filter(Transaction.platform_id == platform_id)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if category:
        query = query.filter(Transaction.category == category)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Transaction.description.ilike(search_fmt)) | 
            (Transaction.source.ilike(search_fmt)) |
            (Transaction.reference_id.ilike(search_fmt))
        )
    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)

    total_count = query.count()
    items = query.order_by(desc(Transaction.transaction_date)).offset(offset).limit(limit).all()

    return items, total_count

def create_manual_transaction(
    db: Session,
    worker_id: str,
    platform_id: Optional[str],
    transaction_date: datetime,
    transaction_type: TransactionType,
    amount: float,
    category: TransactionCategory,
    source: str,
    description: str,
    reference_id: str
) -> Transaction:
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction amount must be strictly greater than 0."
        )

    existing = db.query(Transaction).filter(
        Transaction.worker_id == worker_id,
        Transaction.reference_id == reference_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Duplicate transaction reference ID '{reference_id}' already exists."
        )

    tx = Transaction(
        worker_id=worker_id,
        platform_id=platform_id,
        transaction_date=transaction_date,
        transaction_type=transaction_type,
        amount=amount,
        category=category,
        source=source.strip(),
        description=description.strip() if description else None,
        reference_id=reference_id.strip()
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx
