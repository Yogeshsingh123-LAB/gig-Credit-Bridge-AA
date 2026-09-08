from typing import Optional
from fastapi import APIRouter, Depends, Query, Request, Response, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
import io

from app.db.session import get_db
from app.api.deps import require_lender_any, require_lender_admin
from app.models.user import User
from app.models.lender_profile import LenderProfile
from app.services import lender_portal_service

router = APIRouter(prefix="/lender", tags=["Lender Portal"])


class VerifyReportRequest(BaseModel):
    report_id: str = Field(..., description="Report ID or Legacy Report Number (e.g. CBR-2026-XXXX-XXXX-XXXX)")


class CreateLenderUserRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=3, max_length=255)
    role: str = Field(default="LENDER_OFFICER", description="LENDER_ADMIN or LENDER_OFFICER")

    designation: Optional[str] = Field(default=None, max_length=100)
    password: str = Field(..., min_length=8)


class UpdateMemberStatusRequest(BaseModel):
    is_active: bool


@router.get("/dashboard")
def get_dashboard_stats(
    auth_data: tuple[User, LenderProfile] = Depends(require_lender_any),
    db: Session = Depends(get_db)
):
    """
    Returns high-level statistics and recent verification logs for the lender's organization.
    """
    user, profile = auth_data
    return lender_portal_service.get_lender_dashboard_stats(db, user, profile)


@router.post("/verify")
def verify_report(
    req: VerifyReportRequest,
    request: Request,
    auth_data: tuple[User, LenderProfile] = Depends(require_lender_any),
    db: Session = Depends(get_db)
):
    """
    Cryptographically verifies a report's SHA-256 canonical hash and Ed25519 signature.
    Logs an immutable verification record.
    """
    user, profile = auth_data
    client_ip = request.client.host if request.client else None
    return lender_portal_service.verify_report(
        db=db,
        report_identifier=req.report_id,
        lender_user=user,
        lender_profile=profile,
        ip_address=client_ip
    )


@router.get("/reports")
def get_reports(
    search: Optional[str] = Query(None, description="Search by report ID or worker name"),
    status: Optional[str] = Query(None, description="Filter by status (ACTIVE, EXPIRED, REVOKED)"),
    min_score: Optional[float] = Query(None, description="Filter by minimum consistency score"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    auth_data: tuple[User, LenderProfile] = Depends(require_lender_any),
    db: Session = Depends(get_db)
):
    """
    Lists Verified Gig Income Reports accessible to this lender's organization.
    """
    user, profile = auth_data
    return lender_portal_service.get_lender_reports(
        db=db,
        lender_profile=profile,
        search=search,
        status_filter=status,
        min_score=min_score,
        limit=limit,
        offset=offset
    )


@router.get("/reports/{report_id}")
def get_report_detail(
    report_id: str,
    request: Request,
    auth_data: tuple[User, LenderProfile] = Depends(require_lender_any),
    db: Session = Depends(get_db)
):
    """
    Retrieves full immutable finalized snapshot of a Verified Gig Income Report.
    No raw banking transactions are ever exposed.
    """
    user, profile = auth_data
    client_ip = request.client.host if request.client else None
    return lender_portal_service.get_lender_report_detail(
        db=db,
        report_id=report_id,
        lender_user=user,
        lender_profile=profile,
        ip_address=client_ip
    )


@router.get("/reports/{report_id}/pdf")
def download_report_pdf(
    report_id: str,
    request: Request,
    auth_data: tuple[User, LenderProfile] = Depends(require_lender_any),
    db: Session = Depends(get_db)
):
    """
    Downloads the official tamper-evident PDF for the verified report.
    """
    user, profile = auth_data
    client_ip = request.client.host if request.client else None
    pdf_bytes = lender_portal_service.generate_lender_report_pdf(
        db=db,
        report_id=report_id,
        lender_user=user,
        lender_profile=profile,
        ip_address=client_ip
    )
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="CredBridge_Income_Report_{report_id}.pdf"'
        }
    )


@router.get("/organization")
def get_organization(
    auth_data: tuple[User, LenderProfile] = Depends(require_lender_any),
    db: Session = Depends(get_db)
):
    """
    Returns organization profile and members list.
    """
    user, profile = auth_data
    return lender_portal_service.get_lender_organization(db, profile)


@router.post("/organization/users", status_code=status.HTTP_201_CREATED)
def invite_organization_user(
    req: CreateLenderUserRequest,
    auth_data: tuple[User, LenderProfile] = Depends(require_lender_admin),
    db: Session = Depends(get_db)
):
    """
    Invites or creates a new member within the lender organization.
    Restricted to LENDER_ADMIN.
    """
    admin_user, admin_profile = auth_data
    return lender_portal_service.invite_or_create_lender_user(
        db=db,
        lender_profile=admin_profile,
        email=req.email,
        name=req.name,
        role=req.role,
        designation=req.designation,
        password=req.password,
        admin_user=admin_user
    )


@router.patch("/organization/users/{member_user_id}")
def update_member_status(
    member_user_id: str,
    req: UpdateMemberStatusRequest,
    auth_data: tuple[User, LenderProfile] = Depends(require_lender_admin),
    db: Session = Depends(get_db)
):
    """
    Enables or disables an organization member account.
    Restricted to LENDER_ADMIN.
    """
    admin_user, admin_profile = auth_data
    return lender_portal_service.update_lender_member_status(
        db=db,
        lender_profile=admin_profile,
        member_user_id=member_user_id,
        is_active=req.is_active,
        admin_user=admin_user
    )
