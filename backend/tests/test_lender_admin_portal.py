import os
os.environ["DATABASE_URL"] = "sqlite:///./credbridge_dev.db"

import pytest
from datetime import datetime, date, timedelta, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.enums import UserRole
from app.models.income_report import IncomeReport
from app.models.lender_organization import LenderOrganization
from app.models.lender_profile import LenderProfile
from app.models.worker_profile import WorkerProfile
from app.models.report_verification import ReportVerification
from app.services.admin_service import seed_demo_accounts
from app.services.crypto_service import (
    canonicalize_report_data,
    compute_canonical_hash,
    sign_hash,
    verify_signature,
    generate_report_id
)

client = TestClient(app)


try:
    from conftest import TestingSessionLocal
    def get_test_db():
        return TestingSessionLocal()
except ImportError:
    from app.db.session import SessionLocal
    def get_test_db():
        return SessionLocal()





def get_auth_token(email: str, password: str = "Password123!") -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]


@pytest.fixture
def admin_headers():
    token = get_auth_token("admin@demo.credbridge.local", "Admin@123456")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def lender_finance_admin_headers():
    token = get_auth_token("lender-admin@demo-finance.local", "Password123!")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def lender_finance_officer_headers():
    token = get_auth_token("officer@demo-finance.local", "Password123!")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def lender_capital_admin_headers():
    token = get_auth_token("lender-admin@demo-capital.local", "Password123!")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def worker_headers():
    # Register/login a fresh worker
    email = "test.portal.worker@example.com"
    pwd = "Password123!"
    client.post("/api/v1/auth/register", json={
        "name": "Arun Verma",
        "email": email,
        "password": pwd,
        "role": "WORKER"
    })
    token = get_auth_token(email, pwd)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def seeded_report():
    """
    Creates a verified finalized IncomeReport with authentic Ed25519 signature and SHA-256 hash.
    """
    db = get_test_db()
    try:

        worker_user = db.query(User).filter(User.role == UserRole.WORKER).first()
        if not worker_user:
            worker_user = User(
                name="Sunil Das",
                email="sunil.das@example.com",
                role=UserRole.WORKER,
                is_active=True
            )
            db.add(worker_user)
            db.flush()
        
        worker_prof = worker_user.worker_profile
        if not worker_prof:
            worker_prof = WorkerProfile(
                user_id=worker_user.id,
                phone="+91 98765 12345",
                city="Pune",
                occupation="Quick Commerce Partner",
                masked_aadhaar="XXXXXXXX1099",
                identity_status="VERIFIED",
                identity_source="DigiLocker"
            )
            db.add(worker_prof)
            db.flush()
        else:
            worker_prof.masked_aadhaar = "XXXXXXXX1099"
            worker_prof.identity_status = "VERIFIED"
            worker_prof.identity_source = "DigiLocker"
            db.flush()


        rep_id = generate_report_id()
        start_d = date(2025, 9, 1)
        end_d = date(2026, 8, 31)

        monthly = [
            {"month": "Sep 2025", "verified_gig_income": 30000.0, "platform_count": 2, "primary_platform": "QuickRide"},
            {"month": "Oct 2025", "verified_gig_income": 31000.0, "platform_count": 2, "primary_platform": "QuickRide"},
            {"month": "Nov 2025", "verified_gig_income": 29500.0, "platform_count": 2, "primary_platform": "QuickRide"},
            {"month": "Dec 2025", "verified_gig_income": 32500.0, "platform_count": 2, "primary_platform": "FoodDash"},
            {"month": "Jan 2026", "verified_gig_income": 30000.0, "platform_count": 2, "primary_platform": "QuickRide"},
            {"month": "Feb 2026", "verified_gig_income": 28000.0, "platform_count": 2, "primary_platform": "QuickRide"},
            {"month": "Mar 2026", "verified_gig_income": 31000.0, "platform_count": 2, "primary_platform": "QuickRide"},
            {"month": "Apr 2026", "verified_gig_income": 33000.0, "platform_count": 2, "primary_platform": "FoodDash"},
            {"month": "May 2026", "verified_gig_income": 30500.0, "platform_count": 2, "primary_platform": "QuickRide"},
            {"month": "Jun 2026", "verified_gig_income": 31500.0, "platform_count": 2, "primary_platform": "QuickRide"},
            {"month": "Jul 2026", "verified_gig_income": 32000.0, "platform_count": 2, "primary_platform": "FoodDash"},
            {"month": "Aug 2026", "verified_gig_income": 31000.0, "platform_count": 2, "primary_platform": "QuickRide"},
        ]
        total_income = sum(m["verified_gig_income"] for m in monthly)
        avg_income = total_income / 12.0

        quickride_income = 215000.0
        fooddash_income = total_income - quickride_income  # ensures exact match: 155000.0
        platforms = [
            {"platform_name": "QuickRide", "verified_gig_income": quickride_income, "percentage_of_total": round((quickride_income / total_income) * 100, 1), "active_months": 12},
            {"platform_name": "FoodDash", "verified_gig_income": fooddash_income, "percentage_of_total": round((fooddash_income / total_income) * 100, 1), "active_months": 12}
        ]

        # Calculate canonical hash and Ed25519 signature
        rep_dict = {
            "report_id": rep_id,
            "report_number": rep_id,
            "analysis_start_date": start_d,
            "analysis_end_date": end_d,
            "verified_average_monthly_gig_income": avg_income,
            "total_verified_gig_income": total_income,
            "months_analyzed": 12,
            "calculation_version": "v1.0",
            "accounts_analyzed": ["HDFC Bank •••• 4521"],
            "data_source": "Account Aggregator (Authorized Financial Data)"
        }
        canonical_str = canonicalize_report_data(rep_dict)
        c_hash = compute_canonical_hash(canonical_str)
        sig = sign_hash(c_hash)

        report = IncomeReport(
            report_id=rep_id,
            report_number=rep_id,
            worker_id=worker_prof.id,
            analysis_start_date=start_d,
            analysis_end_date=end_d,
            months_analyzed=12,
            issued_at=datetime.now(timezone.utc),
            generated_at=datetime.now(timezone.utc),
            total_verified_gig_income=total_income,
            verified_average_monthly_gig_income=avg_income,
            monthly_breakdown=monthly,
            platform_breakdown=platforms,
            income_trend="Stable",
            income_consistency="High",
            consistency_score=86.5,
            income_volatility=6.2,
            verification_confidence=98.0,
            canonical_hash=c_hash,
            signature=sig,
            signature_algorithm="Ed25519",
            key_version="v1",
            status="ACTIVE",
            report_status="ACTIVE",
            accounts_analyzed=["HDFC Bank •••• 4521"],
            platforms_selected=["QuickRide", "FoodDash"],
            is_demo=True
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return {
            "id": report.id,
            "report_id": report.report_id,
            "worker_name": worker_user.name,
            "masked_aadhaar": worker_prof.masked_aadhaar,
            "total_verified_income": total_income,
            "avg_monthly_income": avg_income,
            "consistency_score": 86.5,
            "canonical_hash": c_hash,
            "signature": sig
        }
    finally:
        db.close()


# =========================================================================
# SECTION 43 CRITICAL TEST: 15 Core Verification Checks
# =========================================================================

def test_lender_verification_matches_finalized_report(lender_finance_officer_headers, seeded_report):
    """
    SECTION 43 REQUIREMENT:
    Verify that Lender report verification directly matches finalized report data:
    1. report_id
    2. issued_at (and IST format)
    3. analysis_period
    4. months_analyzed (12)
    5. total_verified_gig_income
    6. verified_average_monthly_gig_income
    7. platform_breakdown
    8. monthly_breakdown
    9. consistency_score
    10. income_trend
    11. income_consistency
    12. verification_confidence
    13. canonical_hash
    14. signature
    15. worker identity (minimal) with NO raw transactions
    """
    report_id = seeded_report["report_id"]

    # 1. Post to verification endpoint
    ver_res = client.post("/api/v1/lender/verify", json={"report_id": report_id}, headers=lender_finance_officer_headers)
    assert ver_res.status_code == 200, f"Verification failed for report {report_id}: {ver_res.text}"
    vdata = ver_res.json()


    # Check 1: report_id
    assert vdata["report_id"] == report_id
    assert vdata["verification_result"] == "AUTHENTIC"
    assert vdata["is_authentic"] is True
    assert vdata["integrity_valid"] is True
    assert vdata["signature_valid"] is True

    # Check 2: verified_at in IST format
    assert "IST" in vdata["verified_at"]

    # Check 13 & 14: hash and signature integrity
    summary = vdata["report_summary"]
    assert summary["canonical_hash"] == seeded_report["canonical_hash"]
    assert summary["signature"] == seeded_report["signature"]
    assert summary["signature_algorithm"] == "Ed25519"

    # Check 5 & 6: total income and average monthly income
    assert summary["total_verified_gig_income"] == seeded_report["total_verified_income"]
    assert summary["verified_average_monthly_gig_income"] == seeded_report["avg_monthly_income"]

    # Check 9, 10, 11, 12: consistency score, trends, confidence
    assert summary["consistency_score"] == 86.5
    assert summary["income_trend"] == "Stable"
    assert summary["income_consistency"] == "High"
    assert summary["verification_confidence"] == 98.0

    # Check 15: minimal worker identity
    assert "worker_identity" in summary
    w_ident = summary["worker_identity"]
    assert w_ident["masked_aadhaar"] == seeded_report["masked_aadhaar"]
    assert w_ident["identity_status"] == "VERIFIED"

    # 2. Get full detail endpoint to verify full breakdowns and absence of raw transactions
    detail_res = client.get(f"/api/v1/lender/reports/{report_id}", headers=lender_finance_officer_headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()

    # Check 1: report_id
    assert detail["report_id"] == report_id

    # Check 2: issued_at
    assert "IST" in detail["issued_at"]

    # Check 3: analysis_period
    assert "start" in detail["analysis_period"]
    assert "end" in detail["analysis_period"]

    # Check 4: months_analyzed
    assert detail["months_analyzed"] == 12

    # Check 7: platform_breakdown (sum matches total)
    assert len(detail["platform_breakdown"]) == 2
    sum_platforms = sum(p["verified_gig_income"] for p in detail["platform_breakdown"])
    assert sum_platforms == seeded_report["total_verified_income"]

    # Check 8: monthly_breakdown (sum matches total)
    assert len(detail["monthly_breakdown"]) == 12
    sum_months = sum(m["verified_gig_income"] for m in detail["monthly_breakdown"])
    assert sum_months == seeded_report["total_verified_income"]

    # Non-credit disclaimer present
    assert "CredBridge is not a credit bureau" in detail["disclaimer"]

    # STRICT INVARIANT: No raw transaction rows or personal spending
    assert "transactions" not in detail
    assert "raw_transactions" not in detail
    assert "personal_transfers" not in detail
    assert "expenses" not in detail


# =========================================================================
# MULTI-TENANT ISOLATION TESTS
# =========================================================================

def test_lender_organization_isolation(
    lender_finance_admin_headers,
    lender_capital_admin_headers
):
    """
    Test Lender A (Demo Finance) cannot access or modify Lender B (Demo Capital) data.
    """
    # 1. Finance Admin gets their own org
    res_fin = client.get("/api/v1/lender/organization", headers=lender_finance_admin_headers)
    assert res_fin.status_code == 200
    fin_org = res_fin.json()
    assert fin_org["lender_id"] == "LND-00124"
    assert fin_org["organization_name"] == "Demo Finance Ltd."

    # 2. Capital Admin gets their own org
    res_cap = client.get("/api/v1/lender/organization", headers=lender_capital_admin_headers)
    assert res_cap.status_code == 200
    cap_org = res_cap.json()
    assert cap_org["lender_id"] == "LND-00125"
    assert cap_org["organization_name"] == "Demo Capital Partners"

    # 3. Finance Admin cannot modify a member belonging to Capital Partners
    cap_member_id = cap_org["members"][0]["user_id"]
    tamper_res = client.patch(
        f"/api/v1/lender/organization/users/{cap_member_id}",
        json={"is_active": False},
        headers=lender_finance_admin_headers
    )
    # Must return 404 since the member does not exist within Demo Finance's org
    assert tamper_res.status_code == 404


# =========================================================================
# RBAC TESTS
# =========================================================================

def test_lender_officer_cannot_manage_users(lender_finance_officer_headers):
    """
    Test Lender Officer cannot invite or update organization members (requires LENDER_ADMIN).
    """
    invite_res = client.post(
        "/api/v1/lender/organization/users",
        json={
            "name": "Unauthorized User",
            "email": "unauth@demo-finance.local",
            "role": "LENDER_OFFICER",
            "password": "Password123!"
        },
        headers=lender_finance_officer_headers
    )
    assert invite_res.status_code == 403
    assert "Forbidden" in invite_res.json()["detail"]


def test_lender_admin_cannot_access_platform_admin(lender_finance_admin_headers):
    """
    Test Lender Admin gets 403 when trying to access Platform Admin endpoints.
    """
    res = client.get("/api/v1/admin/dashboard", headers=lender_finance_admin_headers)
    assert res.status_code == 403

    res_orgs = client.get("/api/v1/admin/organizations", headers=lender_finance_admin_headers)
    assert res_orgs.status_code == 403


def test_worker_cannot_access_lender_or_admin(worker_headers):
    """
    Test Worker gets 403 on both Lender and Admin endpoints.
    """
    lender_res = client.get("/api/v1/lender/dashboard", headers=worker_headers)
    assert lender_res.status_code == 403

    admin_res = client.get("/api/v1/admin/dashboard", headers=worker_headers)
    assert admin_res.status_code == 403


# =========================================================================
# IMMUTABILITY & AUDIT TESTS
# =========================================================================

def test_admin_cannot_mutate_finalized_reports(admin_headers, seeded_report):
    """
    Finalized Verified Gig Income Reports are strictly immutable.
    Admin reports endpoint is read-only operational metadata monitoring.
    """
    # Admin can view report metadata
    res = client.get("/api/v1/admin/reports", headers=admin_headers)
    assert res.status_code == 200
    reports = res.json()["items"]
    assert any(r["report_id"] == seeded_report["report_id"] for r in reports), f"Report {seeded_report['report_id']} not in {[r['report_id'] for r in reports]}"


    # There is NO PUT or PATCH endpoint for income reports
    patch_res = client.patch(f"/api/v1/admin/reports/{seeded_report['id']}", json={"status": "ALTERED"}, headers=admin_headers)
    assert patch_res.status_code in [404, 405]


def test_admin_system_health_and_metrics(admin_headers):
    """
    Test live platform metrics, system health checks, and organizations listing.
    """
    # 1. Health check
    health_res = client.get("/api/v1/admin/health", headers=admin_headers)
    assert health_res.status_code == 200
    hdata = health_res.json()
    assert hdata["overall_status"] == "HEALTHY"
    assert hdata["database"]["status"] == "CONNECTED"
    assert "cryptography" in hdata

    # 2. Dashboard metrics
    metrics_res = client.get("/api/v1/admin/dashboard", headers=admin_headers)
    assert metrics_res.status_code == 200
    mdata = metrics_res.json()
    assert mdata["total_users"] > 0
    assert mdata["total_organizations"] >= 2
    assert "system_health" in mdata

    # 3. Organizations list
    orgs_res = client.get("/api/v1/admin/organizations", headers=admin_headers)
    assert orgs_res.status_code == 200
    orgs = orgs_res.json()
    lender_ids = [o["lender_id"] for o in orgs]
    assert "LND-00124" in lender_ids
    assert "LND-00125" in lender_ids
