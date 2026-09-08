import re
from typing import Dict, Any, List, Optional, Tuple
from app.models.enums import TransactionClassificationType

class PlatformPatternMatcher:
    """
    Configurable pattern and descriptor matcher for gig platforms and bank transactions.
    Purely deterministic rule-based engine.
    """

    PLATFORM_PATTERNS: Dict[str, List[str]] = {
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

    TRANSFER_PATTERNS = [
        r"\bp2p\b",
        r"transfer\s+from",
        r"upi/cr/[a-z\s]+/(?:transfer|p2p|personal)",
        r"self\s*transfer",
        r"fund\s*transfer",
        r"received\s+from"
    ]

    SALARY_PATTERNS = [
        r"\bsalary\b",
        r"\bpayroll\b",
        r"corp(?:orate)?\s+salary",
        r"monthly\s+salary"
    ]

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
        Applies worker platform selection rules.
        """
        desc = (description or "").strip()
        t_type = (transaction_type or "CREDIT").upper()
        selected_plats = [p.lower() for p in (selected_platforms or [])]

        # Case 1: Debit transactions are Expenses
        if t_type == "DEBIT":
            # Check for specific expense category
            matched_expense_reason = "Debit transaction"
            for pat in cls.EXPENSE_PATTERNS:
                if re.search(pat, desc.lower()):
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
        # Check gig platform match
        plat_match = cls.match_platform(desc)
        if plat_match:
            platform_name, conf, reason = plat_match
            is_platform_selected = len(selected_plats) == 0 or platform_name.lower() in selected_plats
            return {
                "matched_platform": platform_name,
                "classification": TransactionClassificationType.GIG_INCOME,
                "confidence": conf,
                "reason": reason if is_platform_selected else f"{platform_name} income detected but platform not selected for this report",
                "included_in_report": is_platform_selected
            }

        # Check for personal transfers
        for pat in cls.TRANSFER_PATTERNS:
            if re.search(pat, desc.lower()):
                return {
                    "matched_platform": None,
                    "classification": TransactionClassificationType.TRANSFER,
                    "confidence": 0.90,
                    "reason": "Personal P2P/UPI transfer, excluded from verified gig income",
                    "included_in_report": False
                }

        # Check for non-gig corporate salary
        for pat in cls.SALARY_PATTERNS:
            if re.search(pat, desc.lower()):
                return {
                    "matched_platform": None,
                    "classification": TransactionClassificationType.NON_GIG_INCOME,
                    "confidence": 0.92,
                    "reason": "Non-gig corporate salary, excluded from gig verification",
                    "included_in_report": False
                }

        # Default for unmatched credits
        return {
            "matched_platform": None,
            "classification": TransactionClassificationType.UNKNOWN,
            "confidence": 0.60,
            "reason": "Unrecognized credit descriptor without matching gig platform signature",
            "included_in_report": False
        }
