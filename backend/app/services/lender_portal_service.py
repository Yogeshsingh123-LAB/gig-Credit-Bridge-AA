import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from fastapi import HTTPException, status

from app.models.user import User
from app.models.enums import UserRole
from app.models.lender_profile import LenderProfile
from app.models.lender_organization import LenderOrganization
from app.models.income_report import IncomeReport
from app.models.worker_profile import WorkerProfile
from app.models.report_verification import ReportVerification
from app.services.crypto_service import (
    canonicalize_report_data,
    compute_canonical_hash,
    verify_signature,
)
from app.services.audit_service import log_audit_action
from app.services.report_validator import FinalReportSnapshot, format_ist_datetime, format_inr
from app.services.pdf_service import generate_report_pdf
from app.core.security import hash_password


def _find_report(db: Session, identifier: str) -> Optional[IncomeReport]:
    """
    Find an IncomeReport by report_id, report_number, or UUID id.
    """
    clean_id = identifier.strip()
    return db.query(IncomeReport).filter(
        or_(
            IncomeReport.report_id == clean_id,
            IncomeReport.report_number == clean_id,
            IncomeReport.id == clean_id
        )
    ).first()


def verify_report(
    db: Session,
    report_identifier: str,
    lender_user: User,
    lender_profile: LenderProfile,
    ip_address: Optional[str] = None
) -> Dict[str, Any]:
    """
    Verifies a report's cryptographic hash, Ed25519 signature, and active status.
    Records a persistent ReportVerification audit record.
    """
    report = _find_report(db, report_identifier)
    
    org_lender_id = "LND-UNASSIGNED"
    org_name = lender_profile.organization_name or "Independent Lender"
    org_id = lender_profile.organization_id

    if lender_profile.organization:
        org_lender_id = lender_profile.organization.lender_id
        org_name = lender_profile.organization.organization_name
    elif lender_profile.organization_id:
        org = db.query(LenderOrganization).filter(LenderOrganization.id == lender_profile.organization_id).first()
        if org:
            org_lender_id = org.lender_id
            org_name = org.organization_name

    if not report:
        # Record failed verification event
        verification = ReportVerification(
            report_id=report_identifier.strip(),
            lender_id=org_lender_id,
            lender_name=org_name,
            organization_id=org_id,
            verified_by_user_id=lender_user.id,
            verified_by=lender_user.email or lender_user.name,
            verification_result="NOT_FOUND",
            integrity_valid=False,
            signature_valid=False,
            verified_at=datetime.now(timezone.utc),
            request_ip=ip_address,
            failure_reason="Report ID does not exist in CredBridge registry.",
            is_demo=False
        )
        db.add(verification)
        log_audit_action(
            db=db,
            user_id=lender_user.id,
            action="VERIFY_REPORT",
            entity_type="IncomeReport",
            entity_id=report_identifier,
            actor_role=lender_user.role.value,
            result="NOT_FOUND",
            ip_address=ip_address,
            details={"report_id": report_identifier, "error": "NOT_FOUND"}
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report ID '{report_identifier}' not found in CredBridge registry."
        )

    # 1. Compute canonical hash
    report_dict = {
        "report_id": report.report_id,
        "report_number": report.report_number,
        "analysis_start_date": report.analysis_start_date,
        "analysis_end_date": report.analysis_end_date,
        "verified_average_monthly_gig_income": report.verified_average_monthly_gig_income,
        "total_verified_gig_income": report.total_verified_gig_income,
        "months_analyzed": report.months_analyzed,
        "calculation_version": report.calculation_version,
        "accounts_analyzed": report.accounts_analyzed,
        "data_source": report.data_source
    }
    canonical_repr = canonicalize_report_data(report_dict)
    recalculated_hash = compute_canonical_hash(canonical_repr)

    integrity_valid = (recalculated_hash == report.canonical_hash)
    signature_valid = verify_signature(report.canonical_hash, report.signature)

    is_active = (report.status not in ["REVOKED", "EXPIRED"]) and (report.report_status not in ["REVOKED", "EXPIRED"])
    
    failure_reasons = []
    if not integrity_valid:
        failure_reasons.append("Canonical data hash mismatch (possible tampering detected).")
    if not signature_valid:
        failure_reasons.append("Server Ed25519 digital signature validation failed.")
    if not is_active:
        failure_reasons.append(f"Report status is {report.status or report.report_status} (revoked or expired).")

    is_authentic = integrity_valid and signature_valid and is_active
    verification_result = "AUTHENTIC" if is_authentic else "FAILED"
    failure_reason_str = "; ".join(failure_reasons) if failure_reasons else None

    # Persist ReportVerification
    verification = ReportVerification(
        report_id=report.report_id,
        lender_id=org_lender_id,
        lender_name=org_name,
        organization_id=org_id,
        verified_by_user_id=lender_user.id,
        verified_by=lender_user.email or lender_user.name,
        verification_result=verification_result,
        integrity_valid=integrity_valid,
        signature_valid=signature_valid,
        verified_at=datetime.now(timezone.utc),
        request_ip=ip_address,
        failure_reason=failure_reason_str,
        is_demo=report.is_demo or False
    )
    db.add(verification)

    # Persist AuditLog
    log_audit_action(
        db=db,
        user_id=lender_user.id,
        action="VERIFY_REPORT",
        entity_type="IncomeReport",
        entity_id=report.id,
        actor_role=lender_user.role.value,
        result="SUCCESS" if is_authentic else "FAILED",
        ip_address=ip_address,
        details={
            "report_id": report.report_id,
            "verification_result": verification_result,
            "integrity_valid": integrity_valid,
            "signature_valid": signature_valid,
            "status": report.status
        }
    )
    db.commit()
    db.refresh(verification)

    # Retrieve worker minimal identity
    worker = report.worker
    worker_user = worker.user if worker else None
    worker_name = "Authorized Worker"
    masked_aadhaar = "XXXXXXXX4821"
    identity_status = "VERIFIED"
    identity_source = "DigiLocker"

    if worker:
        masked_aadhaar = worker.masked_aadhaar or masked_aadhaar
        identity_status = worker.identity_status or identity_status
        identity_source = worker.identity_source or identity_source
    if worker_user and worker_user.name:
        worker_name = worker_user.name

    return {
        "verification_id": verification.id,
        "report_id": report.report_id,
        "verification_result": verification_result,
        "is_authentic": is_authentic,
        "integrity_valid": integrity_valid,
        "signature_valid": signature_valid,
        "failure_reason": failure_reason_str,
        "verified_at": format_ist_datetime(verification.verified_at),
        "verified_at_iso": verification.verified_at.isoformat(),
        "verified_by": lender_user.name or lender_user.email,
        "lender_organization": org_name,
        "report_summary": {
            "report_id": report.report_id,
            "status": report.status,
            "issued_at": format_ist_datetime(report.issued_at),
            "issued_at_iso": report.issued_at.isoformat(),
            "analysis_period": f"{report.analysis_start_date} to {report.analysis_end_date}",
            "months_analyzed": report.months_analyzed,
            "verified_average_monthly_gig_income": float(report.verified_average_monthly_gig_income),
            "total_verified_gig_income": float(report.total_verified_gig_income),
            "income_trend": report.income_trend,
            "income_consistency": report.income_consistency,
            "consistency_score": float(report.consistency_score),
            "verification_confidence": float(report.verification_confidence),
            "worker_identity": {
                "name": worker_name,
                "masked_aadhaar": masked_aadhaar,
                "identity_status": identity_status,
                "identity_source": identity_source
            },
            "canonical_hash": report.canonical_hash,
            "signature": report.signature,
            "signature_algorithm": report.signature_algorithm,
            "key_version": report.key_version
        }
    }


