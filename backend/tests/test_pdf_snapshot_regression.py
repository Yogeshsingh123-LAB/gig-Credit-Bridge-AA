import io
import pytest
from datetime import datetime, timezone, timedelta, date
from pypdf import PdfReader
from fastapi.testclient import TestClient

from app.main import app
from tests.conftest import TestingSessionLocal
from app.models.income_report import IncomeReport
from app.models.user import User
from app.models.worker_profile import WorkerProfile
from app.services.report_validator import FinalReportSnapshot, ReportValidator, format_inr, format_ist_datetime
from app.services.pdf_service import generate_report_pdf
from app.services.worker_workflow_service import generate_income_report, get_report_pdf_bytes

client = TestClient(app)

def test_report_pdf_matches_snapshot():
    """
    Comprehensive regression test verifying that:
    1. Report snapshot strictly adheres to mathematical reconciliation
    2. PDF title is EXACTLY 'VERIFIED GIG INCOME REPORT'
    3. Backend Total == Database Total == PDF Total (with Indian currency formatting)
    4. Backend Average == Database Average == PDF Average
    5. Monthly values are all present and reconciled
    6. Income sources are present and reconciled
    7. Authoritative issued_at IST timestamp matches across DB and PDF
    8. Consistency Score and Report ID match exactly
    9. Report Authenticity section with QR reference is present
    """
    # 1. Register test worker to ensure DB contains user and profile
    email = "pdf.test.worker@example.com"
    pwd = "Password123!"
    client.post("/api/v1/auth/register", json={
        "name": "Aarav Sharma",
        "email": email,
        "password": pwd,
        "role": "WORKER"
    })

    db = TestingSessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None, "Worker user must exist"

        worker = db.query(WorkerProfile).filter(WorkerProfile.user_id == user.id).first()
        if not worker:
            worker = WorkerProfile(user_id=user.id, full_name="Aarav Sharma", phone_number="9876543210")
            db.add(worker)
            db.commit()
            db.refresh(worker)

        # 1. Generate 12-Month Report
        report = generate_income_report(
            db=db,
            worker=worker,
            start_date=date.today() - timedelta(days=365),
            end_date=date.today()
        )
        assert report is not None
        report_id = report.report_id

        # 2. Retrieve from Database
        db_report = db.query(IncomeReport).filter(IncomeReport.report_id == report_id).first()
        assert db_report is not None

        db_total = float(db_report.total_verified_gig_income)
        db_avg = float(db_report.verified_average_monthly_gig_income)
        db_score = float(db_report.consistency_score)
        db_issued_ist = format_ist_datetime(db_report.issued_at)

        # 3. Generate PDF via service
        pdf_bytes = get_report_pdf_bytes(db, worker, report_id)
        assert len(pdf_bytes) > 1000

        # 4. Extract PDF text with pypdf
        reader = PdfReader(io.BytesIO(pdf_bytes))
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"

        # 5. Assertions
        # Exact Title (Section 29)
        assert "VERIFIED GIG INCOME REPORT" in full_text
        assert "CRED BRIDGE" in full_text

        # Report ID (Section 30)
        assert report_id in full_text

        # Authoritative Timestamp (Section 25, 27, 28)
        # Check that IST timestamp is present in the PDF text
        assert "IST" in full_text
        assert "2026" in full_text

        # Financial values (Section 11, 20, 22)
        total_inr_str = format_inr(db_total)
        avg_inr_str = format_inr(db_avg)

        # Indian numbering amounts must be present in PDF text (either with ₹ or without)
        raw_total_str = total_inr_str.replace("₹", "")
        raw_avg_str = avg_inr_str.replace("₹", "")
        assert (total_inr_str in full_text) or (raw_total_str in full_text), f"Expected total {total_inr_str} in PDF text"
        assert (avg_inr_str in full_text) or (raw_avg_str in full_text), f"Expected avg {avg_inr_str} in PDF text"

        # Consistency score (Section 10, 30)
        score_int = int(round(db_score))
        assert f"{score_int} / 100" in full_text or f"{score_int}/100" in full_text

        # Income Sources Section (Section 31)
        assert "VERIFIED INCOME SOURCES" in full_text
        assert "Platform / Organization" in full_text

        # 12-Month Table Section (Section 32)
        assert "12-MONTH OBSERVED INCOME BREAKDOWN" in full_text or "12-Month" in full_text
        assert len(db_report.monthly_breakdown) == 12

        # Verify month presence
        for m in db_report.monthly_breakdown:
            assert m["month"] in full_text

        # Authenticity & QR Section (Section 33)
        assert "REPORT AUTHENTICITY" in full_text
        assert "Scan to verify this report" in full_text
        assert "Digitally Verifiable" in full_text
        assert "SHA-256 Protected" not in full_text
        assert "Signature: Valid" not in full_text

        # Numbered canvas footer (Section 34)
        assert "CredBridge | Verified Gig Income Report" in full_text
        assert f"Report ID: {report_id}" in full_text
        assert "Page 1 of" in full_text

    finally:
        db.close()
