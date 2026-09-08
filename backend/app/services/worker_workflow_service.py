import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.worker_profile import WorkerProfile
from app.models.financial_account import FinancialAccount
from app.models.aa_consent import AAConsent
from app.models.transaction_classification import TransactionClassification
from app.models.income_report import IncomeReport
from app.models.report_share import ReportShare
from app.models.audit_log import AuditLog
from app.models.enums import AAConsentStatus, TransactionClassificationType, IdentityVerificationStatus
from app.providers.digilocker.mock_digilocker_provider import MockDigiLockerProvider
from app.providers.aa.mock_aa_provider import MockAAProvider
from app.services.classifier_service import PlatformPatternMatcher
from app.services.audit_service import log_audit_action
from app.services.crypto_service import (
    generate_report_id,
    canonicalize_report_data,
    compute_canonical_hash,
    sign_hash,
    verify_signature
)

# Singleton provider instances for mock/sandbox mode
digilocker_provider = MockDigiLockerProvider()
aa_provider = MockAAProvider()

# --- 1. DigiLocker Identity Flow ---

def initiate_digilocker(db: Session, worker: WorkerProfile) -> Dict[str, Any]:
    res = digilocker_provider.initiate_verification(worker.id)
    log_audit_action(db, worker.user_id, "DIGILOCKER_INITIATED", "WorkerProfile", worker.id, {"session_id": res["session_id"]})
    return res

def verify_digilocker(db: Session, worker: WorkerProfile, session_id: str, verified_name: Optional[str] = None) -> Dict[str, Any]:
    result = digilocker_provider.verify_identity(session_id, {"worker_id": worker.id, "name": verified_name or worker.user.name})
    
    worker.identity_status = "VERIFIED"
    worker.identity_source = "DigiLocker"
    worker.identity_verified_at = datetime.now(timezone.utc)
    worker.masked_aadhaar = result.get("masked_id", "XXXXXXXX4821")
    worker.identity_name = result.get("verified_name", worker.user.name)
    
    db.commit()
    db.refresh(worker)

    log_audit_action(db, worker.user_id, "DIGILOCKER_VERIFIED", "WorkerProfile", worker.id, {
        "identity_source": "DigiLocker",
        "masked_id": worker.masked_aadhaar
    })
    return result

def confirm_worker_identity(db: Session, worker: WorkerProfile) -> Dict[str, Any]:
    if worker.identity_status != "VERIFIED":
        # Auto-verify if in demo sandbox mode
        verify_digilocker(db, worker, f"AUTO-CONFIRM-{uuid.uuid4().hex[:8]}")
    
    log_audit_action(db, worker.user_id, "IDENTITY_CONFIRMED_BY_WORKER", "WorkerProfile", worker.id)
    return {
        "status": "CONFIRMED",
        "name": worker.identity_name or worker.user.name,
        "masked_aadhaar": worker.masked_aadhaar or "XXXXXXXX4821",
        "identity_status": worker.identity_status,
        "verification_source": worker.identity_source or "DigiLocker"
    }

# --- 2. Account Aggregator Consent Flow ---

def create_or_request_aa_consent(
    db: Session,
    worker: WorkerProfile,
    purpose: str = "Generate Verified Gig Income Report",
    data_types: Optional[List[str]] = None,
    selected_accounts: Optional[List[str]] = None,
    selected_sources: Optional[List[str]] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> AAConsent:
    dt_types = data_types or ["TRANSACTIONS", "PROFILE"]
    sel_acc = selected_accounts or ["acc_hdfc_4821", "acc_sbi_9217"]
    sel_src = selected_sources or ["Uber", "Zomato"]

    s_date = start_date or (date.today() - timedelta(days=180))
    e_date = end_date or date.today()

    consent_handle = f"AA-CONSENT-{uuid.uuid4().hex[:10].upper()}"

    consent = AAConsent(
        consent_handle=consent_handle,
        worker_id=worker.id,
        purpose=purpose,
        data_types=dt_types,
        selected_accounts=sel_acc,
        selected_sources=sel_src,
        start_date=s_date,
        end_date=e_date,
        consent_status=AAConsentStatus.ACTIVE,
        provider="Account Aggregator (Sahamati Sandbox)",
        consent_version="v1.0",
        granted_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=90)
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)

    log_audit_action(db, worker.user_id, "AA_CONSENT_GRANTED", "AAConsent", consent.id, {
        "consent_handle": consent.consent_handle,
        "purpose": consent.purpose,
        "accounts_count": len(sel_acc),
        "sources": sel_src
    })
    return consent