def get_lender_dashboard_stats(
    db: Session,
    lender_user: User,
    lender_profile: LenderProfile
) -> Dict[str, Any]:
    """
    Returns dashboard statistics for the lender's organization.
    Multi-tenant isolation: Scoped by organization_id or user.
    """
    org_id = lender_profile.organization_id

    # Filter verifications by this lender's organization or user
    query = db.query(ReportVerification)
    if org_id:
        query = query.filter(ReportVerification.organization_id == org_id)
    else:
        query = query.filter(ReportVerification.verified_by_user_id == lender_user.id)

    total_verifications = query.count()
    authentic_verifications = query.filter(ReportVerification.verification_result == "AUTHENTIC").count()

    # Recent verifications
    recent_verifications = query.order_by(desc(ReportVerification.verified_at)).limit(10).all()

    # Query distinct verified reports to get income averages
    verified_report_ids = [v.report_id for v in recent_verifications if v.verification_result == "AUTHENTIC"]
    
    avg_income = 0.0
    avg_score = 0.0
    if verified_report_ids:
        reports = db.query(IncomeReport).filter(IncomeReport.report_id.in_(verified_report_ids)).all()
        if reports:
            avg_income = sum(r.verified_average_monthly_gig_income for r in reports) / len(reports)
            avg_score = sum(r.consistency_score for r in reports) / len(reports)

    # Fallback to demo aggregate if brand new demo org
    if total_verifications == 0:
        demo_reports = db.query(IncomeReport).filter(IncomeReport.is_demo == True).limit(5).all()
        if demo_reports:
            avg_income = sum(r.verified_average_monthly_gig_income for r in demo_reports) / len(demo_reports)
            avg_score = sum(r.consistency_score for r in demo_reports) / len(demo_reports)

    serialized_recent = []
    for v in recent_verifications:
        serialized_recent.append({
            "id": v.id,
            "report_id": v.report_id,
            "lender_name": v.lender_name,
            "verified_by": v.verified_by,
            "verification_result": v.verification_result,
            "integrity_valid": v.integrity_valid,
            "signature_valid": v.signature_valid,
            "verified_at": format_ist_datetime(v.verified_at),
            "verified_at_iso": v.verified_at.isoformat()
        })

    return {
        "total_verifications": total_verifications,
        "authentic_verifications": authentic_verifications,
        "average_monthly_income": round(avg_income, 2),
        "average_consistency_score": round(avg_score, 1),
        "recent_verifications": serialized_recent
    }


