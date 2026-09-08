from typing import Optional
from fastapi import APIRouter, Depends, Query, Request, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import require_platform_admin
from app.models.user import User
from app.services import admin_portal_service

router = APIRouter(prefix="/admin", tags=["Platform Admin Portal"])


class CreateOrganizationRequest(BaseModel):
    organization_name: str = Field(..., min_length=2, max_length=150)
    contact_email: Optional[str] = None
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None
    admin_password: Optional[str] = Field(None, min_length=8)



class UpdateOrgStatusRequest(BaseModel):
    status: str = Field(..., description="ACTIVE, SUSPENDED, or INACTIVE")


class UpdateUserRequest(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None


@router.get("/dashboard")
def get_admin_dashboard(
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Returns platform-wide metrics, system health, and recent verification volume.
    """
    return admin_portal_service.get_admin_dashboard_metrics(db)


@router.get("/organizations")
def list_organizations(
    search: Optional[str] = Query(None, description="Search by name, code, or email"),
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Lists all lender organizations registered on the platform.
    """
    return admin_portal_service.get_lender_organizations(db, search=search)


@router.get("/organizations/{org_id}")
def get_organization_detail(
    org_id: str,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Returns full details, members, and verification stats for a lender organization.
    """
    return admin_portal_service.get_lender_organization_detail(db, org_id)


@router.post("/organizations", status_code=status.HTTP_201_CREATED)
def create_organization(
    req: CreateOrganizationRequest,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Registers a new lender organization and optionally provisions its primary Lender Admin.
    """
    return admin_portal_service.create_lender_organization(
        db=db,
        organization_name=req.organization_name,
        contact_email=req.contact_email,
        admin_name=req.admin_name,
        admin_email=req.admin_email,
        admin_password=req.admin_password,
        admin_user=admin_user
    )


@router.patch("/organizations/{org_id}/status")
def update_organization_status(
    org_id: str,
    req: UpdateOrgStatusRequest,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Updates organization status (ACTIVE, SUSPENDED, INACTIVE).
    """
    return admin_portal_service.update_organization_status(
        db=db,
        org_id=org_id,
        status_val=req.status,
        admin_user=admin_user
    )


@router.get("/users")
def list_users(
    role: Optional[str] = Query(None, description="Filter by UserRole"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Lists platform users across all roles (passwords never exposed).
    """
    return admin_portal_service.get_platform_users(
        db=db,
        role=role,
        search=search,
        limit=limit,
        offset=offset
    )


@router.patch("/users/{user_id}")
def update_user(
    user_id: str,
    req: UpdateUserRequest,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Updates user account status or role.
    """
    return admin_portal_service.update_platform_user(
        db=db,
        user_id=user_id,
        is_active=req.is_active,
        role=req.role,
        admin_user=admin_user
    )


@router.get("/reports")
def list_reports(
    search: Optional[str] = Query(None, description="Search by report ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Read-only operational metadata monitoring of Verified Gig Income Reports.
    Finalized calculation outputs are immutable.
    """
    return admin_portal_service.get_all_reports_metadata(
        db=db,
        search=search,
        limit=limit,
        offset=offset
    )


@router.get("/verifications")
def list_verifications(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Real-time stream of report verification events across all lenders.
    """
    return admin_portal_service.get_verification_activity_logs(
        db=db,
        limit=limit,
        offset=offset
    )


@router.get("/health")
def get_system_health(
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Live real checks of database, cryptographic engine, and platform services.
    """
    return admin_portal_service.get_system_health(db)


@router.get("/audit-logs")
def list_audit_logs(
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Platform append-only audit trail.
    """
    return admin_portal_service.get_platform_audit_logs(
        db=db,
        limit=limit,
        offset=offset
    )
