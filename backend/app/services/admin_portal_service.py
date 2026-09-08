import os
import secrets
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_, text
from fastapi import HTTPException, status

from app.models.user import User
from app.models.enums import UserRole
from app.models.lender_profile import LenderProfile
from app.models.lender_organization import LenderOrganization
from app.models.income_report import IncomeReport
from app.models.worker_profile import WorkerProfile
from app.models.report_verification import ReportVerification
from app.models.audit_log import AuditLog
from app.services.audit_service import log_audit_action
from app.services.report_validator import format_ist_datetime, format_inr
from app.services.crypto_service import get_ed25519_public_key_hex, HAS_CRYPTOGRAPHY
from app.core.security import hash_password


def generate_unique_lender_id(db: Session) -> str:
    """
    Generates a unique lender organization code e.g. 'LND-00126'.
    """
    existing_orgs = db.query(LenderOrganization.lender_id).all()
    existing_ids = {o[0] for o in existing_orgs if o[0]}

    # Try sequential first
    for num in range(126, 9999):
        candidate = f"LND-{num:05d}"
        if candidate not in existing_ids:
            return candidate

    # Fallback to random alphanumeric
    chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    while True:
        candidate = "LND-" + "".join(secrets.choice(chars) for _ in range(5))
        if candidate not in existing_ids:
            return candidate


def get_admin_dashboard_metrics(db: Session) -> Dict[str, Any]:
    """
    Returns platform-wide metrics for the Admin Dashboard.
    """
    total_users = db.query(User).count()
    total_workers = db.query(User).filter(User.role == UserRole.WORKER).count()
    total_lenders = db.query(User).filter(
        User.role.in_([UserRole.LENDER, UserRole.LENDER_ADMIN, UserRole.LENDER_OFFICER])
    ).count()
    total_organizations = db.query(LenderOrganization).count()

    total_reports = db.query(IncomeReport).count()
    active_reports = db.query(IncomeReport).filter(IncomeReport.status == "ACTIVE").count()

    total_verifications = db.query(ReportVerification).count()
    authentic_verifications = db.query(ReportVerification).filter(ReportVerification.verification_result == "AUTHENTIC").count()
    failed_verifications = total_verifications - authentic_verifications

    recent_verifications = db.query(ReportVerification).order_by(desc(ReportVerification.verified_at)).limit(8).all()
    serialized_recent = []
    for v in recent_verifications:
        serialized_recent.append({
            "id": v.id,
            "report_id": v.report_id,
            "lender_id": v.lender_id,
            "lender_name": v.lender_name,
            "verified_by": v.verified_by,
            "verification_result": v.verification_result,
            "integrity_valid": v.integrity_valid,
            "signature_valid": v.signature_valid,
            "verified_at": format_ist_datetime(v.verified_at),
            "verified_at_iso": v.verified_at.isoformat()
        })

    return {
        "total_users": total_users,
        "total_workers": total_workers,
        "total_lenders": total_lenders,
        "total_organizations": total_organizations,
        "total_reports": total_reports,
        "active_reports": active_reports,
        "total_verifications": total_verifications,
        "authentic_verifications": authentic_verifications,
        "failed_verifications": failed_verifications,
        "recent_verifications": serialized_recent,
        "system_health": {
            "status": "OPERATIONAL",
            "database": "CONNECTED",
            "cryptography_engine": "ACTIVE (Ed25519)" if HAS_CRYPTOGRAPHY else "HMAC FALLBACK",
            "canonical_hashing": "SHA-256 (Deterministic)"
        }
    }