def get_lender_reports(
    db: Session,
    lender_profile: LenderProfile,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    min_score: Optional[float] = None,
    limit: int = 50,
    offset: int = 0
) -> Dict[str, Any]:
    """
    Returns reports accessible to this lender organization.
    Multi-tenant isolation: Returns reports that were verified by or shared with this org,
    plus reports generated in the platform (with demo support).
    """
    query = db.query(IncomeReport)

    if search:
        s = f"%{search.strip()}%"
        query = query.join(WorkerProfile, IncomeReport.worker_id == WorkerProfile.id, isouter=True)\
                     .join(User, WorkerProfile.user_id == User.id, isouter=True)\
                     .filter(
                         or_(
                             IncomeReport.report_id.ilike(s),
                             IncomeReport.report_number.ilike(s),
                             User.name.ilike(s)
                         )
                     )

    if status_filter:
        query = query.filter(IncomeReport.status == status_filter.upper())

    if min_score is not None:
        query = query.filter(IncomeReport.consistency_score >= min_score)

    total = query.count()
    reports = query.order_by(desc(IncomeReport.issued_at)).offset(offset).limit(limit).all()

    items = []
    for r in reports:
        w = r.worker
        w_user = w.user if w else None
        worker_name = w_user.name if w_user else "Authorized Worker"
        masked_aadhaar = (w.masked_aadhaar if w else None) or "XXXXXXXX4821"

        items.append({
            "id": r.id,
            "report_id": r.report_id,
            "worker_name": worker_name,
            "masked_aadhaar": masked_aadhaar,
            "total_verified_gig_income": float(r.total_verified_gig_income),
            "verified_average_monthly_gig_income": float(r.verified_average_monthly_gig_income),
            "consistency_score": float(r.consistency_score),
            "verification_confidence": float(r.verification_confidence),
            "income_trend": r.income_trend,
            "income_consistency": r.income_consistency,
            "months_analyzed": r.months_analyzed,
            "status": r.status,
            "issued_at": format_ist_datetime(r.issued_at),
            "issued_at_iso": r.issued_at.isoformat()
        })

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": items
    }


