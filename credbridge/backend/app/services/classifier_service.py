import re
from typing import Dict, Any, List, Optional, Tuple
from app.models.enums import TransactionClassificationType

class PlatformPatternMatcher:
    """
    Configurable pattern and descriptor matcher for gig platforms and bank transactions.
    Purely deterministic rule-based engine.
    Supports synthetic demo platforms (QuickRide, FoodDash, UrbanMove, ParcelGo, TaskKart, etc.)
    and industry platforms (Uber, Zomato, Swiggy, etc.).
    """

    PLATFORM_PATTERNS: Dict[str, List[str]] = {
        # Synthetic Demo Platforms (Sections 82, 85)
        "QuickRide": [
            r"\bquickride\b",
            r"quick\s*ride",
            r"quickride\s*technologies",
            r"quickride\s*payout",
            r"quickride\s*disbursement"
        ],
        "FoodDash": [
            r"\bfooddash\b",
            r"food\s*dash",
            r"fooddash\s*media",
            r"fooddash\s*payout",
            r"fooddash\s*settlement"
        ],
        "UrbanMove": [
            r"\burbanmove\b",
            r"urban\s*move",
            r"urbanmove\s*cabs",
            r"urbanmove\s*fleet",
            r"urbanmove\s*driver"
        ],
        "ParcelGo": [
            r"\bparcelgo\b",
            r"parcel\s*go",
            r"parcelgo\s*logistics",
            r"parcelgo\s*express",
            r"parcelgo\s*courier"
        ],
        "TaskKart": [
            r"\btaskkart\b",
            r"task\s*kart",
            r"taskkart\s*services",
            r"taskkart\s*partner"
        ],
        "Local Delivery Services": [
            r"local\s*delivery",
            r"city\s*logistics\s*payout",
            r"courier\s*settlement",
            r"delivery\s*partner\s*disbursement"
        ],
        "Other Identified Gig Income": [
            r"gig\s*income",
            r"gig\s*payout",
            r"on-demand\s*partner",
            r"independent\s*contractor\s*settlement",
            r"verified\s*gig\s*credit"
        ],

        # Real / Legacy Platforms (Backwards Compatibility)
        "Uber": [
            r"\buber\b",
            r"uber\s*technologies",
            r"uber\s*india",
            r"uber\s*bv",
            r"uber\s*systems",
            r"uber\s*payout"
        ],
        "Zomato": [
            r"\bzomato\b",
            r"zomato\s*media",
            r"zomato\s*ltd",
            r"zomato\s*limited",
            r"zomato\s*settlement",
            r"zomato\s*payout"
        ],
        "Swiggy": [
            r"\bswiggy\b",
            r"bundl\s*tech",
            r"bundl\s*technologies",
            r"swiggy\s*payout",
            r"swiggy\s*incentive"
        ],
        "Ola": [
            r"\bola\b",
            r"ani\s*technologies",
            r"ola\s*cabs",
            r"ola\s*fleet",
            r"ola\s*money"
        ],
        "Blinkit": [
            r"\bblinkit\b",
            r"blink\s*commerce",
            r"grofers"
        ],
        "Zepto": [
            r"\bzepto\b",
            r"kiranakart"
        ],
        "Urban Company": [
            r"urban\s*company",
            r"urbanclap",
            r"urban\s*clap"
        ],
        "Amazon": [
            r"amazon\s*flex",
            r"amazon\s*seller",
            r"ats\s*logistics",
            r"amazon\s*transportation"
        ]
    }

    # Internal Transfers (Must be excluded - Section 87)
    INTERNAL_TRANSFER_PATTERNS = [
        r"own\s*account",
        r"self\s*transfer",
        r"hdfc\s*->\s*sbi",
        r"sbi\s*->\s*hdfc",
        r"icici\s*->\s*hdfc",
        r"axis\s*->\s*sbi",
        r"inter-account",
        r"internal\s*transfer",
        r"transfer\s*to\s*self"
    ]

    # Personal Transfers (Must be excluded - Section 93)
    TRANSFER_PATTERNS = [
        r"\bp2p\b",
        r"transfer\s+from",
        r"upi/cr/[a-z\s]+/(?:transfer|p2p|personal)",
        r"family\s*transfer",
        r"friend\s*transfer",
        r"personal\s*transfer",
        r"fund\s*transfer",
        r"received\s+from"
    ]

    # Loans (Must be excluded - Section 91)
    LOAN_PATTERNS = [
        r"\bloan\b",
        r"personal\s*loan",
        r"credit\s*line",
        r"disbursement/loan",
        r"bajaj\s*finance",
        r"earlysalary",
        r"kreditbee"
    ]

    # Cash Deposits (Must be excluded without gig evidence - Section 92)
    CASH_DEPOSIT_PATTERNS = [
        r"cash\s*deposit",
        r"cdm\s*deposit",
        r"by\s*cash",
        r"cash\s*transfer",
        r"branch\s*cash"
    ]

    # Non-gig Corporate Salary (Must be excluded)
    SALARY_PATTERNS = [
        r"\bsalary\b",
        r"\bpayroll\b",
        r"corp(?:orate)?\s+salary",
        r"monthly\s+salary"
    ]

    # Reversals and Refunds (Sections 89, 90)
    REVERSAL_PATTERNS = [
        r"reversed",
        r"reversal",
        r"payment\s*reversed",
        r"refund",
        r"chargeback"
    ]

    # Living & Operating Expenses
    EXPENSE_PATTERNS = [
        r"petrol",
        r"fuel",
        r"hpcl",
        r"bpcl",
        r"iocl",
        r"indian\s*oil",
        r"atm\s*wdl",
        r"atm\s*cash",
        r"swiggy\s*instamart",
        r"groceries",
        r"electricity",
        r"mobile\s*recharge",
        r"rent",
        r"restaurant",
        r"shopping",
        r"utility",
        r"loan\s*repayment",
        r"credit\s*card\s*payment",
        r"service\s*center",
        r"bike\s*repair",
        r"maintenance"
    ]

    @classmethod
    def match_platform(cls, description: str) -> Optional[Tuple[str, float, str]]:
        """
        Matches a description against known gig platforms.
        Returns: (platform_name, confidence, reason) or None.
        """
        text = description.lower()
        for platform, patterns in cls.PLATFORM_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text):
                    return platform, 0.96, f"Matched known {platform} payment descriptor pattern '{pattern}'"
        return None

    @classmethod
    def classify_transaction(
        cls,
        description: str,
        transaction_type: str,
        amount: float,
        selected_platforms: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Classifies transaction into GIG_INCOME, NON_GIG_INCOME, EXPENSE, TRANSFER, or UNKNOWN.
        Deterministically filters out loans, personal transfers, cash deposits, and internal transfers.
        """
        desc = (description or "").strip()
        t_type = (transaction_type or "CREDIT").upper()
        selected_plats = [p.lower() for p in (selected_platforms or [])]
        text = desc.lower()

        # Check for Reversals
        for pat in cls.REVERSAL_PATTERNS:
            if re.search(pat, text):
                return {
                    "matched_platform": None,
                    "classification": TransactionClassificationType.TRANSFER,
                    "confidence": 0.95,
                    "reason": f"Payment reversal / refund ({pat}), adjusted from income",
                    "included_in_report": False,
                    "is_reversal": True
                }

        # Case 1: Debit transactions are Expenses
        if t_type == "DEBIT":
            matched_expense_reason = "Debit transaction"
            for pat in cls.EXPENSE_PATTERNS:
                if re.search(pat, text):
                    matched_expense_reason = f"Operating/living expense ({pat.upper()})"
                    break
            return {
                "matched_platform": None,
                "classification": TransactionClassificationType.EXPENSE,
                "confidence": 0.95,
                "reason": matched_expense_reason,
                "included_in_report": False
            }

        # Case 2: Credit transactions
        # Check internal transfers first (HDFC -> SBI etc.)
        for pat in cls.INTERNAL_TRANSFER_PATTERNS:
            if re.search(pat, text):
                return {
                    "matched_platform": None,
                    "classification": TransactionClassificationType.TRANSFER,
                    "confidence": 0.98,
                    "reason": "Internal own-account transfer, excluded from gig income",
                    "included_in_report": False
                }

        # Check loans
        for pat in cls.LOAN_PATTERNS:
            if re.search(pat, text):
                return {
                    "matched_platform": None,
                    "classification": TransactionClassificationType.NON_GIG_INCOME,
                    "confidence": 0.98,
                    "reason": "Loan disbursement, excluded from gig income",
                    "included_in_report": False
                }

        # Check cash deposits
        for pat in cls.CASH_DEPOSIT_PATTERNS:
            if re.search(pat, text):
                return {
                    "matched_platform": None,
                    "classification": TransactionClassificationType.NON_GIG_INCOME,
                    "confidence": 0.95,
                    "reason": "Cash deposit without gig evidence, excluded from gig income",
                    "included_in_report": False
                }

        # Check personal transfers
        for pat in cls.TRANSFER_PATTERNS:
            if re.search(pat, text):
                return {
                    "matched_platform": None,
                    "classification": TransactionClassificationType.TRANSFER,
                    "confidence": 0.90,
                    "reason": "Personal P2P/UPI transfer, excluded from verified gig income",
                    "included_in_report": False
                }

        # Check non-gig corporate salary
        for pat in cls.SALARY_PATTERNS:
            if re.search(pat, text):
                return {
                    "matched_platform": None,
                    "classification": TransactionClassificationType.NON_GIG_INCOME,
                    "confidence": 0.92,
                    "reason": "Non-gig corporate salary, excluded from gig verification",
                    "included_in_report": False
                }

        # Check gig platform match
        plat_match = cls.match_platform(desc)
        if plat_match:
            platform_name, conf, reason = plat_match
            # Deterministic classification: include if no restrictions or selected
            is_platform_selected = len(selected_plats) == 0 or platform_name.lower() in selected_plats
            return {
                "matched_platform": platform_name,
                "classification": TransactionClassificationType.GIG_INCOME,
                "confidence": conf,
                "reason": reason if is_platform_selected else f"{platform_name} income detected",
                "included_in_report": is_platform_selected
            }

        # Default for unmatched credits
        return {
            "matched_platform": None,
            "classification": TransactionClassificationType.UNKNOWN,
            "confidence": 0.60,
            "reason": "Unrecognized credit descriptor without matching gig platform signature",
            "included_in_report": False
        }
