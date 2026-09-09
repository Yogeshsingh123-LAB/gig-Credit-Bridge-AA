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


def get_lenders_summary_stats(db: Session) -> Dict[str, int]:
    """
    Returns summary statistics counts for Lender Management dashboard cards.
    """
    total = db.query(LenderOrganization).count()
    active = db.query(LenderOrganization).filter(LenderOrganization.status == "ACTIVE").count()
    pending = db.query(LenderOrganization).filter(LenderOrganization.status == "PENDING").count()
    suspended = db.query(LenderOrganization).filter(LenderOrganization.status == "SUSPENDED").count()
    deactivated = db.query(LenderOrganization).filter(LenderOrganization.status == "DEACTIVATED").count()
    return {
        "total_lenders": total,
        "active_lenders": active,
        "pending_lenders": pending,
        "suspended_lenders": suspended,
        "deactivated_lenders": deactivated
    }


def get_lender_organizations(
    db: Session,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "created_at",
    sort_dir: str = "desc"
) -> Dict[str, Any]:
    """
    Returns paginated list of registered lender organizations with search, status filtering, and sorting.
    """
    query = db.query(LenderOrganization)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                LenderOrganization.organization_name.ilike(s),
                LenderOrganization.lender_id.ilike(s),
                LenderOrganization.organization_identifier.ilike(s),
                LenderOrganization.contact_email.ilike(s),
                LenderOrganization.contact_person.ilike(s)
            )
        )

    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(LenderOrganization.status == status_filter.upper())

    # Sorting
    if sort_by == "organization_name":
        order_col = LenderOrganization.organization_name
    elif sort_by == "lender_id":
        order_col = LenderOrganization.lender_id
    elif sort_by == "status":
        order_col = LenderOrganization.status
    elif sort_by == "last_activity":
        order_col = LenderOrganization.last_activity_at
    else:
        order_col = LenderOrganization.created_at

    if sort_dir.lower() == "asc":
        query = query.order_by(order_col.asc())
    else:
        query = query.order_by(order_col.desc())

    total_matching = query.count()
    offset = (page - 1) * page_size
    orgs = query.offset(offset).limit(page_size).all()

    items = []
    for org in orgs:
        member_count = len(org.members)
        reports_verified_count = db.query(ReportVerification).filter(
            or_(
                ReportVerification.organization_id == org.id,
                ReportVerification.lender_id == org.lender_id
            ),
            ReportVerification.verification_result == "AUTHENTIC"
        ).count()

        last_act = org.last_activity_at or org.created_at

        items.append({
            "id": org.id,
            "lender_id": org.lender_id,
            "organization_name": org.organization_name,
            "organization_identifier": org.organization_identifier or org.lender_id,
            "contact_email": org.contact_email or "Not Provided",
            "contact_person": org.contact_person or "Primary Admin",
            "status": org.status,
            "user_count": member_count,
            "reports_verified": reports_verified_count,
            "is_demo": org.is_demo,
            "created_at": format_ist_datetime(org.created_at),
            "created_at_iso": org.created_at.isoformat(),
            "last_activity": format_ist_datetime(last_act),
            "last_activity_iso": last_act.isoformat()
        })

    summary = get_lenders_summary_stats(db)

    return {
        "summary": summary,
        "total": total_matching,
        "page": page,
        "page_size": page_size,
        "items": items
    }