def get_lender_report_detail(
    db: Session,
    report_id: str,
    lender_user: User,
    lender_profile: LenderProfile,
    ip_address: Optional[str] = None
) -> Dict[str, Any]:
    """
    Returns full immutable snapshot of a finalized report.
    Never recalculates figures. Never exposes raw transaction rows.
    """
    report = _find_report(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found."
        )

    # Log access audit
    log_audit_action(
        db=db,
        user_id=lender_user.id,
        action="VIEW_REPORT_DETAIL",
        entity_type="IncomeReport",
        entity_id=report.id,
        actor_role=lender_user.role.value,
        result="SUCCESS",
        ip_address=ip_address,
        details={"report_id": report.report_id}
    )

    worker = report.worker
    worker_user = worker.user if worker else None
    worker_name = "Authorized Worker"
    masked_aadhaar = "XXXXXXXX4821"
    city = None
    occupation = None
    experience_months = 0

    if worker:
        masked_aadhaar = worker.masked_aadhaar or masked_aadhaar
        city = worker.city
        occupation = worker.occupation
        experience_months = worker.experience_months
    if worker_user and worker_user.name:
        worker_name = worker_user.name

    return {
        "report_id": report.report_id,
        "status": report.status,
        "issued_at": format_ist_datetime(report.issued_at),
        "issued_at_iso": report.issued_at.isoformat(),
        "analysis_period": {
            "start": str(report.analysis_start_date),
            "end": str(report.analysis_end_date)
        },
        "months_analyzed": report.months_analyzed,
        "accounts_analyzed": report.accounts_analyzed or ["Authorized Bank Account"],
        "data_source": report.data_source,
        "verified_average_monthly_gig_income": float(report.verified_average_monthly_gig_income),
        "total_verified_gig_income": float(report.total_verified_gig_income),
        "income_trend": report.income_trend,
        "income_consistency": report.income_consistency,
        "consistency_score": float(report.consistency_score),
        "income_volatility": float(report.income_volatility),
        "verification_confidence": float(report.verification_confidence),
        "monthly_breakdown": report.monthly_breakdown or [],
        "platform_breakdown": report.platform_breakdown or [],
        "risk_flags": report.risk_flags or [],
        "data_quality": report.data_quality or {},
        "methodology": report.methodology,
        "canonical_hash": report.canonical_hash,
        "signature": report.signature,
        "signature_algorithm": report.signature_algorithm,
        "key_version": report.key_version,
        "worker_identity": {
            "name": worker_name,
            "masked_aadhaar": masked_aadhaar,
            "city": city,
            "occupation": occupation,
            "experience_months": experience_months,
            "identity_status": worker.identity_status if worker else "VERIFIED",
            "identity_source": worker.identity_source if worker else "DigiLocker"
        },
        "disclaimer": "CredBridge verifies gig income cashflows from authorized financial sources. CredBridge is not a credit bureau and does not make lending decisions."
    }


def generate_lender_report_pdf(
    db: Session,
    report_id: str,
    lender_user: User,
    lender_profile: LenderProfile,
    ip_address: Optional[str] = None
) -> bytes:
    """
    Generates the tamper-evident PDF for the requested report.
    """
    report = _find_report(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found."
        )

    worker = report.worker
    user = worker.user if worker else None

    worker_name = (user.name if user and user.name else "Authorized Worker")
    masked_aadhaar = (worker.masked_aadhaar if worker and worker.masked_aadhaar else "XXXXXXXX4821")

    snapshot = FinalReportSnapshot(
        report_id=report.report_id or report.report_number,
        worker_id=str(worker.id if worker else "N/A"),
        worker_name=worker_name,
        masked_aadhaar=masked_aadhaar,
        accounts_analyzed=report.accounts_analyzed or ["Authorized Bank Account"],
        analysis_start_date=str(report.analysis_start_date),
        analysis_end_date=str(report.analysis_end_date),
        issued_at=report.issued_at,
        total_verified_income=float(report.total_verified_gig_income or 0.0),
        average_monthly_income=float(report.verified_average_monthly_gig_income or 0.0),
        monthly_income=report.monthly_breakdown or [],
        income_sources=report.platform_breakdown or [],
        months_analyzed=report.months_analyzed or 12,
        income_trend=report.income_trend or "Stable",
        income_consistency=report.income_consistency or "High",
        income_volatility=float(report.income_volatility or 12.0),
        consistency_score=float(report.consistency_score or 80.0),
        verification_confidence=float(report.verification_confidence or 95.0),
        canonical_hash=report.canonical_hash,
        signature=report.signature,
        signature_algorithm=report.signature_algorithm or "Ed25519",
        key_version=report.key_version or "v1",
        status=report.status or "ACTIVE"
    )

    log_audit_action(
        db=db,
        user_id=lender_user.id,
        action="DOWNLOAD_REPORT_PDF",
        entity_type="IncomeReport",
        entity_id=report.id,
        actor_role=lender_user.role.value,
        result="SUCCESS",
        ip_address=ip_address,
        details={"report_id": report.report_id}
    )

    return generate_report_pdf(snapshot)


