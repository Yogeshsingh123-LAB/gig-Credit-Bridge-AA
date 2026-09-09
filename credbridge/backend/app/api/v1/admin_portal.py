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
    organization_identifier: Optional[str] = Field(None, min_length=2, max_length=100)
    contact_email: Optional[str] = None
    contact_person: Optional[str] = None
    status: Optional[str] = Field("PENDING", description="PENDING, ACTIVE, SUSPENDED, DEACTIVATED")
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None
    admin_password: Optional[str] = Field(None, min_length=8)


class CreateLenderRequest(BaseModel):
    organization_name: str = Field(..., min_length=2, max_length=150)
    organization_identifier: Optional[str] = Field(None, min_length=2, max_length=100)
    contact_email: Optional[str] = None
    contact_person: Optional[str] = None
    status: Optional[str] = Field("PENDING", description="PENDING, ACTIVE, SUSPENDED, DEACTIVATED")
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None
    admin_password: Optional[str] = Field(None, min_length=8)


class UpdateOrgStatusRequest(BaseModel):
    status: str = Field(..., description="ACTIVE, PENDING, SUSPENDED, or DEACTIVATED")
    organization_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_person: Optional[str] = None


class UpdateLenderRequest(BaseModel):
    status: Optional[str] = Field(None, description="ACTIVE, PENDING, SUSPENDED, or DEACTIVATED")
    organization_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_person: Optional[str] = None


class CreateLenderUserRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str
    role: str = Field("LENDER_OFFICER", description="LENDER_ADMIN or LENDER_OFFICER")
    designation: Optional[str] = None


class UpdateLenderUserRequest(BaseModel):
    status: Optional[str] = Field(None, description="INVITED, ACTIVE, SUSPENDED, DEACTIVATED")
    role: Optional[str] = Field(None, description="LENDER_ADMIN or LENDER_OFFICER")


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


# =========================================================================
# LENDER MANAGEMENT ROUTE SPECIFICATIONS
# =========================================================================

@router.get("/lenders/stats/summary")
def get_lender_summary_stats(
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Returns summary metrics (total, active, pending, suspended) for dashboard cards.
    """
    return admin_portal_service.get_lenders_summary_stats(db)


@router.get("/lenders")
def list_lenders(
    search: Optional[str] = Query(None, description="Search by Name, Lender ID, Identifier, or Email"),
    status: Optional[str] = Query(None, description="Filter by status (All, ACTIVE, PENDING, SUSPENDED, DEACTIVATED)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at", description="created_at, organization_name, status, last_activity"),
    sort_dir: str = Query("desc", description="asc or desc"),
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Lists registered lender organizations with search, filter, pagination, and sorting.
    """
    return admin_portal_service.get_lender_organizations(
        db=db,
        search=search,
        status_filter=status,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir
    )


@router.post("/lenders", status_code=status.HTTP_201_CREATED)
def create_lender(
    req: CreateLenderRequest,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Creates a new Lender Organization (Status defaults to PENDING).
    Generates server-side unique LND-XXXXXXXX lender_id.
    """
    return admin_portal_service.create_lender_organization(
        db=db,
        organization_name=req.organization_name,
        organization_identifier=req.organization_identifier,
        contact_email=req.contact_email,
        contact_person=req.contact_person,
        status_val=req.status or "PENDING",
        admin_name=req.admin_name,
        admin_email=req.admin_email,
        admin_password=req.admin_password,
        admin_user=admin_user
    )


@router.get("/lenders/{lender_id}")
def get_lender_detail(
    lender_id: str,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Returns complete lender details, summary metrics, member users list, and verification history.
    """
    return admin_portal_service.get_lender_organization_detail(db, lender_id)


@router.patch("/lenders/{lender_id}")
def update_lender(
    lender_id: str,
    req: UpdateLenderRequest,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Updates lender organization status (ACTIVE, SUSPENDED, DEACTIVATED, PENDING) or contact info.
    """
    return admin_portal_service.update_organization_status(
        db=db,
        org_id=lender_id,
        status_val=req.status,
        organization_name=req.organization_name,
        contact_email=req.contact_email,
        contact_person=req.contact_person,
        admin_user=admin_user
    )


@router.get("/lenders/{lender_id}/users")
def get_lender_users(
    lender_id: str,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Lists users belonging to a specific lender organization.
    """
    detail = admin_portal_service.get_lender_organization_detail(db, lender_id)
    return {"members": detail["members"], "max_users": detail["max_users"]}


@router.post("/lenders/{lender_id}/users", status_code=status.HTTP_201_CREATED)
def create_lender_user(
    lender_id: str,
    req: CreateLenderUserRequest,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Creates/invites a new user (Lender Admin or Lender Officer) for the lender organization.
    """
    return admin_portal_service.create_lender_user_for_org(
        db=db,
        org_id=lender_id,
        name=req.name,
        email=req.email,
        role=req.role,
        designation=req.designation,
        admin_user=admin_user
    )


@router.patch("/lenders/{lender_id}/users/{user_id}")
def update_lender_user(
    lender_id: str,
    user_id: str,
    req: UpdateLenderUserRequest,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Updates status (ACTIVE, SUSPENDED, DEACTIVATED) or role (LENDER_ADMIN, LENDER_OFFICER) of a lender user.
    """
    return admin_portal_service.update_lender_user_in_org(
        db=db,
        org_id=lender_id,
        user_id=user_id,
        status_val=req.status,
        role_val=req.role,
        admin_user=admin_user
    )


@router.get("/lenders/{lender_id}/verification-activity")
def get_lender_verification_activity(
    lender_id: str,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    """
    Returns operational report verification activity logs for a specific lender organization.
    """
    detail = admin_portal_service.get_lender_organization_detail(db, lender_id)
    return {"verifications": detail["recent_verifications"]}


# Backward-compatibility Aliases for /organizations endpoints
@router.get("/organizations")
def list_organizations(
    search: Optional[str] = Query(None),
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    res = admin_portal_service.get_lender_organizations(db, search=search)
    return res["items"] if isinstance(res, dict) and "items" in res else res


@router.get("/organizations/{org_id}")
def get_organization_detail(
    org_id: str,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    return admin_portal_service.get_lender_organization_detail(db, org_id)


@router.post("/organizations", status_code=status.HTTP_201_CREATED)
def create_organization(
    req: CreateOrganizationRequest,
    admin_user: User = Depends(require_platform_admin),
    db: Session = Depends(get_db)
):
    return admin_portal_service.create_lender_organization(
        db=db,
        organization_name=req.organization_name,
        organization_identifier=req.organization_identifier,
        contact_email=req.contact_email,
        contact_person=req.contact_person,
        status_val=req.status or "PENDING",
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
    return admin_portal_service.update_organization_status(
        db=db,
        org_id=org_id,
        status_val=req.status,
        organization_name=req.organization_name,
        contact_email=req.contact_email,
        contact_person=req.contact_person,
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
