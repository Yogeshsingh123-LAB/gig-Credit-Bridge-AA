import uuid
import random
from datetime import date, datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from app.providers.aa.aa_provider import BaseAAProvider

class MockAAProvider(BaseAAProvider):
    """
    Mock / Sandbox Account Aggregator Provider conforming to Sahamati AA standards.
    Simulates FIU-AA consent lifecycle and authorized bank data retrieval.
    Clearly designated for Demo / Hackathon environments.
    """

    MOCK_ACCOUNTS = [
        {
            "account_id": "acc_hdfc_4821",
            "bank_name": "HDFC Bank",
            "account_mask": "****4821",
            "account_type": "SAVINGS",
            "fip_id": "FIP-HDFC-01",
            "fip_name": "HDFC Bank Financial Information Provider",
            "balance_indicative": 18450.00,
            "currency": "INR",
            "is_linked": True,
            "is_selected": True
        },
        {
            "account_id": "acc_sbi_9217",
            "bank_name": "State Bank of India",
            "account_mask": "****9217",
            "account_type": "SAVINGS",
            "fip_id": "FIP-SBI-01",
            "fip_name": "SBI Financial Information Provider",
            "balance_indicative": 34200.00,
            "currency": "INR",
            "is_linked": True,
            "is_selected": True
        },
        {
            "account_id": "acc_icici_1045",
            "bank_name": "ICICI Bank",
            "account_mask": "****1045",
            "account_type": "SAVINGS",
            "fip_id": "FIP-ICICI-01",
            "fip_name": "ICICI Bank Financial Information Provider",
            "balance_indicative": 7800.00,
            "currency": "INR",
            "is_linked": True,
            "is_selected": False
        }
    ]

    def __init__(self):
        self._consents: Dict[str, Dict[str, Any]] = {}

    def create_consent_request(
        self,
        worker_id: str,
        purpose: str,
        data_types: List[str],
        date_range: Dict[str, Optional[date]]
    ) -> Dict[str, Any]:
        consent_id = f"AA-REQ-{uuid.uuid4().hex[:12].upper()}"
        start_d = date_range.get("start_date")
        end_d = date_range.get("end_date")

        consent_artifact = {
            "consent_id": consent_id,
            "worker_id": worker_id,
            "provider": "Mock Account Aggregator (Sahamati Sandbox)",
            "purpose": purpose or "Income verification only",
            "data_types": data_types or ["TRANSACTIONS", "PROFILE"],
            "start_date": start_d.isoformat() if start_d else (date.today() - timedelta(days=180)).isoformat(),
            "end_date": end_d.isoformat() if end_d else date.today().isoformat(),
            "consent_status": "ACTIVE",
            "consent_version": "v1.0",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
            "is_demo": True
        }
        self._consents[consent_id] = consent_artifact
        return consent_artifact

    def fetch_linked_accounts(self, worker_id: str) -> List[Dict[str, Any]]:
        # Returns registered demo accounts with masked numbers
        return [dict(acc) for acc in self.MOCK_ACCOUNTS]

    def fetch_financial_data(
        self,
        consent_id: str,
        account_ids: List[str],
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """
        Synthesizes realistic multi-month banking statements for the selected accounts.
        Includes Uber & Zomato gig credits, personal transfers, salary credits, fuel debits, and expenses.
        """
        today = end_date or date.today()
        start = start_date or (today - timedelta(days=180))

        accounts_to_query = [acc for acc in self.MOCK_ACCOUNTS if acc["account_id"] in account_ids]
        if not accounts_to_query:
            accounts_to_query = [self.MOCK_ACCOUNTS[0]]

        transactions: List[Dict[str, Any]] = []

        # Platform templates
        gig_templates = [
            {"source": "HDFC Bank", "desc": "UPI/CR/UBER TECHNOLOGIES INDIA/WEEKLY PAYOUT", "platform": "Uber", "min_amt": 2800, "max_amt": 5400},
            {"source": "HDFC Bank", "desc": "NEFT CR-UBER BV-INCOME DISBURSEMENT", "platform": "Uber", "min_amt": 3100, "max_amt": 6200},
            {"source": "State Bank of India", "desc": "UPI/CR/ZOMATO MEDIA PVT LTD/DELIVERY SETTLEMENT", "platform": "Zomato", "min_amt": 2200, "max_amt": 4500},
            {"source": "State Bank of India", "desc": "IMPS CR-ZOMATO LIMITED-PAYOUT", "platform": "Zomato", "min_amt": 2500, "max_amt": 4800},
            {"source": "HDFC Bank", "desc": "UPI/CR/BUNDL TECH SWIGGY/INCENTIVE", "platform": "Swiggy", "min_amt": 1500, "max_amt": 3800},
        ]

        # Non-gig templates to test classification filtering
        non_gig_templates = [
            {"source": "HDFC Bank", "desc": "UPI/CR/RAHUL SHARMA/P2P TRANSFER", "type": "CREDIT", "cat": "TRANSFER", "min_amt": 500, "max_amt": 3000},
            {"source": "State Bank of India", "desc": "NEFT CR/PREVIOUS CORP TECH/SALARY ADJUSTMENT", "type": "CREDIT", "cat": "NON_GIG_INCOME", "min_amt": 15000, "max_amt": 25000},
            {"source": "HDFC Bank", "desc": "UPI/CR/AMAZON SELLER REFUND", "type": "CREDIT", "cat": "NON_GIG_INCOME", "min_amt": 450, "max_amt": 1200},
            {"source": "State Bank of India", "desc": "POS DEBIT/HPCL PETROL PUMP BANGALORE", "type": "DEBIT", "cat": "EXPENSE", "min_amt": 400, "max_amt": 950},
            {"source": "HDFC Bank", "desc": "UPI/DR/SWIGGY INSTAMART GROCERIES", "type": "DEBIT", "cat": "EXPENSE", "min_amt": 350, "max_amt": 1200},
            {"source": "State Bank of India", "desc": "ATM WDL/SBI ATM KORAMANGALA", "type": "DEBIT", "cat": "EXPENSE", "min_amt": 1000, "max_amt": 4000},
            {"source": "HDFC Bank", "desc": "UPI/DR/BIKE SERVICE CENTER REPAIR", "type": "DEBIT", "cat": "EXPENSE", "min_amt": 600, "max_amt": 2200},
        ]

        curr = start
        # Use deterministic seed based on start date and worker to ensure consistent reproducible numbers
        rng = random.Random(42)

        while curr <= today:
            # Generate weekly gig disbursements
            if curr.weekday() in (0, 3): # Mondays and Thursdays
                for acc in accounts_to_query:
                    template = rng.choice(gig_templates)
                    amt = round(rng.uniform(template["min_amt"], template["max_amt"]), 2)
                    transactions.append({
                        "id": f"tx_mock_{uuid.uuid4().hex[:10]}",
                        "account_id": acc["account_id"],
                        "bank_name": acc["bank_name"],
                        "account_mask": acc["account_mask"],
                        "transaction_date": curr.isoformat(),
                        "transaction_type": "CREDIT",
                        "amount": amt,
                        "description": template["desc"],
                        "source": f"{acc['bank_name']} ({acc['account_mask']})",
                        "reference_id": f"REF{curr.strftime('%Y%m%d')}{rng.randint(1000, 9999)}",
                        "is_demo": True
                    })

            # Generate occasional non-gig transactions
            if rng.random() < 0.35:
                acc = rng.choice(accounts_to_query)
                non_gig = rng.choice(non_gig_templates)
                amt = round(rng.uniform(non_gig["min_amt"], non_gig["max_amt"]), 2)
                transactions.append({
                    "id": f"tx_mock_{uuid.uuid4().hex[:10]}",
                    "account_id": acc["account_id"],
                    "bank_name": acc["bank_name"],
                    "account_mask": acc["account_mask"],
                    "transaction_date": curr.isoformat(),
                    "transaction_type": non_gig["type"],
                    "amount": amt,
                    "description": non_gig["desc"],
                    "source": f"{acc['bank_name']} ({acc['account_mask']})",
                    "reference_id": f"REF{curr.strftime('%Y%m%d')}{rng.randint(1000, 9999)}",
                    "is_demo": True
                })

            curr += timedelta(days=1)

        # Sort chronologically
        transactions.sort(key=lambda x: x["transaction_date"], reverse=True)
        return transactions