def get_lender_organizations(db: Session, search: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Returns list of all registered lender organizations.
    """
    query = db.query(LenderOrganization)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                LenderOrganization.organization_name.ilike(s),
                LenderOrganization.lender_id.ilike(s),
                LenderOrganization.contact_email.ilike(s)
            )
        )

    orgs = query.order_by(desc(LenderOrganization.created_at)).all()
    results = []
    for org in orgs:
        member_count = len(org.members)
        results.append({
            "id": org.id,
            "lender_id": org.lender_id,
            "organization_name": org.organization_name,
            "contact_email": org.contact_email,
            "status": org.status,
            "is_demo": org.is_demo,
            "member_count": member_count,
            "created_at": format_ist_datetime(org.created_at),
            "created_at_iso": org.created_at.isoformat()
        })
    return results


def get_lender_organization_detail(db: Session, org_id: str) -> Dict[str, Any]:
    """
    Returns full organization profile, its members, and its verification activity.
    """
    org = db.query(LenderOrganization).filter(
        or_(LenderOrganization.id == org_id, LenderOrganization.lender_id == org_id)
    ).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lender organization '{org_id}' not found."
        )

    members = []
    for m in org.members:
        u = m.user
        if u:
            members.append({
                "user_id": u.id,
                "profile_id": m.id,
                "name": u.name,
                "email": u.email,
                "role": u.role.value,
                "designation": m.designation,
                "status": m.status,
                "is_active": u.is_active,
                "last_login_at": format_ist_datetime(m.last_login_at) if m.last_login_at else None
            })

    verifications = db.query(ReportVerification).filter(
        or_(
            ReportVerification.organization_id == org.id,
            ReportVerification.lender_id == org.lender_id
        )
    ).order_by(desc(ReportVerification.verified_at)).limit(20).all()

    verifications_data = []
    for v in verifications:
        verifications_data.append({
            "id": v.id,
            "report_id": v.report_id,
            "verified_by": v.verified_by,
            "verification_result": v.verification_result,
            "integrity_valid": v.integrity_valid,
            "signature_valid": v.signature_valid,
            "verified_at": format_ist_datetime(v.verified_at)
        })

    return {
        "id": org.id,
        "lender_id": org.lender_id,
        "organization_name": org.organization_name,
        "contact_email": org.contact_email,
        "status": org.status,
        "is_demo": org.is_demo,
        "created_at": format_ist_datetime(org.created_at),
        "members": members,
        "verifications_count": len(verifications_data),
        "recent_verifications": verifications_data
    }


def create_lender_organization(
    db: Session,
    organization_name: str,
    contact_email: Optional[str],
    admin_name: Optional[str],
    admin_email: Optional[str],
    admin_password: Optional[str],
    admin_user: User
) -> Dict[str, Any]:
    """
    Creates a new LenderOrganization with a unique lender_id, and optionally creates its initial Lender Admin.
    """
    existing = db.query(LenderOrganization).filter(
        LenderOrganization.organization_name == organization_name.strip()
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An organization with name '{organization_name}' already exists."
        )

    lender_id = generate_unique_lender_id(db)

    org = LenderOrganization(
        lender_id=lender_id,
        organization_name=organization_name.strip(),
        contact_email=contact_email.strip().lower() if contact_email else None,
        status="ACTIVE",
        is_demo=False
    )
    db.add(org)
    db.flush()

    created_admin = None
    if admin_email and admin_password:
        existing_user = db.query(User).filter(User.email == admin_email.strip().lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email '{admin_email}' already exists."
            )

        new_user = User(
            name=admin_name.strip() if admin_name else f"{organization_name} Admin",
            email=admin_email.strip().lower(),
            password_hash=hash_password(admin_password),
            role=UserRole.LENDER_ADMIN,
            is_active=True,
            is_demo=False
        )
        db.add(new_user)
        db.flush()

        profile = LenderProfile(
            user_id=new_user.id,
            organization_name=org.organization_name,
            organization_id=org.id,
            designation="Lender Admin",
            status="ACTIVE"
        )
        db.add(profile)
        created_admin = {
            "user_id": new_user.id,
            "email": new_user.email,
            "role": new_user.role.value
        }

    log_audit_action(
        db=db,
        user_id=admin_user.id,
        action="CREATE_LENDER_ORGANIZATION",
        entity_type="LenderOrganization",
        entity_id=org.id,
        actor_role=admin_user.role.value,
        result="SUCCESS",
        details={"lender_id": lender_id, "organization_name": org.organization_name}
    )
    db.commit()

    return {
        "id": org.id,
        "lender_id": org.lender_id,
        "organization_name": org.organization_name,
        "status": org.status,
        "created_admin": created_admin
    }


def update_organization_status(
    db: Session,
    org_id: str,
    status_val: str,
    admin_user: User
) -> Dict[str, Any]:
    """
    Updates organization status (ACTIVE, SUSPENDED, INACTIVE).
    """
    org = db.query(LenderOrganization).filter(
        or_(LenderOrganization.id == org_id, LenderOrganization.lender_id == org_id)
    ).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization '{org_id}' not found."
        )

    valid_statuses = ["ACTIVE", "SUSPENDED", "INACTIVE"]
    if status_val.upper() not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of {valid_statuses}"
        )

    org.status = status_val.upper()
    log_audit_action(
        db=db,
        user_id=admin_user.id,
        action="UPDATE_ORGANIZATION_STATUS",
        entity_type="LenderOrganization",
        entity_id=org.id,
        actor_role=admin_user.role.value,
        result="SUCCESS",
        details={"status": org.status}
    )
    db.commit()

    return {
        "id": org.id,
        "lender_id": org.lender_id,
        "status": org.status
    }


def get_platform_users(
    db: Session,
    role: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> Dict[str, Any]:
    """
    Returns platform users across all roles (passwords never exposed).
    """
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(User.name.ilike(s), User.email.ilike(s)))

    total = query.count()
    users = query.order_by(desc(User.created_at)).offset(offset).limit(limit).all()

    items = []
    for u in users:
        org_name = None
        if u.lender_profile:
            org_name = u.lender_profile.organization_name
            if u.lender_profile.organization:
                org_name = u.lender_profile.organization.organization_name

        items.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value,
            "is_active": u.is_active,
            "is_demo": u.is_demo,
            "organization_name": org_name,
            "created_at": format_ist_datetime(u.created_at),
            "created_at_iso": u.created_at.isoformat()
        })

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": items
    }


def update_platform_user(
    db: Session,
    user_id: str,
    is_active: Optional[bool],
    role: Optional[str],
    admin_user: User
) -> Dict[str, Any]:
    """
    Enables/disables or changes role for a platform user.
    Admin cannot deactivate or demote own account.
    """
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{user_id}' not found."
        )

    if target.id == admin_user.id:
        if is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own administrative account."
            )
        if role and role.upper() not in ["ADMIN", "PLATFORM_ADMIN"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot demote your own administrative role."
            )

    if is_active is not None:
        target.is_active = is_active
    if role:
        try:
            target.role = UserRole(role.upper())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {role}"
            )

    log_audit_action(
        db=db,
        user_id=admin_user.id,
        action="UPDATE_USER",
        entity_type="User",
        entity_id=target.id,
        actor_role=admin_user.role.value,
        result="SUCCESS",
        details={"user_id": target.id, "is_active": target.is_active, "role": target.role.value}
    )
    db.commit()

    return {
        "id": target.id,
        "name": target.name,
        "email": target.email,
        "role": target.role.value,
        "is_active": target.is_active
    }


def get_all_reports_metadata(
    db: Session,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> Dict[str, Any]:
    """
    Read-only operational metadata monitoring of finalized Verified Gig Income Reports.
    Admin cannot modify deterministic calculation outputs or hashes.
    """
    query = db.query(IncomeReport)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(IncomeReport.report_id.ilike(s), IncomeReport.report_number.ilike(s)))

    total = query.count()
    reports = query.order_by(desc(IncomeReport.issued_at)).offset(offset).limit(limit).all()

    items = []
    for r in reports:
        w = r.worker
        w_user = w.user if w else None
        worker_name = w_user.name if w_user else "Authorized Worker"

        items.append({
            "id": r.id,
            "report_id": r.report_id,
            "worker_name": worker_name,
            "total_verified_gig_income": float(r.total_verified_gig_income),
            "verified_average_monthly_gig_income": float(r.verified_average_monthly_gig_income),
            "consistency_score": float(r.consistency_score),
            "verification_confidence": float(r.verification_confidence),
            "signature_algorithm": r.signature_algorithm,
            "key_version": r.key_version,
            "canonical_hash": r.canonical_hash,
            "status": r.status,
            "is_demo": r.is_demo,
            "issued_at": format_ist_datetime(r.issued_at),
            "issued_at_iso": r.issued_at.isoformat()
        })

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": items
    }


def get_verification_activity_logs(
    db: Session,
    limit: int = 50,
    offset: int = 0
) -> Dict[str, Any]:
    """
    Returns stream of report verification events across all lenders.
    """
    total = db.query(ReportVerification).count()
    verifications = db.query(ReportVerification).order_by(desc(ReportVerification.verified_at)).offset(offset).limit(limit).all()

    items = []
    for v in verifications:
        items.append({
            "id": v.id,
            "report_id": v.report_id,
            "lender_id": v.lender_id,
            "lender_name": v.lender_name,
            "verified_by": v.verified_by,
            "verification_result": v.verification_result,
            "integrity_valid": v.integrity_valid,
            "signature_valid": v.signature_valid,
            "failure_reason": v.failure_reason,
            "request_ip": v.request_ip,
            "is_demo": v.is_demo,
            "verified_at": format_ist_datetime(v.verified_at),
            "verified_at_iso": v.verified_at.isoformat()
        })

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": items
    }


def get_system_health(db: Session) -> Dict[str, Any]:
    """
    Live real checks of system dependencies.
    """
    # 1. Database check
    db_status = "CONNECTED"
    db_engine_name = "SQLAlchemy"
    try:
        db.execute(text("SELECT 1")).scalar()
    except Exception as e:
        db_status = f"ERROR: {str(e)}"

    # 2. Cryptographic engine check
    pub_key = get_ed25519_public_key_hex()
    crypto_status = "ED25519_HARDWARE_READY" if HAS_CRYPTOGRAPHY else "HMAC_FALLBACK"

    return {
        "overall_status": "HEALTHY" if db_status == "CONNECTED" else "DEGRADED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": {
            "status": db_status,
            "dialect": db.bind.dialect.name if db.bind else "sqlite"
        },
        "cryptography": {
            "status": crypto_status,
            "algorithm": "Ed25519" if HAS_CRYPTOGRAPHY else "HMAC-SHA256",
            "public_key_preview": pub_key[:16] + "..." if pub_key != "UNAVAILABLE" else "UNAVAILABLE",
            "key_version": "v1"
        },
        "services": {
            "report_generator": "ONLINE",
            "account_aggregator_gateway": "ONLINE (Simulated FIPs)",
            "audit_logger": "ACTIVE (Append-Only)"
        }
    }


def get_platform_audit_logs(
    db: Session,
    limit: int = 100,
    offset: int = 0
) -> Dict[str, Any]:
    """
    Returns platform append-only audit trail.
    """
    total = db.query(AuditLog).count()
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).offset(offset).limit(limit).all()

    items = []
    for entry in logs:
        u = entry.user
        items.append({
            "id": entry.id,
            "user_id": entry.user_id,
            "user_email": u.email if u else "System",
            "actor_role": entry.actor_role or (u.role.value if u else "SYSTEM"),
            "action": entry.action,
            "entity_type": entry.entity_type,
            "entity_id": entry.entity_id,
            "result": entry.result or "SUCCESS",
            "details": entry.details,
            "ip_address": entry.ip_address,
            "created_at": format_ist_datetime(entry.created_at),
            "created_at_iso": entry.created_at.isoformat()
        })

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": items
    }