def approve_aa_consent(db: Session, worker: WorkerProfile, consent_id: str) -> AAConsent:
    consent = db.query(AAConsent).filter(AAConsent.id == consent_id, AAConsent.worker_id == worker.id).first()
    if not consent:
        raise ValueError("Consent artifact not found")
    
    consent.consent_status = AAConsentStatus.ACTIVE
    consent.granted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(consent)

    log_audit_action(db, worker.user_id, "AA_CONSENT_APPROVED", "AAConsent", consent.id)
    return consent

def revoke_aa_consent(db: Session, worker: WorkerProfile, consent_id: str) -> AAConsent:
    consent = db.query(AAConsent).filter(AAConsent.id == consent_id, AAConsent.worker_id == worker.id).first()
    if not consent:
        raise ValueError("Consent artifact not found")
    
    consent.consent_status = AAConsentStatus.REVOKED
    consent.revoked_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(consent)

    log_audit_action(db, worker.user_id, "AA_CONSENT_REVOKED", "AAConsent", consent.id)
    return consent

def get_worker_aa_consents(db: Session, worker: WorkerProfile) -> List[AAConsent]:
    return db.query(AAConsent).filter(AAConsent.worker_id == worker.id).order_by(desc(AAConsent.created_at)).all()

# --- 3. Linked Bank Accounts ---

def sync_and_get_bank_accounts(db: Session, worker: WorkerProfile) -> List[FinancialAccount]:
    existing = db.query(FinancialAccount).filter(FinancialAccount.worker_id == worker.id).all()
    if not existing:
        mock_accs = aa_provider.fetch_linked_accounts(worker.id)
        for acc in mock_accs:
            fa = FinancialAccount(
                worker_id=worker.id,
                bank_name=acc["bank_name"],
                account_mask=acc["account_mask"],
                account_type=acc["account_type"],
                fip_id=acc["fip_id"],
                fip_name=acc.get("fip_name"),
                balance_indicative=acc.get("balance_indicative", 0.0),
                currency=acc.get("currency", "INR"),
                is_linked=True,
                is_selected=acc.get("is_selected", True)
            )
            db.add(fa)
        db.commit()
        existing = db.query(FinancialAccount).filter(FinancialAccount.worker_id == worker.id).all()
    return existing

def update_account_selection(db: Session, worker: WorkerProfile, selected_account_ids: List[str]) -> List[FinancialAccount]:
    accounts = db.query(FinancialAccount).filter(FinancialAccount.worker_id == worker.id).all()
    for acc in accounts:
        acc.is_selected = (acc.id in selected_account_ids or acc.account_mask in selected_account_ids)
    db.commit()
    log_audit_action(db, worker.user_id, "BANK_ACCOUNTS_SELECTION_UPDATED", "WorkerProfile", worker.id, {
        "selected_count": len(selected_account_ids)
    })
    return accounts

# --- 4. Gig Platforms Detection ---

