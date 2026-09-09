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
    Seeds default development/demo accounts (Platform Admin, Demo Finance, Demo Capital, Worker) atomically.
    """
    from app.models.lender_organization import LenderOrganization

    # 1. Admin Seed
    for admin_email, admin_name in [
        ("admin@demo.credbridge.local", "System Administrator"),
        ("admin@credbridge.com", "CredBridge Admin")
    ]:
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name=admin_name,
                email=admin_email,
                password_hash=hash_password("Admin@123456"),
                role=UserRole.PLATFORM_ADMIN,
                is_active=True,
                is_demo=True
            )
            db.add(admin)
        else:
            admin.password_hash = hash_password("Admin@123456")
            admin.role = UserRole.PLATFORM_ADMIN
            admin.is_active = True

    # 2. Demo Finance Ltd. (LND-00124)
    org_finance = db.query(LenderOrganization).filter(LenderOrganization.lender_id == "LND-00124").first()
    if not org_finance:
        org_finance = LenderOrganization(
            lender_id="LND-00124",
            organization_name="Demo Finance Ltd.",
            contact_email="contact@demo-finance.local",
            status="ACTIVE",
            is_demo=True
        )
        db.add(org_finance)
        db.flush()

    finance_users = [
        {
            "name": "Demo Finance Admin",
            "email": "lender-admin@demo-finance.local",
            "role": UserRole.LENDER_ADMIN,
            "designation": "Senior Risk Director"
        },
        {
            "name": "Demo Finance Officer",
            "email": "officer@demo-finance.local",
            "role": UserRole.LENDER_OFFICER,
            "designation": "Credit Assessment Officer"
        }
    ]
    for u_def in finance_users:
        u = db.query(User).filter(User.email == u_def["email"]).first()
        if not u:
            u = User(
                name=u_def["name"],
                email=u_def["email"],
                password_hash=hash_password("Password123!"),
                role=u_def["role"],
                is_active=True,
                is_demo=True
            )
            db.add(u)
            db.flush()
            lp = LenderProfile(
                user_id=u.id,
                organization_id=org_finance.id,
                organization_name=org_finance.organization_name,
                designation=u_def["designation"],
                status="ACTIVE"
            )
            db.add(lp)
        else:
            u.password_hash = hash_password("Password123!")
            u.role = u_def["role"]
            u.is_active = True
            if u.lender_profile:
                u.lender_profile.organization_id = org_finance.id
                u.lender_profile.organization_name = org_finance.organization_name

    # 3. Demo Capital Partners (LND-00125)
    org_capital = db.query(LenderOrganization).filter(LenderOrganization.lender_id == "LND-00125").first()
    if not org_capital:
        org_capital = LenderOrganization(
            lender_id="LND-00125",
            organization_name="Demo Capital Partners",
            contact_email="contact@demo-capital.local",
            status="ACTIVE",
            is_demo=True
        )
        db.add(org_capital)
        db.flush()

    capital_users = [
        {
            "name": "Demo Capital Admin",
            "email": "lender-admin@demo-capital.local",
            "role": UserRole.LENDER_ADMIN,
            "designation": "VP Credit Operations"
        },
        {
            "name": "Demo Capital Officer",
            "email": "officer@demo-capital.local",
            "role": UserRole.LENDER_OFFICER,
            "designation": "Underwriting Officer"
        }
    ]
    for u_def in capital_users:
        u = db.query(User).filter(User.email == u_def["email"]).first()
        if not u:
            u = User(
                name=u_def["name"],
                email=u_def["email"],
                password_hash=hash_password("Password123!"),
                role=u_def["role"],
                is_active=True,
                is_demo=True
            )
            db.add(u)
            db.flush()
            lp = LenderProfile(
                user_id=u.id,
                organization_id=org_capital.id,
                organization_name=org_capital.organization_name,
                designation=u_def["designation"],
                status="ACTIVE"
            )
            db.add(lp)
        else:
            u.password_hash = hash_password("Password123!")
            u.role = u_def["role"]
            u.is_active = True
            if u.lender_profile:
                u.lender_profile.organization_id = org_capital.id
                u.lender_profile.organization_name = org_capital.organization_name

    # 4. Worker Seed
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

        try:
            from app.services.platform_service import generate_demo_financial_data
            generate_demo_financial_data(db, wp.id, months=6)
        except Exception:
            pass
    else:
        worker_user.password_hash = hash_password("Password123!")
        worker_user.is_active = True

    # 5. Legacy Lender Seed
    lender_user = db.query(User).filter(User.email == "priya.lender@example.com").first()
    if not lender_user:
        lender_user = User(
            name="Priya Sharma",
            email="priya.lender@example.com",
            password_hash=hash_password("Password123!"),
            role=UserRole.LENDER_ADMIN,
            is_active=True
        )
        db.add(lender_user)
        db.flush()
        lp = LenderProfile(
            user_id=lender_user.id,
            organization_id=org_finance.id,
            organization_name="Demo Finance Ltd.",
            designation="Senior Credit Assessor"
        )
        db.add(lp)
    else:
        lender_user.password_hash = hash_password("Password123!")
        lender_user.is_active = True

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