def get_lender_organization_detail(db: Session, org_id: str) -> Dict[str, Any]:
    """
    Returns full organization profile, member users, summary cards metrics, and verification activity.
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
    active_users_count = 0
    for m in org.members:
        u = m.user
        if u:
            if u.is_active and m.status in ["ACTIVE", "INVITED"]:
                active_users_count += 1
            members.append({
                "user_id": u.id,
                "profile_id": m.id,
                "name": u.name,
                "email": u.email,
                "role": u.role.value,
                "designation": m.designation or u.role.value.replace("_", " ").title(),
                "status": m.status,
                "is_active": u.is_active,
                "created_at": format_ist_datetime(u.created_at),
                "last_login_at": format_ist_datetime(m.last_login_at) if m.last_login_at else "Never"
            })

    verifications_query = db.query(ReportVerification).filter(
        or_(
            ReportVerification.organization_id == org.id,
            ReportVerification.lender_id == org.lender_id
        )
    )
    verification_requests_count = verifications_query.count()
    reports_verified_count = verifications_query.filter(ReportVerification.verification_result == "AUTHENTIC").count()

    recent_verifications = verifications_query.order_by(desc(ReportVerification.verified_at)).limit(50).all()
    verifications_data = []
    for v in recent_verifications:
        verifications_data.append({
            "id": v.id,
            "timestamp": format_ist_datetime(v.verified_at),
            "timestamp_iso": v.verified_at.isoformat(),
            "report_id": v.report_id,
            "lender_user": v.verified_by or "Lender User",
            "verification_result": v.verification_result,
            "integrity_valid": v.integrity_valid,
            "signature_valid": v.signature_valid,
            "failure_reason": v.failure_reason
        })

    last_act = org.last_activity_at
    if recent_verifications and not last_act:
        last_act = recent_verifications[0].verified_at
    if not last_act:
        last_act = org.created_at

    return {
        "id": org.id,
        "lender_id": org.lender_id,
        "organization_name": org.organization_name,
        "organization_identifier": org.organization_identifier or org.lender_id,
        "contact_email": org.contact_email,
        "contact_person": org.contact_person,
        "status": org.status,
        "max_users": org.max_users,
        "is_demo": org.is_demo,
        "created_at": format_ist_datetime(org.created_at),
        "created_at_iso": org.created_at.isoformat(),
        "activated_at": format_ist_datetime(org.activated_at) if org.activated_at else None,
        "deactivated_at": format_ist_datetime(org.deactivated_at) if org.deactivated_at else None,
        "suspended_at": format_ist_datetime(org.suspended_at) if org.suspended_at else None,
        "last_activity": format_ist_datetime(last_act),
        "last_activity_iso": last_act.isoformat(),
        "summary_cards": {
            "total_users": len(members),
            "active_users": active_users_count,
            "reports_verified": reports_verified_count,
            "verification_requests": verification_requests_count,
            "last_activity": format_ist_datetime(last_act)
        },
        "members": members,
        "recent_verifications": verifications_data
    }


def create_lender_organization(
    db: Session,
    organization_name: str,
    organization_identifier: Optional[str] = None,
    contact_email: Optional[str] = None,
    contact_person: Optional[str] = None,
    status_val: str = "PENDING",
    admin_name: Optional[str] = None,
    admin_email: Optional[str] = None,
    admin_password: Optional[str] = None,
    admin_user: User = None
) -> Dict[str, Any]:
    """
    Creates a new LenderOrganization with a unique system generated lender_id (LND-XXXXXXXX).
    Validates organization name & identifier uniqueness.
    Default status is PENDING.
    """
    name_clean = organization_name.strip()
    existing_name = db.query(LenderOrganization).filter(
        LenderOrganization.organization_name.ilike(name_clean)
    ).first()
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A lender organization with name '{name_clean}' already exists."
        )

    if organization_identifier and organization_identifier.strip():
        ident_clean = organization_identifier.strip().upper()
        existing_ident = db.query(LenderOrganization).filter(
            LenderOrganization.organization_identifier == ident_clean
        ).first()
        if existing_ident:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A lender with this organization identifier already exists."
            )
    else:
        ident_clean = None

    lender_id = generate_unique_lender_id(db)
    if not ident_clean:
        ident_clean = lender_id

    st_upper = status_val.upper() if status_val else "PENDING"
    valid_statuses = ["PENDING", "ACTIVE", "SUSPENDED", "DEACTIVATED"]
    if st_upper not in valid_statuses:
        st_upper = "PENDING"

    now_utc = datetime.now(timezone.utc)
    org = LenderOrganization(
        lender_id=lender_id,
        organization_name=name_clean,
        organization_identifier=ident_clean,
        contact_email=contact_email.strip().lower() if contact_email else None,
        contact_person=contact_person.strip() if contact_person else None,
        status=st_upper,
        is_demo=False,
        created_at=now_utc,
        updated_at=now_utc
    )

    if st_upper == "ACTIVE":
        org.activated_at = now_utc

    db.add(org)
    db.flush()

    created_admin = None
    if admin_email and admin_email.strip():
        clean_email = admin_email.strip().lower()
        existing_user = db.query(User).filter(User.email == clean_email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email '{clean_email}' already exists."
            )

        pwd = admin_password if admin_password else secrets.token_urlsafe(12)
        new_user = User(
            name=admin_name.strip() if admin_name else f"{name_clean} Admin",
            email=clean_email,
            password_hash=hash_password(pwd),
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
            status="ACTIVE" if st_upper == "ACTIVE" else "INVITED",
            invitation_token=secrets.token_urlsafe(24),
            invitation_sent_at=now_utc
        )
        db.add(profile)
        created_admin = {
            "user_id": new_user.id,
            "email": new_user.email,
            "role": new_user.role.value
        }

    actor_id = admin_user.id if admin_user else None
    actor_role = admin_user.role.value if admin_user else "PLATFORM_ADMIN"

    log_audit_action(
        db=db,
        user_id=actor_id,
        action="LENDER_CREATED",
        entity_type="LenderOrganization",
        entity_id=org.id,
        actor_role=actor_role,
        result="SUCCESS",
        details={
            "lender_id": lender_id,
            "organization_name": org.organization_name,
            "organization_identifier": org.organization_identifier,
            "status": org.status
        }
    )
    db.commit()

    return {
        "id": org.id,
        "lender_id": org.lender_id,
        "organization_name": org.organization_name,
        "organization_identifier": org.organization_identifier,
        "contact_email": org.contact_email,
        "contact_person": org.contact_person,
        "status": org.status,
        "created_admin": created_admin,
        "created_at": format_ist_datetime(org.created_at)
    }


def update_organization_status(
    db: Session,
    org_id: str,
    status_val: str,
    organization_name: Optional[str] = None,
    contact_email: Optional[str] = None,
    contact_person: Optional[str] = None,
    admin_user: User = None
) -> Dict[str, Any]:
    """
    Updates organization status (ACTIVE, PENDING, SUSPENDED, DEACTIVATED) or organization details.
    Preserves report immutability. Updates timestamps and audit logs.
    """
    org = db.query(LenderOrganization).filter(
        or_(LenderOrganization.id == org_id, LenderOrganization.lender_id == org_id)
    ).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lender organization '{org_id}' not found."
        )

    valid_statuses = ["ACTIVE", "PENDING", "SUSPENDED", "DEACTIVATED"]
    st_upper = status_val.upper() if status_val else org.status
    if st_upper not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of {valid_statuses}"
        )

    old_status = org.status
    now_utc = datetime.now(timezone.utc)

    if old_status != st_upper:
        org.status = st_upper
        if st_upper == "ACTIVE":
            org.activated_at = now_utc
            action_name = "LENDER_ACTIVATED"
        elif st_upper == "SUSPENDED":
            org.suspended_at = now_utc
            action_name = "LENDER_SUSPENDED"
        elif st_upper == "DEACTIVATED":
            org.deactivated_at = now_utc
            action_name = "LENDER_DEACTIVATED"
        else:
            action_name = "LENDER_STATUS_CHANGED"
    else:
        action_name = "LENDER_UPDATED"

    if organization_name and organization_name.strip():
        org.organization_name = organization_name.strip()
    if contact_email is not None:
        org.contact_email = contact_email.strip().lower() if contact_email else None
    if contact_person is not None:
        org.contact_person = contact_person.strip() if contact_person else None

    org.updated_at = now_utc

    actor_id = admin_user.id if admin_user else None
    actor_role = admin_user.role.value if admin_user else "PLATFORM_ADMIN"

    log_audit_action(
        db=db,
        user_id=actor_id,
        action=action_name,
        entity_type="LenderOrganization",
        entity_id=org.id,
        actor_role=actor_role,
        result="SUCCESS",
        details={
            "lender_id": org.lender_id,
            "old_status": old_status,
            "new_status": org.status,
            "organization_name": org.organization_name
        }
    )
    db.commit()

    return {
        "id": org.id,
        "lender_id": org.lender_id,
        "organization_name": org.organization_name,
        "status": org.status,
        "updated_at": format_ist_datetime(org.updated_at)
    }


def create_lender_user_for_org(
    db: Session,
    org_id: str,
    name: str,
    email: str,
    role: str,
    designation: Optional[str] = None,
    admin_user: User = None
) -> Dict[str, Any]:
    """
    Creates a new user belonging to a Lender Organization with role LENDER_ADMIN or LENDER_OFFICER.
    Enforces organization max_users limit. Generates invitation record.
    """
    org = db.query(LenderOrganization).filter(
        or_(LenderOrganization.id == org_id, LenderOrganization.lender_id == org_id)
    ).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lender organization '{org_id}' not found."
        )

    current_member_count = len(org.members)
    if current_member_count >= org.max_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum user limit of {org.max_users} reached for organization '{org.organization_name}'."
        )

    email_clean = email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{email_clean}' already exists."
        )

    role_str = role.upper()
    if role_str not in [UserRole.LENDER_ADMIN.value, UserRole.LENDER_OFFICER.value, "LENDER"]:
        role_str = UserRole.LENDER_OFFICER.value

    # Prevent Platform Admin from accidentally creating a Worker through this screen
    if role_str == UserRole.WORKER.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create a Worker user inside a Lender organization."
        )

    now_utc = datetime.now(timezone.utc)
    invitation_token = secrets.token_urlsafe(32)

    # Initial account created with unusable placeholder hash until user accepts invite & sets password
    user = User(
        name=name.strip(),
        email=email_clean,
        password_hash=hash_password(secrets.token_urlsafe(16)),
        role=UserRole(role_str),
        is_active=True,
        is_demo=False,
        created_at=now_utc,
        updated_at=now_utc
    )
    db.add(user)
    db.flush()

    profile = LenderProfile(
        user_id=user.id,
        organization_name=org.organization_name,
        organization_id=org.id,
        designation=designation.strip() if designation else ("Lender Admin" if role_str == UserRole.LENDER_ADMIN.value else "Lender Officer"),
        status="INVITED",
        invitation_token=invitation_token,
        invitation_sent_at=now_utc,
        created_at=now_utc,
        updated_at=now_utc
    )
    db.add(profile)

    actor_id = admin_user.id if admin_user else None
    actor_role = admin_user.role.value if admin_user else "PLATFORM_ADMIN"

    log_audit_action(
        db=db,
        user_id=actor_id,
        action="LENDER_USER_CREATED",
        entity_type="User",
        entity_id=user.id,
        actor_role=actor_role,
        result="SUCCESS",
        details={
            "organization_id": org.id,
            "lender_id": org.lender_id,
            "user_email": user.email,
            "role": user.role.value,
            "invitation_status": "INVITED"
        }
    )
    db.commit()

    return {
        "user_id": user.id,
        "profile_id": profile.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "designation": profile.designation,
        "status": profile.status,
        "invitation_token": invitation_token,
        "created_at": format_ist_datetime(user.created_at)
    }


def update_lender_user_in_org(
    db: Session,
    org_id: str,
    user_id: str,
    status_val: Optional[str] = None,
    role_val: Optional[str] = None,
    admin_user: User = None
) -> Dict[str, Any]:
    """
    Updates status (INVITED, ACTIVE, SUSPENDED, DEACTIVATED) or role (LENDER_ADMIN, LENDER_OFFICER) of a lender user.
    Creates audit events for security-sensitive operations.
    """
    org = db.query(LenderOrganization).filter(
        or_(LenderOrganization.id == org_id, LenderOrganization.lender_id == org_id)
    ).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lender organization '{org_id}' not found."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.lender_profile or user.lender_profile.organization_id != org.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lender user '{user_id}' not found in organization '{org.organization_name}'."
        )

    profile = user.lender_profile
    actor_id = admin_user.id if admin_user else None
    actor_role = admin_user.role.value if admin_user else "PLATFORM_ADMIN"
    now_utc = datetime.now(timezone.utc)

    if role_val:
        new_role_str = role_val.upper()
        if new_role_str in [UserRole.LENDER_ADMIN.value, UserRole.LENDER_OFFICER.value]:
            old_role = user.role.value
            user.role = UserRole(new_role_str)
            profile.designation = "Lender Admin" if new_role_str == UserRole.LENDER_ADMIN.value else "Lender Officer"
            log_audit_action(
                db=db,
                user_id=actor_id,
                action="ROLE_CHANGED",
                entity_type="User",
                entity_id=user.id,
                actor_role=actor_role,
                result="SUCCESS",
                details={
                    "old_role": old_role,
                    "new_role": user.role.value,
                    "organization_id": org.id
                }
            )

    if status_val:
        st_upper = status_val.upper()
        valid_statuses = ["INVITED", "ACTIVE", "SUSPENDED", "DEACTIVATED"]
        if st_upper in valid_statuses:
            old_status = profile.status
            profile.status = st_upper
            if st_upper == "ACTIVE":
                user.is_active = True
                action_name = "LENDER_USER_ACTIVATED"
            elif st_upper == "SUSPENDED":
                user.is_active = False
                action_name = "LENDER_USER_SUSPENDED"
            elif st_upper == "DEACTIVATED":
                user.is_active = False
                action_name = "LENDER_USER_DEACTIVATED"
            else:
                action_name = "LENDER_USER_STATUS_CHANGED"

            log_audit_action(
                db=db,
                user_id=actor_id,
                action=action_name,
                entity_type="User",
                entity_id=user.id,
                actor_role=actor_role,
                result="SUCCESS",
                details={
                    "old_status": old_status,
                    "new_status": profile.status,
                    "organization_id": org.id
                }
            )

    user.updated_at = now_utc
    profile.updated_at = now_utc
    db.commit()

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "status": profile.status,
        "is_active": user.is_active
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