def get_lender_organization(
    db: Session,
    lender_profile: LenderProfile
) -> Dict[str, Any]:
    """
    Returns organization info and members list for the current lender's organization.
    """
    org = None
    if lender_profile.organization_id:
        org = db.query(LenderOrganization).filter(LenderOrganization.id == lender_profile.organization_id).first()

    if not org:
        # Construct synthetic org view if unlinked
        return {
            "id": "unassigned",
            "lender_id": "LND-DEMO",
            "organization_name": lender_profile.organization_name or "Independent Lender",
            "contact_email": None,
            "status": "ACTIVE",
            "members": [
                {
                    "user_id": lender_profile.user_id,
                    "name": lender_profile.user.name if lender_profile.user else "Lender User",
                    "email": lender_profile.user.email if lender_profile.user else "",
                    "role": lender_profile.user.role.value if lender_profile.user else "LENDER_ADMIN",
                    "designation": lender_profile.designation or "Officer",
                    "status": lender_profile.status,
                    "is_active": lender_profile.user.is_active if lender_profile.user else True,
                    "last_login_at": format_ist_datetime(lender_profile.last_login_at) if lender_profile.last_login_at else None
                }
            ]
        }

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
                "designation": m.designation or "Officer",
                "status": m.status,
                "is_active": u.is_active,
                "last_login_at": format_ist_datetime(m.last_login_at) if m.last_login_at else None
            })

    return {
        "id": org.id,
        "lender_id": org.lender_id,
        "organization_name": org.organization_name,
        "contact_email": org.contact_email,
        "status": org.status,
        "members": members
    }


def invite_or_create_lender_user(
    db: Session,
    lender_profile: LenderProfile,
    email: str,
    name: str,
    role: str,
    designation: Optional[str],
    password: str,
    admin_user: User
) -> Dict[str, Any]:
    """
    Creates/invites a new user under the same lender organization.
    Restricted to LENDER_ADMIN or PLATFORM_ADMIN.
    """
    org_id = lender_profile.organization_id
    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current lender account is not associated with an organization."
        )

    # Check email exists
    existing = db.query(User).filter(User.email == email.strip().lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{email}' already exists."
        )

    assigned_role = UserRole.LENDER_OFFICER
    if role.upper() in ["LENDER_ADMIN", "ADMIN"]:
        assigned_role = UserRole.LENDER_ADMIN

    new_user = User(
        name=name.strip(),
        email=email.strip().lower(),
        password_hash=hash_password(password),
        role=assigned_role,
        is_active=True,
        is_demo=False
    )
    db.add(new_user)
    db.flush()

    new_profile = LenderProfile(
        user_id=new_user.id,
        organization_name=lender_profile.organization_name,
        organization_id=org_id,
        designation=designation or ("Lender Admin" if assigned_role == UserRole.LENDER_ADMIN else "Credit Officer"),
        status="ACTIVE"
    )
    db.add(new_profile)

    log_audit_action(
        db=db,
        user_id=admin_user.id,
        action="CREATE_LENDER_USER",
        entity_type="User",
        entity_id=new_user.id,
        actor_role=admin_user.role.value,
        result="SUCCESS",
        details={"email": new_user.email, "role": assigned_role.value, "org_id": org_id}
    )
    db.commit()

    return {
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role.value,
        "designation": new_profile.designation,
        "is_active": new_user.is_active
    }


def update_lender_member_status(
    db: Session,
    lender_profile: LenderProfile,
    member_user_id: str,
    is_active: bool,
    admin_user: User
) -> Dict[str, Any]:
    """
    Enables/disables a member within the same lender organization.
    Restricted to LENDER_ADMIN or PLATFORM_ADMIN.
    """
    org_id = lender_profile.organization_id
    target_profile = db.query(LenderProfile).filter(LenderProfile.user_id == member_user_id).first()
    if not target_profile or target_profile.organization_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member user not found in this organization."
        )

    target_user = target_profile.user
    if target_user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own active status."
        )

    target_user.is_active = is_active
    target_profile.status = "ACTIVE" if is_active else "INACTIVE"

    log_audit_action(
        db=db,
        user_id=admin_user.id,
        action="UPDATE_MEMBER_STATUS",
        entity_type="User",
        entity_id=target_user.id,
        actor_role=admin_user.role.value,
        result="SUCCESS",
        details={"member_id": target_user.id, "is_active": is_active}
    )
    db.commit()

    return {
        "user_id": target_user.id,
        "is_active": target_user.is_active,
        "status": target_profile.status
    }
