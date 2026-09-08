from typing import Optional, List, Dict, Any
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.api.deps import require_worker
from app.models.worker_profile import WorkerProfile
from app.services import worker_workflow_service as flow_service

router = APIRouter()

# --- Request/Response Schemas ---

class DigiLockerVerifyRequest(BaseModel):
    session_id: str
    verified_name: Optional[str] = None

class CreateConsentRequest(BaseModel):
    purpose: str = "Generate Verified Gig Income Report"
    data_types: List[str] = Field(default_factory=lambda: ["TRANSACTIONS", "PROFILE"])
    selected_accounts: List[str] = Field(default_factory=lambda: ["acc_hdfc_4821", "acc_sbi_9217"])
    selected_sources: List[str] = Field(default_factory=lambda: ["Uber", "Zomato"])
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class SelectBankAccountsRequest(BaseModel):
    selected_account_ids: List[str]

class ProcessDataRequest(BaseModel):
    account_ids: Optional[List[str]] = None
    platforms: Optional[List[str]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class GenerateReportRequest(BaseModel):
    consent_id: Optional[str] = None
    account_ids: Optional[List[str]] = None
    platforms: Optional[List[str]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ShareReportRequest(BaseModel):
    recipient_name: str
    share_scope: Optional[Dict[str, bool]] = None
    include_raw_transactions: bool = False
    duration_days: int = Field(default=30, ge=1, le=180)


# --- 1. DigiLocker Endpoints ---

@router.post("/digilocker/start")
def start_digilocker_verification(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    return flow_service.initiate_digilocker(db, worker)

@router.post("/digilocker/verify")
def verify_digilocker_identity(
    req: DigiLockerVerifyRequest,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    return flow_service.verify_digilocker(db, worker, req.session_id, req.verified_name)

@router.get("/digilocker/status")
def get_digilocker_status(
    worker: WorkerProfile = Depends(require_worker)
):
    return {
        "identity_status": worker.identity_status,
        "verification_source": worker.identity_source or "DigiLocker Sandbox",
        "masked_aadhaar": worker.masked_aadhaar or "XXXXXXXX4821",
        "verified_name": worker.identity_name or worker.user.name,
        "verified_at": worker.identity_verified_at
    }

@router.post("/digilocker/confirm")
def confirm_identity(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    return flow_service.confirm_worker_identity(db, worker)


# --- 2. Account Aggregator Consent Endpoints ---

@router.get("/aa/consents")
def list_consents(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    consents = flow_service.get_worker_aa_consents(db, worker)
    return [
        {
            "id": c.id,
            "consent_handle": c.consent_handle,
            "purpose": c.purpose,
            "data_types": c.data_types,
            "selected_accounts": c.selected_accounts,
            "selected_sources": c.selected_sources,
            "start_date": c.start_date.isoformat() if c.start_date else None,
            "end_date": c.end_date.isoformat() if c.end_date else None,
            "consent_status": c.consent_status.value if hasattr(c.consent_status, "value") else str(c.consent_status),
            "provider": c.provider,
            "granted_at": c.granted_at,
            "expires_at": c.expires_at,
            "revoked_at": c.revoked_at
        }
        for c in consents
    ]

@router.post("/aa/consents", status_code=status.HTTP_201_CREATED)
def request_aa_consent(
    req: CreateConsentRequest,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    c = flow_service.create_or_request_aa_consent(
        db, worker,
        purpose=req.purpose,
        data_types=req.data_types,
        selected_accounts=req.selected_accounts,
        selected_sources=req.selected_sources,
        start_date=req.start_date,
        end_date=req.end_date
    )
    return {
        "id": c.id,
        "consent_handle": c.consent_handle,
        "status": c.consent_status.value if hasattr(c.consent_status, "value") else str(c.consent_status),
        "purpose": c.purpose,
        "provider": c.provider
    }

@router.post("/aa/consents/{consent_id}/approve")
def approve_consent(
    consent_id: str,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    try:
        c = flow_service.approve_aa_consent(db, worker, consent_id)
        return {"message": "Consent approved successfully.", "status": c.consent_status.value if hasattr(c.consent_status, "value") else str(c.consent_status)}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/aa/consents/{consent_id}/revoke")
def revoke_consent(
    consent_id: str,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    try:
        c = flow_service.revoke_aa_consent(db, worker, consent_id)
        return {"message": "Consent revoked successfully.", "status": c.consent_status.value if hasattr(c.consent_status, "value") else str(c.consent_status)}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- 3. Linked Bank Accounts Endpoints ---

@router.get("/aa/bank-accounts")
def get_bank_accounts(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    accounts = flow_service.sync_and_get_bank_accounts(db, worker)
    return [
        {
            "id": a.id,
            "bank_name": a.bank_name,
            "account_mask": a.account_mask,
            "account_type": a.account_type,
            "fip_id": a.fip_id,
            "fip_name": a.fip_name,
            "balance_indicative": a.balance_indicative,
            "currency": a.currency,
            "is_selected": a.is_selected
        }
        for a in accounts
    ]

@router.post("/aa/bank-accounts/select")
def select_bank_accounts(
    req: SelectBankAccountsRequest,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    if not req.selected_account_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one bank account must be selected.")
    accounts = flow_service.update_account_selection(db, worker, req.selected_account_ids)
    return {
        "message": "Bank account selection updated successfully.",
        "selected_count": sum(1 for a in accounts if a.is_selected)
    }

@router.get("/financial/accounts")
def get_financial_accounts(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    return get_bank_accounts(worker=worker, db=db)

@router.post("/financial/accounts/select")
def select_financial_accounts(
    req: SelectBankAccountsRequest,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    return select_bank_accounts(req=req, worker=worker, db=db)


# --- 4. Gig Platforms Endpoints ---

@router.get("/aa/platforms")
def get_platforms(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    return flow_service.get_available_gig_platforms(db, worker)


# --- 5. Analysis & Report Generation Endpoints ---

@router.post("/reports/process")
def process_data(
    req: ProcessDataRequest,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    return flow_service.process_authorized_data(
        db, worker,
        account_ids=req.account_ids,
        platforms=req.platforms,
        start_date=req.start_date,
        end_date=req.end_date
    )

@router.post("/reports/generate", status_code=status.HTTP_201_CREATED)
def generate_report(
    req: GenerateReportRequest,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    try:
        report = flow_service.generate_income_report(
            db, worker,
            consent_id=req.consent_id,
            account_ids=req.account_ids,
            platforms=req.platforms,
            start_date=req.start_date,
            end_date=req.end_date
        )
        return {
            "id": report.id,
            "report_id": report.report_id,
            "report_number": report.report_number,
            "analysis_period": f"{report.analysis_start_date.isoformat()} to {report.analysis_end_date.isoformat()}",
            "verified_average_monthly_gig_income": report.verified_average_monthly_gig_income,
            "total_verified_gig_income": report.total_verified_gig_income,
            "months_analyzed": getattr(report, "months_analyzed", 12) or 12,
            "consistency_score": getattr(report, "consistency_score", 82.0) or 82.0,
            "income_volatility": getattr(report, "income_volatility", 12.0) or 12.0,
            "income_trend": getattr(report, "income_trend", "Stable"),
            "income_consistency": getattr(report, "income_consistency", "High"),
            "verification_confidence": report.verification_confidence,
            "monthly_breakdown": report.monthly_breakdown,
            "platform_breakdown": report.platform_breakdown,
            "accounts_analyzed": report.accounts_analyzed,
            "data_quality": report.data_quality,
            "methodology": report.methodology,
            "generated_at": report.generated_at,
            "issued_at": getattr(report, "issued_at", report.generated_at),
            "expires_at": getattr(report, "expires_at", None),
            "canonical_hash": getattr(report, "canonical_hash", ""),
            "signature": getattr(report, "signature", ""),
            "status": report.status,
            "report_status": getattr(report, "report_status", report.status),
            "qr_verification_url": f"/verify/report/{report.report_id}"
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/reports")
def list_reports(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    reports = flow_service.get_worker_reports(db, worker)
    return [
        {
            "id": r.id,
            "report_id": getattr(r, "report_id", r.report_number),
            "report_number": r.report_number,
            "analysis_start_date": r.analysis_start_date.isoformat(),
            "analysis_end_date": r.analysis_end_date.isoformat(),
            "analysis_period": f"{r.analysis_start_date.strftime('%b %Y')} – {r.analysis_end_date.strftime('%b %Y')}",
            "verified_average_monthly_gig_income": r.verified_average_monthly_gig_income,
            "total_verified_gig_income": r.total_verified_gig_income,
            "months_analyzed": getattr(r, "months_analyzed", 12) or 12,
            "consistency_score": getattr(r, "consistency_score", 82.0) or 82.0,
            "income_volatility": getattr(r, "income_volatility", 12.0) or 12.0,
            "income_trend": getattr(r, "income_trend", "Stable"),
            "income_consistency": getattr(r, "income_consistency", "High"),
            "verification_confidence": r.verification_confidence,
            "platforms_selected": r.platforms_selected,
            "accounts_analyzed": r.accounts_analyzed,
            "generated_at": r.generated_at,
            "issued_at": getattr(r, "issued_at", r.generated_at),
            "expires_at": getattr(r, "expires_at", None),
            "canonical_hash": getattr(r, "canonical_hash", ""),
            "signature": getattr(r, "signature", ""),
            "status": r.status,
            "report_status": getattr(r, "report_status", r.status),
            "qr_verification_url": f"/verify/report/{getattr(r, 'report_id', r.report_number)}"
        }
        for r in reports
    ]

@router.get("/reports/{report_id}/pdf")
def download_report_pdf(
    report_id: str,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    """
    Direct PDF generation & download strictly for authenticated workers.
    """
    try:
        pdf_bytes = flow_service.get_report_pdf_bytes(db, worker, report_id)
        rep_filename = f"CredBridge_Report_{report_id}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{rep_filename}"',
                "Content-Type": "application/pdf"
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/reports/{report_id}")
def get_report_detail(
    report_id: str,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    try:
        r = flow_service.get_report_by_id(db, worker, report_id)
        rep_id = getattr(r, "report_id", r.report_number)
        return {
            "id": r.id,
            "report_id": rep_id,
            "report_number": r.report_number,
            "worker_name": worker.identity_name or worker.user.name,
            "analysis_start_date": r.analysis_start_date.isoformat(),
            "analysis_end_date": r.analysis_end_date.isoformat(),
            "analysis_period": f"{r.analysis_start_date.strftime('%b %Y')} – {r.analysis_end_date.strftime('%b %Y')}",
            "verified_average_monthly_gig_income": r.verified_average_monthly_gig_income,
            "total_verified_gig_income": r.total_verified_gig_income,
            "months_analyzed": getattr(r, "months_analyzed", 12) or 12,
            "consistency_score": getattr(r, "consistency_score", 82.0) or 82.0,
            "income_volatility": getattr(r, "income_volatility", 12.0) or 12.0,
            "income_trend": getattr(r, "income_trend", "Stable"),
            "income_consistency": getattr(r, "income_consistency", "High"),
            "monthly_breakdown": r.monthly_breakdown,
            "platform_breakdown": r.platform_breakdown,
            "verification_confidence": r.verification_confidence,
            "accounts_analyzed": r.accounts_analyzed,
            "platforms_selected": r.platforms_selected,
            "data_quality": r.data_quality,
            "methodology": r.methodology,
            "generated_at": r.generated_at,
            "issued_at": getattr(r, "issued_at", r.generated_at),
            "expires_at": getattr(r, "expires_at", None),
            "canonical_hash": getattr(r, "canonical_hash", ""),
            "signature": getattr(r, "signature", ""),
            "calculation_version": r.calculation_version,
            "data_source": r.data_source,
            "status": r.status,
            "report_status": getattr(r, "report_status", r.status),
            "revoked_at": getattr(r, "revoked_at", None),
            "qr_verification_url": f"/verify/report/{rep_id}"
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/reports/{report_id}/revoke")
def revoke_report(
    report_id: str,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    try:
        r = flow_service.revoke_income_report(db, worker, report_id)
        return {
            "message": f"Report {r.report_id} has been revoked successfully.",
            "report_id": r.report_id,
            "status": r.status,
            "revoked_at": r.revoked_at
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/reports/verify/{report_id}")
def verify_report_public(
    report_id: str,
    hash: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Public cryptographic and status verification of a Verified Gig Income Report.
    Accessible without authentication by lenders, third parties, or QR code scanners.
    Exposes zero sensitive PII or raw transaction data.
    """
    return flow_service.public_verify_report(db, report_id, submitted_hash=hash)

@router.get("/reports/{report_id}/pdf-data")
def get_report_pdf_payload(
    report_id: str,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    try:
        r = flow_service.get_report_by_id(db, worker, report_id)
        rep_id = getattr(r, "report_id", r.report_number)
        return {
            "title": "VERIFIED GIG INCOME REPORT",
            "report_id": rep_id,
            "report_number": r.report_number,
            "worker_name": worker.identity_name or worker.user.name,
            "masked_aadhaar": worker.masked_aadhaar or "XXXXXXXX4821",
            "analysis_period": f"{r.analysis_start_date.strftime('%d %b %Y')} – {r.analysis_end_date.strftime('%d %b %Y')}",
            "verified_average_monthly_gig_income": f"₹{r.verified_average_monthly_gig_income:,.2f}",
            "total_verified_gig_income": f"₹{r.total_verified_gig_income:,.2f}",
            "months_analyzed": getattr(r, "months_analyzed", 6),
            "income_trend": getattr(r, "income_trend", "Stable"),
            "income_consistency": getattr(r, "income_consistency", "High"),
            "verification_confidence": f"{r.verification_confidence:.1f}%",
            "accounts_analyzed": r.accounts_analyzed,
            "platforms_selected": r.platforms_selected,
            "monthly_breakdown": r.monthly_breakdown,
            "platform_breakdown": r.platform_breakdown,
            "data_quality": r.data_quality,
            "methodology": r.methodology,
            "status": r.status,
            "report_status": getattr(r, "report_status", r.status),
            "canonical_hash": getattr(r, "canonical_hash", ""),
            "signature": getattr(r, "signature", ""),
            "qr_verification_url": f"/verify/report/{rep_id}",
            "disclaimer": "CredBridge is an evidence verification infrastructure platform and not a lender. This report presents deterministic verification of bank-disbursed gig income for lender evaluation.",
            "generated_at": r.generated_at.strftime("%d %b %Y, %I:%M %p UTC")
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- 6. Recommendations Endpoints ---

@router.get("/recommendations")
def list_recommendations(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    return flow_service.get_financial_recommendations(db, worker)


# --- 7. Report Sharing Endpoints ---

@router.post("/reports/{report_id}/share", status_code=status.HTTP_201_CREATED)
def share_report(
    report_id: str,
    req: ShareReportRequest,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    try:
        share = flow_service.share_report_with_recipient(
            db, worker, report_id,
            recipient_name=req.recipient_name,
            share_scope=req.share_scope,
            include_raw_transactions=req.include_raw_transactions,
            duration_days=req.duration_days
        )
        return {
            "id": share.id,
            "report_id": share.report_id,
            "recipient_name": share.recipient_name,
            "status": share.status,
            "granted_at": share.granted_at,
            "expires_at": share.expires_at
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/reports/{report_id}/shares")
def list_report_shares(
    report_id: str,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    shares = flow_service.get_report_shares(db, worker, report_id)
    return [
        {
            "id": s.id,
            "recipient_name": s.recipient_name,
            "share_scope": s.share_scope,
            "include_raw_transactions": s.include_raw_transactions,
            "status": s.status,
            "granted_at": s.granted_at,
            "expires_at": s.expires_at,
            "revoked_at": s.revoked_at
        }
        for s in shares
    ]

@router.post("/reports/shares/{share_id}/revoke")
def revoke_share(
    share_id: str,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    try:
        share = flow_service.revoke_report_share(db, worker, share_id)
        return {"message": f"Report sharing with {share.recipient_name} successfully revoked.", "status": share.status}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- 8. Privacy & Data Access Audit History ---

@router.get("/audit/data-access")
def get_data_access_audit(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    return flow_service.get_worker_data_access_history(db, worker)
