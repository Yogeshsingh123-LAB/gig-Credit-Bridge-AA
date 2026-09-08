"""
Date utility functions for CredBridge Intelligence.
"""

from datetime import date, datetime
from typing import List, Union, Optional


def parse_date(val: Union[str, date, datetime]) -> Optional[date]:
    """
    Parses a date string, date object, or datetime object into a datetime.date object.
    Returns None if parsing fails.
    """
    if val is None:
        return None
    if isinstance(val, date) and not isinstance(val, datetime):
        return val
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, str):
        val = val.strip()
        if not val:
            return None
        # Try common date formats
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
            try:
                return datetime.strptime(val, fmt).date()
            except ValueError:
                continue
        try:
            # Fallback to ISO format parsing
            return datetime.fromisoformat(val).date()
        except ValueError:
            return None
    return None


def format_month(d: date) -> str:
    """
    Formats a date object into a YYYY-MM string.
    """
    return d.strftime("%Y-%m")


def is_future_date(d: date, reference_date: Optional[date] = None) -> bool:
    """
    Checks if a date is in the future relative to reference_date (defaults to current date).
    """
    ref = reference_date or date.today()
    return d > ref


def generate_month_sequence(start_month: str, end_month: str) -> List[str]:
    """
    Generates a contiguous list of YYYY-MM strings from start_month to end_month inclusive.
    """
    start_dt = datetime.strptime(start_month, "%Y-%m")
    end_dt = datetime.strptime(end_month, "%Y-%m")

    if start_dt > end_dt:
        return [start_month]

    months = []
    curr = start_dt
    while curr <= end_dt:
        months.append(curr.strftime("%Y-%m"))
        # Increment month
        year = curr.year + (curr.month // 12)
        month = (curr.month % 12) + 1
        curr = datetime(year, month, 1)
    return months
