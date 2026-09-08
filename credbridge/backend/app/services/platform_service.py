import random
import uuid
from datetime import datetime, timedelta, timezone, date
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.gig_platform import GigPlatform
from app.models.transaction import Transaction
from app.models.enums import PlatformStatus, TransactionType, TransactionCategory
from app.models.worker_profile import WorkerProfile

DEMO_PLATFORMS = [
    "Uber", "Ola", "Swiggy", "Zomato", "Blinkit", "Zepto", "Amazon", "Urban Company"
]

def get_worker_platforms(db: Session, worker_id: str) -> List[GigPlatform]:
    return db.query(GigPlatform).filter(GigPlatform.worker_id == worker_id).all()

def connect_platform(db: Session, worker_id: str, platform_name: str, account_identifier: str) -> GigPlatform:
    if platform_name not in DEMO_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platform: {platform_name}. Supported platforms: {', '.join(DEMO_PLATFORMS)}"
        )
    
    existing = db.query(GigPlatform).filter(
        GigPlatform.worker_id == worker_id,
        GigPlatform.platform_name == platform_name
    ).first()

    if existing:
        existing.connection_status = PlatformStatus.CONNECTED
        existing.account_identifier = account_identifier
        db.commit()
        db.refresh(existing)
        return existing

    platform = GigPlatform(
        worker_id=worker_id,
        platform_name=platform_name,
        account_identifier=account_identifier,
        connection_status=PlatformStatus.CONNECTED,
        connected_at=datetime.now(timezone.utc)
    )
    db.add(platform)
    db.commit()
    db.refresh(platform)
    return platform

def disconnect_platform(db: Session, worker_id: str, platform_id: str) -> GigPlatform:
    platform = db.query(GigPlatform).filter(
        GigPlatform.id == platform_id,
        GigPlatform.worker_id == worker_id
    ).first()
    if not platform:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Platform connection not found.")
    
    platform.connection_status = PlatformStatus.DISCONNECTED
    db.commit()
    db.refresh(platform)
    return platform

def generate_demo_financial_data(db: Session, worker_id: str, months: int = 6) -> dict:
    """
    Generates 6-12 months of realistic synthetic income and expense transactions for a worker.
    Clear reference IDs and labeled demo metadata.
    """
    worker = db.query(WorkerProfile).filter(WorkerProfile.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found.")

    # 1. Connect 3 primary demo platforms if worker has none
    connected_platforms = get_worker_platforms(db, worker_id)
    if not connected_platforms:
        p1 = connect_platform(db, worker_id, "Uber", f"uber_{worker_id[:6]}")
        p2 = connect_platform(db, worker_id, "Zomato", f"zomato_{worker_id[:6]}")
        p3 = connect_platform(db, worker_id, "Swiggy", f"swiggy_{worker_id[:6]}")
        connected_platforms = [p1, p2, p3]

    # Delete previous demo transactions for clean re-generation
    db.query(Transaction).filter(Transaction.worker_id == worker_id).delete()

    created_txs = []
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=30 * months)

    current_date = start_date
    tx_counter = 1

    while current_date <= end_date:
        # Generate 2-4 income payouts per week
        if random.random() > 0.3:
            platform = random.choice(connected_platforms)
            income_amount = round(random.uniform(800.0, 3200.0), 2)
            
            tx = Transaction(
                worker_id=worker_id,
                platform_id=platform.id,
                transaction_date=current_date,
                transaction_type=TransactionType.CREDIT,
                amount=income_amount,
                category=TransactionCategory.GIG_INCOME,
                source=platform.platform_name,
                description=f"Demo Data - {platform.platform_name} Daily Payout",
                reference_id=f"DEMO_INC_{worker_id[:4]}_{current_date.strftime('%Y%m%d')}_{tx_counter}"
            )
            db.add(tx)
            created_txs.append(tx)
            tx_counter += 1

        # Generate realistic daily expenses (Fuel, Food, Maintenance)
        if random.random() > 0.4:
            exp_type = random.choice([
                (TransactionCategory.FUEL, "Fuel Station - Demo Expense", 250.0, 750.0),
                (TransactionCategory.FOOD, "Lunch / Snack - Demo Expense", 120.0, 350.0),
                (TransactionCategory.MAINTENANCE, "Vehicle Maintenance - Demo", 500.0, 2000.0)
            ])
            exp_amount = round(random.uniform(exp_type[2], exp_type[3]), 2)
            exp_tx = Transaction(
                worker_id=worker_id,
                platform_id=connected_platforms[0].id if connected_platforms else None,
                transaction_date=current_date,
                transaction_type=TransactionType.DEBIT,
                amount=exp_amount,
                category=exp_type[0],
                source="Expense Merchant",
                description=exp_type[1],
                reference_id=f"DEMO_EXP_{worker_id[:4]}_{current_date.strftime('%Y%m%d')}_{tx_counter}"
            )
            db.add(exp_tx)
            created_txs.append(exp_tx)
            tx_counter += 1

        current_date += timedelta(days=random.choice([1, 2]))

    db.commit()

    return {
        "message": f"Successfully generated {len(created_txs)} demo transactions across {months} months.",
        "transaction_count": len(created_txs),
        "platforms_connected": [p.platform_name for p in connected_platforms]
    }