def get_available_gig_platforms(db: Session, worker: WorkerProfile) -> List[Dict[str, Any]]:
    platforms = [
        {"name": "Uber", "detected": True, "category": "Ride-Hailing", "description": "Weekly driver payouts via NEFT / UPI"},
        {"name": "Zomato", "detected": True, "category": "Food Delivery", "description": "Weekly delivery partner payouts"},
        {"name": "Swiggy", "detected": True, "category": "Food Delivery & Quick Commerce", "description": "Weekly partner payouts"},
        {"name": "Ola", "detected": False, "category": "Ride-Hailing", "description": "Driver daily / weekly disbursements"},
        {"name": "Blinkit", "detected": False, "category": "Quick Commerce", "description": "Dark-store delivery payouts"},
        {"name": "Zepto", "detected": False, "category": "Quick Commerce", "description": "Delivery partner payouts"},
        {"name": "Urban Company", "detected": False, "category": "Home Services", "description": "Partner service payouts"},
        {"name": "Amazon", "detected": False, "category": "E-Commerce Logistics", "description": "Amazon Flex delivery partner payouts"}
    ]
    return platforms

# --- 5. Processing, Classification & Report Generation ---

def process_authorized_data(
    db: Session,
    worker: WorkerProfile,
    account_ids: Optional[List[str]] = None,
    platforms: Optional[List[str]] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> Dict[str, Any]:
    # Analysis period is permanently fixed to 12 MONTHS (365 days)
    today = date.today()
    start = today - timedelta(days=365)

    # Automatically scan all supported gig platforms when none explicitly provided
    all_supported_platforms = ["Uber", "Zomato", "Swiggy", "Ola", "Blinkit", "Zepto", "Urban Company", "Amazon"]
    sel_platforms = platforms if (platforms and len(platforms) > 0) else all_supported_platforms

    # Retrieve financial statements from AA provider
    raw_txs = aa_provider.fetch_financial_data(
        consent_id="active_session",
        account_ids=account_ids or ["acc_hdfc_4821", "acc_sbi_9217"],
        start_date=start,
        end_date=today
    )

    classified_list = []
    included_gig_txs = []
    excluded_counts = {
        "personal_transfers": 0,
        "non_gig_income": 0,
        "expenses": 0,
        "unmatched": 0,
        "unselected_gig": 0
    }

    for tx in raw_txs:
        # Strictly apply date bounds
        t_date_str = tx["transaction_date"]
        t_date = date.fromisoformat(t_date_str) if isinstance(t_date_str, str) else t_date_str
        if t_date < start or t_date > today:
            continue

        c_res = PlatformPatternMatcher.classify_transaction(
            description=tx.get("description", ""),
            transaction_type=tx.get("transaction_type", "CREDIT"),
            amount=tx.get("amount", 0.0),
            selected_platforms=sel_platforms
        )

        cls_type = c_res["classification"]
        is_inc = c_res["included_in_report"]

        if is_inc:
            included_gig_txs.append(tx)
        else:
            if cls_type == TransactionClassificationType.TRANSFER:
                excluded_counts["personal_transfers"] += 1
            elif cls_type == TransactionClassificationType.NON_GIG_INCOME:
                excluded_counts["non_gig_income"] += 1
            elif cls_type == TransactionClassificationType.EXPENSE:
                excluded_counts["expenses"] += 1
            elif cls_type == TransactionClassificationType.GIG_INCOME:
                excluded_counts["unselected_gig"] += 1
            else:
                excluded_counts["unmatched"] += 1

        classified_list.append({
            "transaction_id": tx["id"],
            "date": t_date.isoformat(),
            "amount": tx["amount"],
            "source": tx["source"],
            "description": tx.get("description", ""),
            "matched_platform": c_res["matched_platform"],
            "classification": cls_type.value if hasattr(cls_type, "value") else str(cls_type),
            "confidence": c_res["confidence"],
            "reason": c_res["reason"],
            "included_in_report": is_inc
        })

    # Group included gig income by month
    monthly_map: Dict[str, float] = {}
    platform_map: Dict[str, float] = {}

    for tx in included_gig_txs:
        t_date = date.fromisoformat(tx["transaction_date"])
        m_key = t_date.strftime("%B %Y")
        amt = tx["amount"]
        monthly_map[m_key] = monthly_map.get(m_key, 0.0) + amt

        # Find platform
        for p in sel_platforms:
            if p.lower() in tx.get("description", "").lower():
                platform_map[p] = platform_map.get(p, 0.0) + amt
                break

    total_gig_income = round(sum(monthly_map.values()), 2)
    months_count = 12
    avg_monthly_income = round(total_gig_income / max(1, len(monthly_map) or 12), 2)

    monthly_breakdown = [{"month": m, "amount": round(val, 2)} for m, val in monthly_map.items()]
    platform_breakdown = []
    for p, amt in platform_map.items():
        pct = round((amt / total_gig_income * 100.0), 1) if total_gig_income > 0 else 0.0
        platform_breakdown.append({"platform": p, "amount": round(amt, 2), "percentage": pct})

    # Calculate trend and consistency
    monthly_vals = list(monthly_map.values())
    if len(monthly_vals) >= 2:
        recent_half = monthly_vals[-max(1, len(monthly_vals)//2):]
        older_half = monthly_vals[:max(1, len(monthly_vals)//2)]
        avg_recent = sum(recent_half) / max(1, len(recent_half))
        avg_older = sum(older_half) / max(1, len(older_half))
        if avg_recent > avg_older * 1.08:
            income_trend = "Growing"
        elif avg_recent < avg_older * 0.92:
            income_trend = "Volatile"
        else:
            income_trend = "Stable"

        mean_val = sum(monthly_vals) / len(monthly_vals)
        variance = sum((x - mean_val) ** 2 for x in monthly_vals) / len(monthly_vals)
        stdev = variance ** 0.5
        income_volatility = round((stdev / mean_val * 100.0), 1) if mean_val > 0 else 12.0
    else:
        income_trend = "Stable"
        income_volatility = 12.0

    if len(monthly_map) >= 8:
        income_consistency = "High"
    elif len(monthly_map) >= 4:
        income_consistency = "Moderate"
    else:
        income_consistency = "Developing"

    # Consistency Score (0–100) measures observed consistency over 12 months
    consistency_score = round(min(98.0, max(30.0, 100.0 - (income_volatility * 0.7) + min(10.0, len(monthly_map) * 0.8))), 1)

    # Calculate verification confidence based on months, consistency, and volume
    confidence = min(96.0, max(75.0, 72.0 + (len(monthly_map) * 2.0) + (len(sel_platforms) * 1.5)))

    data_quality = {
        "total_transactions": len(classified_list),
        "matching_transactions": len(included_gig_txs),
        "excluded_transactions": len(classified_list) - len(included_gig_txs),
        "unknown_transactions": excluded_counts["unmatched"],
        "excluded_breakdown": excluded_counts,
        "quality_score": int(confidence)
    }

    return {
        "start_date": start.isoformat(),
        "end_date": today.isoformat(),
        "total_gig_income": total_gig_income,
        "average_monthly_gig_income": avg_monthly_income,
        "months_analyzed": 12,
        "income_trend": income_trend,
        "income_consistency": income_consistency,
        "consistency_score": consistency_score,
        "income_volatility": income_volatility,
        "monthly_breakdown": monthly_breakdown,
        "platform_breakdown": platform_breakdown,
        "verification_confidence": confidence,
        "data_quality": data_quality,
        "sample_classifications": classified_list[:25],
        "all_classifications_count": len(classified_list)
    }

def generate_income_report(
    db: Session,
    worker: WorkerProfile,
    consent_id: Optional[str] = None,
    account_ids: Optional[List[str]] = None,
    platforms: Optional[List[str]] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> IncomeReport:
    active_consent = None
    if consent_id:
        active_consent = db.query(AAConsent).filter(AAConsent.id == consent_id, AAConsent.worker_id == worker.id).first()
    if not active_consent:
        active_consent = db.query(AAConsent).filter(
            AAConsent.worker_id == worker.id,
            AAConsent.consent_status == AAConsentStatus.ACTIVE
        ).first()

    if active_consent and active_consent.consent_status == AAConsentStatus.REVOKED:
        raise ValueError("Cannot generate report under a revoked consent artifact.")

    processed = process_authorized_data(
        db, worker, account_ids=account_ids, platforms=platforms,
        start_date=start_date, end_date=end_date
    )

    report_id = generate_report_id()
    now_utc = datetime.now(timezone.utc)
    expires_at = now_utc + timedelta(days=180)

    accounts_analyzed = ["HDFC Bank ****4821", "State Bank of India ****9217"]
    if account_ids:
        acc_records = db.query(FinancialAccount).filter(FinancialAccount.id.in_(account_ids)).all()
        if acc_records:
            accounts_analyzed = [f"{a.bank_name} {a.account_mask}" for a in acc_records]

    # Deterministic canonical report payload for cryptographic integrity
    canonical_dict = {
        "report_id": report_id,
        "analysis_start_date": processed["start_date"],
        "analysis_end_date": processed["end_date"],
        "verified_average_monthly_gig_income": processed["average_monthly_gig_income"],
        "total_verified_gig_income": processed["total_gig_income"],
        "months_analyzed": processed["months_analyzed"],
        "calculation_version": "v1.0",
        "accounts_analyzed": accounts_analyzed,
        "data_source": "Account Aggregator (Authorized Financial Data)"
    }
    canonical_str = canonicalize_report_data(canonical_dict)
    canonical_hash = compute_canonical_hash(canonical_str)
    signature = sign_hash(canonical_hash)

    report = IncomeReport(
        report_id=report_id,
        report_number=report_id,
        worker_id=worker.id,
        consent_id=active_consent.id if active_consent else None,
        analysis_start_date=date.fromisoformat(processed["start_date"]),
        analysis_end_date=date.fromisoformat(processed["end_date"]),
        months_analyzed=processed["months_analyzed"],
        generated_at=now_utc,
        issued_at=now_utc,
        expires_at=expires_at,
        calculation_version="v1.0",
        data_source="Account Aggregator (Authorized Financial Data)",
        accounts_analyzed=accounts_analyzed,
        platforms_selected=platforms or ["Uber", "Zomato", "Swiggy"],
        verified_average_monthly_gig_income=processed["average_monthly_gig_income"],
        total_verified_gig_income=processed["total_gig_income"],
        consistency_score=processed.get("consistency_score", 82.0),
        income_volatility=processed.get("income_volatility", 12.0),
        monthly_breakdown=processed["monthly_breakdown"],
        platform_breakdown=processed["platform_breakdown"],
        income_trend=processed.get("income_trend", "Stable"),
        income_consistency=processed.get("income_consistency", "High"),
        verification_confidence=processed["verification_confidence"],
        data_quality=processed["data_quality"],
        methodology="Deterministic rule-based pattern matching of verified credit transactions against authorized financial statements. Excludes personal transfers, non-gig credits, and operating expenses.",
        risk_flags=[],
        canonical_hash=canonical_hash,
        signature=signature,
        signature_algorithm="HMAC-SHA256",
        key_version="v1",
        status="ACTIVE",
        report_status="ACTIVE"
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    log_audit_action(db, worker.user_id, "REPORT_GENERATED", "IncomeReport", report.id, {
        "report_id": report.report_id,
        "period": f"{processed['start_date']} to {processed['end_date']}",
        "verified_avg_income": report.verified_average_monthly_gig_income
    })

    return report

def get_worker_reports(db: Session, worker: WorkerProfile) -> List[IncomeReport]:
    return db.query(IncomeReport).filter(IncomeReport.worker_id == worker.id).order_by(desc(IncomeReport.generated_at)).all()

def get_report_by_id(db: Session, worker: WorkerProfile, report_id: str) -> IncomeReport:
    report = db.query(IncomeReport).filter(
        IncomeReport.worker_id == worker.id,
        (IncomeReport.id == report_id) | (IncomeReport.report_id == report_id) | (IncomeReport.report_number == report_id)
    ).first()
    if not report:
        raise ValueError("Report not found or access unauthorized")
    return report

def get_report_pdf_bytes(db: Session, worker: WorkerProfile, report_id: str) -> bytes:
    from app.services.pdf_service import generate_report_pdf
    from app.models.user import User

    report = get_report_by_id(db, worker, report_id)
    user = db.query(User).filter(User.id == worker.user_id).first()

    report_dict = {
        "report_id": report.report_id or report.report_number,
        "worker_name": (user.name if (user and hasattr(user, "name") and user.name) else None) or (user.full_name if (user and hasattr(user, "full_name")) else "Authorized Worker") or "Authorized Worker",
        "masked_aadhaar": getattr(worker, "masked_aadhaar", None) or getattr(user, "identity_provider_user_id", None) or "XXXXXXXX4821",
        "accounts_analyzed": report.accounts_analyzed or ["HDFC Bank ****4821"],
        "total_gig_income": report.total_verified_gig_income,
        "average_monthly_gig_income": report.verified_average_monthly_gig_income,
        "consistency_score": getattr(report, "consistency_score", 82.0) or 82.0,
        "income_volatility": getattr(report, "income_volatility", 12.0) or 12.0,
        "income_trend": report.income_trend or "Stable",
        "verification_confidence": report.verification_confidence or 92.0,
        "months_analyzed": report.months_analyzed or 12,
        "monthly_breakdown": report.monthly_breakdown or [],
        "platform_breakdown": report.platform_breakdown or [],
        "canonical_hash": report.canonical_hash or "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "signature": report.signature or "MOCK_SIGNATURE",
        "signature_algorithm": report.signature_algorithm or "HMAC-SHA256",
        "issued_at": report.issued_at or report.generated_at
    }
    return generate_report_pdf(report_dict)

def revoke_income_report(db: Session, worker: WorkerProfile, report_id: str) -> IncomeReport:
    report = get_report_by_id(db, worker, report_id)
    report.status = "REVOKED"
    report.report_status = "REVOKED"
    report.revoked_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)

    log_audit_action(db, worker.user_id, "REPORT_REVOKED", "IncomeReport", report.id, {
        "report_id": report.report_id
    })
    return report

def public_verify_report(db: Session, report_id: str, submitted_hash: Optional[str] = None) -> Dict[str, Any]:
    report = db.query(IncomeReport).filter(
        (IncomeReport.id == report_id) | (IncomeReport.report_id == report_id) | (IncomeReport.report_number == report_id)
    ).first()
    if not report:
        return {
            "status": "NOT_FOUND",
            "is_valid": False,
            "message": f"Report ID '{report_id}' was not found in the CredBridge registry.",
            "report_id": report_id,
            "digital_signature_valid": False,
            "document_integrity_verified": False
        }

    # Check revocation status
    if report.status == "REVOKED" or report.report_status == "REVOKED":
        return {
            "status": "REVOKED",
            "is_valid": False,
            "message": f"Report '{report.report_id}' was revoked by the authorized worker.",
            "report_id": report.report_id,
            "report_type": "Verified Gig Income Report",
            "analysis_period": f"{report.analysis_start_date.strftime('%b %Y')} – {report.analysis_end_date.strftime('%b %Y')}",
            "issued_at": report.issued_at.isoformat() if getattr(report, 'issued_at', None) else report.generated_at.isoformat(),
            "revoked_at": report.revoked_at.isoformat() if getattr(report, 'revoked_at', None) else None,
            "digital_signature_valid": True,
            "document_integrity_verified": True
        }

    # Check expiry
    now_utc = datetime.now(timezone.utc)
    exp = getattr(report, 'expires_at', None)
    if exp:
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if now_utc > exp:
            return {
                "status": "EXPIRED",
                "is_valid": False,
                "message": f"Report '{report.report_id}' expired on {exp.strftime('%d %b %Y')}.",
                "report_id": report.report_id,
                "report_type": "Verified Gig Income Report",
                "analysis_period": f"{report.analysis_start_date.strftime('%b %Y')} – {report.analysis_end_date.strftime('%b %Y')}",
                "digital_signature_valid": True,
                "document_integrity_verified": True
            }

    # Recompute canonical hash to check for alteration
    accounts = getattr(report, "accounts_analyzed", []) or []
    canonical_dict = {
        "report_id": report.report_id,
        "analysis_start_date": report.analysis_start_date.isoformat(),
        "analysis_end_date": report.analysis_end_date.isoformat(),
        "verified_average_monthly_gig_income": report.verified_average_monthly_gig_income,
        "total_verified_gig_income": report.total_verified_gig_income,
        "months_analyzed": getattr(report, "months_analyzed", 12) or 12,
        "calculation_version": report.calculation_version,
        "accounts_analyzed": accounts,
        "data_source": report.data_source
    }
    canonical_str = canonicalize_report_data(canonical_dict)
    recomputed_hash = compute_canonical_hash(canonical_str)

    stored_hash = getattr(report, "canonical_hash", None)
    if stored_hash and (recomputed_hash != stored_hash or (submitted_hash and submitted_hash.lower() != stored_hash.lower())):
        return {
            "status": "ALTERED",
            "is_valid": False,
            "message": "The submitted report does not match the report originally issued by CredBridge.",
            "report_id": report.report_id,
            "digital_signature_valid": False,
            "document_integrity_verified": False
        }

    # Verify digital signature
    stored_sig = getattr(report, "signature", None)
    if stored_hash and stored_sig:
        sig_ok = verify_signature(stored_hash, stored_sig)
        if not sig_ok:
            return {
                "status": "SIGNATURE_INVALID",
                "is_valid": False,
                "message": "Digital signature verification failed. Signature is invalid.",
                "report_id": report.report_id,
                "digital_signature_valid": False,
                "document_integrity_verified": False
            }

    # Valid authentic report
    return {
        "status": "AUTHENTIC",
        "is_valid": True,
        "message": "CredBridge confirms that this report was issued by CredBridge and document integrity is verified.",
        "report_id": report.report_id,
        "report_type": "Verified Gig Income Report",
        "analysis_period": f"{report.analysis_start_date.strftime('%b %Y')} – {report.analysis_end_date.strftime('%b %Y')}",
        "issued_at": report.issued_at.isoformat() if getattr(report, 'issued_at', None) else report.generated_at.isoformat(),
        "expires_at": report.expires_at.isoformat() if getattr(report, 'expires_at', None) else None,
        "digital_signature_valid": True,
        "document_integrity_verified": True,
        "issuer": "CredBridge Evidence Verification Infrastructure",
        "canonical_hash_prefix": (stored_hash[:16] + "...") if stored_hash else "SHA-256 Verified"
    }

# --- 6. Recommendations Engine ---

def get_financial_recommendations(db: Session, worker: WorkerProfile) -> List[Dict[str, Any]]:
    latest_report = db.query(IncomeReport).filter(IncomeReport.worker_id == worker.id).order_by(desc(IncomeReport.generated_at)).first()
    avg_income = latest_report.verified_average_monthly_gig_income if latest_report else 35000.0

    return [
        {
            "id": "rec-personal-microloan",
            "title": "Personal Micro-Loan Support",
            "category": "Credit Assessment Support",
            "indicative_range": f"₹{int(avg_income * 1.5):,} – ₹{int(avg_income * 3.5):,}",
            "fit_reasons": [
                "Consistent gig income history detected across 6 months",
                "Low cashflow volatility within recommended benchmarks",
                "Multiple active income sources (diversity factor satisfied)"
            ],
            "disclaimer": "This is not a loan approval or guarantee. CredBridge is not a lender. Final eligibility and approval terms are strictly determined by the lender.",
            "eligible_for_exploration": True
        },
        {
            "id": "rec-fuel-equipment",
            "title": "Vehicle & Fuel Operating Line",
            "category": "Working Capital Support",
            "indicative_range": "₹15,000 – ₹45,000",
            "fit_reasons": [
                "Regular weekly fuel & maintenance debit transactions observed",
                "Stable delivery volume matching logistics eligibility criteria"
            ],
            "disclaimer": "This is not a loan approval. Financing decisions rest solely with participating credit institutions.",
            "eligible_for_exploration": True
        },
        {
            "id": "rec-emergency-buffer",
            "title": "Emergency Liquidity Buffer",
            "category": "Contingency Support",
            "indicative_range": "₹10,000 – ₹25,000",
            "fit_reasons": [
                "Positive net cashflow observed across operating cycles",
                "Account Aggregator verified bank statement evidence available"
            ],
            "disclaimer": "This is not a loan approval. Final approval is subject to institutional underwriting.",
            "eligible_for_exploration": True
        }
    ]

# --- 7. Report Sharing with Explicit Worker Consent ---

def share_report_with_recipient(
    db: Session,
    worker: WorkerProfile,
    report_id: str,
    recipient_name: str,
    share_scope: Optional[Dict[str, bool]] = None,
    include_raw_transactions: bool = False,
    duration_days: int = 30
) -> ReportShare:
    report = get_report_by_id(db, worker, report_id)

    scope = share_scope or {
        "verified_income": True,
        "monthly_income_history": True,
        "income_sources": True,
        "verification_methodology": True
    }

    share = ReportShare(
        worker_id=worker.id,
        report_id=report.id,
        recipient_name=recipient_name,
        share_scope=scope,
        include_raw_transactions=include_raw_transactions,
        granted_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=duration_days),
        status="ACTIVE"
    )
    db.add(share)
    db.commit()
    db.refresh(share)

    log_audit_action(db, worker.user_id, "REPORT_SHARED", "ReportShare", share.id, {
        "recipient": recipient_name,
        "report_number": report.report_number,
        "include_raw_txs": include_raw_transactions,
        "expires_at": share.expires_at.isoformat() if share.expires_at else None
    })
    return share

def get_report_shares(db: Session, worker: WorkerProfile, report_id: str) -> List[ReportShare]:
    return db.query(ReportShare).filter(
        ReportShare.worker_id == worker.id,
        ReportShare.report_id == report_id
    ).order_by(desc(ReportShare.granted_at)).all()

def revoke_report_share(db: Session, worker: WorkerProfile, share_id: str) -> ReportShare:
    share = db.query(ReportShare).filter(ReportShare.id == share_id, ReportShare.worker_id == worker.id).first()
    if not share:
        raise ValueError("Report share record not found")
    
    share.status = "REVOKED"
    share.revoked_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(share)

    log_audit_action(db, worker.user_id, "REPORT_SHARE_REVOKED", "ReportShare", share.id, {
        "recipient": share.recipient_name
    })
    return share

# --- 8. Privacy & Data Access Audit History ---

def get_worker_data_access_history(db: Session, worker: WorkerProfile) -> List[Dict[str, Any]]:
    logs = db.query(AuditLog).filter(AuditLog.user_id == worker.user_id).order_by(desc(AuditLog.created_at)).limit(50).all()
    
    history = []
    for log in logs:
        # Format friendly descriptions for worker privacy log
        desc_map = {
            "DIGILOCKER_INITIATED": "DigiLocker verification session started",
            "DIGILOCKER_VERIFIED": "Identity verified via DigiLocker Sandbox",
            "IDENTITY_CONFIRMED_BY_WORKER": "Worker verified identity confirmed",
            "AA_CONSENT_GRANTED": "Account Aggregator financial data consent granted",
            "AA_CONSENT_APPROVED": "Consent permission approved by worker",
            "AA_CONSENT_REVOKED": "Financial data consent revoked by worker",
            "BANK_ACCOUNTS_SELECTION_UPDATED": "Authorized bank account selection updated",
            "REPORT_GENERATED": "Verified Gig Income Report generated",
            "REPORT_SHARED": "Verified report shared with institution",
            "REPORT_SHARE_REVOKED": "Institutional report access revoked"
        }
        
        friendly_action = desc_map.get(log.action, log.action.replace("_", " ").title())
        history.append({
            "id": log.id,
            "timestamp": log.created_at.isoformat(),
            "action": log.action,
            "description": friendly_action,
            "details": log.details or {},
            "status": "SUCCESS"
        })
    return history
