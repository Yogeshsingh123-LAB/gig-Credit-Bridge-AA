from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.user import User
from app.models.enums import UserRole
from app.models.worker_profile import WorkerProfile
from app.models.lender_profile import LenderProfile
from app.models.credit_passport import CreditPassport
from app.models.income_verification import IncomeVerification
from app.core.security import hash_password

def seed_demo_accounts(db: Session):
    """
    Seeds default development/demo accounts (Worker, Lender, Admin) atomically.
    """
    # 1. Admin Seed
    admin = db.query(User).filter(User.email == "admin@credbridge.com").first()
    if not admin:
        admin = User(
            name="CredBridge Admin",
            email="admin@credbridge.com",
            password_hash=hash_password("Admin@123456"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)

    # 2. Worker Seed
    worker_user = db.query(User).filter(User.email == "ravi.worker@example.com").first()
    if not worker_user:
        worker_user = User(
            name="Ravi Kumar",
            email="ravi.worker@example.com",
            password_hash=hash_password("Password123!"),
            role=UserRole.WORKER,
            is_active=True
        )
        db.add(worker_user)
        db.flush()
        wp = WorkerProfile(
            user_id=worker_user.id,
            phone="+91 98765 43210",
            city="Bengaluru",
            occupation="Gig Delivery Partner",
            experience_months=18,
            profile_completion=100.0
        )
        db.add(wp)
        db.flush()

        # Seed initial demo financial transactions for Ravi Kumar
        try:
            from app.services.platform_service import generate_demo_financial_data
            generate_demo_financial_data(db, wp.id, months=6)
        except Exception:
            pass

    # 3. Lender Seed
    lender_user = db.query(User).filter(User.email == "priya.lender@example.com").first()
    if not lender_user:
        lender_user = User(
            name="Priya Sharma",
            email="priya.lender@example.com",
            password_hash=hash_password("Password123!"),
            role=UserRole.LENDER,
            is_active=True
        )
        db.add(lender_user)
        db.flush()
        lp = LenderProfile(
            user_id=lender_user.id,
            organization_name="Acme Microfinance Capital",
            designation="Senior Credit Assessor"
        )
        db.add(lp)

    db.commit()

def seed_admin_account(db: Session) -> User:
    seed_demo_accounts(db)
    return db.query(User).filter(User.email == "admin@credbridge.com").first()

def get_admin_dashboard_metrics(db: Session) -> Dict[str, Any]:
    total_users = db.query(User).count()
    workers_count = db.query(User).filter(User.role == UserRole.WORKER).count()
    lenders_count = db.query(User).filter(User.role == UserRole.LENDER).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    verified_workers = db.query(IncomeVerification.worker_id).filter(
        IncomeVerification.verification_status == "VERIFIED"
    ).group_by(IncomeVerification.worker_id).count()

    passports_generated = db.query(CreditPassport).count()

    return {
        "total_users": total_users,
        "workers_count": workers_count,
        "lenders_count": lenders_count,
        "active_users": active_users,
        "verified_workers": verified_workers,
        "passports_generated": passports_generated,
        "system_health": {
            "status": "HEALTHY",
            "database": "CONNECTED",
            "intelligence_engine": "ONLINE",
            "ai_interpreter": "READY"
        }
    }

def get_admin_users_list(db: Session, role: str = None) -> List[Dict[str, Any]]:
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())

    users = query.order_by(desc(User.created_at)).all()
    results = []

    for u in users:
        results.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value,
            "is_active": u.is_active,
            "created_at": u.created_at
        })
    return results
