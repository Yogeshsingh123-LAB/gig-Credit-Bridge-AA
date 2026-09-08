from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta, date
from typing import List, Dict, Any, Optional, Union

def format_inr(number: Union[float, int, None], include_decimals: bool = False) -> str:
    """
    Formats a numeric value using the official Indian Numbering System (Lakhs, Crores).
    Examples:
      8500    -> ₹8,500
      25000   -> ₹25,000
      125500  -> ₹1,25,500
      257100  -> ₹2,57,100
      1000000 -> ₹10,00,000
    """
    if number is None:
        return "₹0"
    is_neg = number < 0
    num = abs(float(number))
    
    if include_decimals:
        int_part, dec_part = f"{num:.2f}".split(".")
    else:
        int_part = str(int(round(num)))
        dec_part = None

    if len(int_part) <= 3:
        res = int_part
    else:
        last3 = int_part[-3:]
        rem = int_part[:-3]
        groups = []
        while len(rem) > 2:
            groups.insert(0, rem[-2:])
            rem = rem[:-2]
        if rem:
            groups.insert(0, rem)
        res = ",".join(groups) + "," + last3

    sign = "-" if is_neg else ""
    formatted = f"{sign}₹{res}"
    if dec_part and include_decimals:
        formatted += f".{dec_part}"
    return formatted

def format_ist_datetime(dt_val: Union[datetime, str, None]) -> str:
    """
    Formats any datetime into the standard Indian Standard Time (IST) string:
    '09 Sep 2026 • 04:05 PM IST'
    """
    ist_zone = timezone(timedelta(hours=5, minutes=30))
    if not dt_val:
        return datetime.now(ist_zone).strftime("%d %b %Y • %I:%M %p IST")
    
    if isinstance(dt_val, str):
        try:
            clean_str = dt_val.replace("Z", "+00:00")
            dt = datetime.fromisoformat(clean_str)
        except Exception:
            return dt_val
    else:
        dt = dt_val

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    
    ist_dt = dt.astimezone(ist_zone)
    return ist_dt.strftime("%d %b %Y • %I:%M %p IST")

@dataclass
class FinalReportSnapshot:
    report_id: str
    worker_id: str
    worker_name: str
    masked_aadhaar: str
    accounts_analyzed: List[str]
    analysis_start_date: str
    analysis_end_date: str
    issued_at: datetime
    total_verified_income: float
    average_monthly_income: float
    monthly_income: List[Dict[str, Any]]
    income_sources: List[Dict[str, Any]]
    months_analyzed: int = 12
    income_trend: str = "Stable"
    income_consistency: str = "High"
    income_volatility: float = 12.0
    consistency_score: float = 82.0
    verification_confidence: float = 95.0
    calculation_version: str = "v1.0"
    canonical_hash: str = ""
    signature: str = ""
    signature_algorithm: str = "Ed25519"
    key_version: str = "v1"
    status: str = "ACTIVE"

    @property
    def issued_at_ist(self) -> str:
        return format_ist_datetime(self.issued_at)

    @property
    def formatted_period(self) -> str:
        try:
            s = date.fromisoformat(self.analysis_start_date).strftime("%d %b %Y")
            e = date.fromisoformat(self.analysis_end_date).strftime("%d %b %Y")
            return f"{s} — {e}"
        except Exception:
            return f"{self.analysis_start_date} — {self.analysis_end_date}"

class ReportValidationError(ValueError):
    pass

class ReportValidator:
    """
    Validates mathematical and structural integrity of report snapshots
    according to Sections 11, 18, 19, 20, and 37 of CredBridge specification.
    """
    @staticmethod
    def validate(snapshot: FinalReportSnapshot) -> None:
        if not snapshot.report_id:
            raise ReportValidationError("Report snapshot must contain a valid report_id.")
        
        if snapshot.months_analyzed != 12:
            raise ReportValidationError(f"Months analyzed must be exactly 12, got {snapshot.months_analyzed}.")

        if len(snapshot.monthly_income) != 12:
            raise ReportValidationError(
                f"Monthly income breakdown must contain exactly 12 entries, got {len(snapshot.monthly_income)}."
            )

        if snapshot.total_verified_income < 0:
            raise ReportValidationError("Total verified gig income cannot be negative.")

        if snapshot.average_monthly_income < 0:
            raise ReportValidationError("Average monthly gig income cannot be negative.")

        if not (0.0 <= snapshot.consistency_score <= 100.0):
            raise ReportValidationError(
                f"Consistency score must be between 0 and 100, got {snapshot.consistency_score}."
            )

        # 1. Monthly reconciliation: sum(monthly_income) == total_verified_income
        monthly_sum = round(sum(float(m.get("amount", 0.0)) for m in snapshot.monthly_income), 2)
        total = round(float(snapshot.total_verified_income), 2)
        if abs(monthly_sum - total) > 0.05:
            raise ReportValidationError(
                f"Monthly income total ({monthly_sum}) does not reconcile with total verified income ({total})."
            )

        # 2. Source reconciliation: sum(income_sources) == total_verified_income
        if snapshot.income_sources:
            source_sum = round(sum(float(s.get("amount", 0.0)) for s in snapshot.income_sources), 2)
            if abs(source_sum - total) > 0.05:
                raise ReportValidationError(
                    f"Income sources total ({source_sum}) does not reconcile with total verified income ({total})."
                )

        # 3. Average reconciliation: average_monthly_income == total / 12
        expected_avg = round(total / 12.0, 2)
        if abs(snapshot.average_monthly_income - expected_avg) > 0.05:
            raise ReportValidationError(
                f"Average monthly income ({snapshot.average_monthly_income}) must equal total/12 ({expected_avg})."
            )

        if not snapshot.issued_at:
            raise ReportValidationError("Authoritative issued_at timestamp must be present.")
