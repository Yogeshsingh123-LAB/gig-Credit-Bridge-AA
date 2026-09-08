import os
import sys
import json
import random
import argparse
from datetime import date, datetime, timedelta, timezone
from typing import List, Dict, Any

from app.db.session import SessionLocal, engine
from app.db.base import Base
import app.models  # Ensure all models are registered
from app.models.user import User
from app.models.enums import UserRole
from app.models.worker_profile import WorkerProfile
from app.models.financial_account import FinancialAccount
from app.models.aa_consent import AAConsent
from app.models.income_report import IncomeReport

# The 10 synthetic demo workers required by specification (Sections 76, 83)
DEMO_WORKERS = [
    {
        "index": 1,
        "name": "Aarav Sharma",
        "aadhaar": "XXXXXXXX1001",
        "email": "aarav.sharma@demo.credbridge.internal",
        "phone": "+91 98765 01001",
        "city": "Bengaluru",
        "occupation": "Delivery & Logistics Specialist",
        "experience_months": 24,
        "pattern": "stable",
        "min_monthly": 28000,
        "max_monthly": 34000,
        "platforms": ["QuickRide", "FoodDash"],
        "accounts": [
            {"bank_name": "HDFC Bank", "account_mask": "•••• 4521", "type": "SAVINGS", "balance": 32400.0},
            {"bank_name": "State Bank of India", "account_mask": "•••• 8912", "type": "SAVINGS", "balance": 18500.0}
        ]
    },
    {
        "index": 2,
        "name": "Rohan Patel",
        "aadhaar": "XXXXXXXX1002",
        "email": "rohan.patel@demo.credbridge.internal",
        "phone": "+91 98765 01002",
        "city": "Mumbai",
        "occupation": "Rideshare Captain",
        "experience_months": 36,
        "pattern": "high_fluctuating",
        "min_monthly": 45000,
        "max_monthly": 72000,
        "platforms": ["UrbanMove"],
        "accounts": [
            {"bank_name": "ICICI Bank", "account_mask": "•••• 3318", "type": "SAVINGS", "balance": 54200.0}
        ]
    },
    {
        "index": 3,
        "name": "Vikram Kumar",
        "aadhaar": "XXXXXXXX1003",
        "email": "vikram.kumar@demo.credbridge.internal",
        "phone": "+91 98765 01003",
        "city": "Delhi NCR",
        "occupation": "Express Courier Partner",
        "experience_months": 14,
        "pattern": "low_consistent",
        "min_monthly": 14000,
        "max_monthly": 18000,
        "platforms": ["ParcelGo"],
        "accounts": [
            {"bank_name": "State Bank of India", "account_mask": "•••• 6124", "type": "SAVINGS", "balance": 12800.0}
        ]
    },
    {
        "index": 4,
        "name": "Rahul Verma",
        "aadhaar": "XXXXXXXX1004",
        "email": "rahul.verma@demo.credbridge.internal",
        "phone": "+91 98765 01004",
        "city": "Hyderabad",
        "occupation": "On-Demand Tasks Specialist",
        "experience_months": 20,
        "pattern": "upward_trend",
        "min_monthly": 18000,
        "max_monthly": 55000,
        "platforms": ["TaskKart", "FoodDash"],
        "accounts": [
            {"bank_name": "Axis Bank", "account_mask": "•••• 7742", "type": "SAVINGS", "balance": 28900.0},
            {"bank_name": "Kotak Mahindra Bank", "account_mask": "•••• 1184", "type": "SAVINGS", "balance": 15400.0}
        ]
    },
    {
        "index": 5,
        "name": "Aditya Mehta",
        "aadhaar": "XXXXXXXX1005",
        "email": "aditya.mehta@demo.credbridge.internal",
        "phone": "+91 98765 01005",
        "city": "Pune",
        "occupation": "City Logistics Associate",
        "experience_months": 18,
        "pattern": "downward_trend",
        "min_monthly": 20000,
        "max_monthly": 48000,
        "platforms": ["Local Delivery Services"],
        "accounts": [
            {"bank_name": "HDFC Bank", "account_mask": "•••• 9054", "type": "SAVINGS", "balance": 21000.0}
        ]
    },
    {
        "index": 6,
        "name": "Karan Shah",
        "aadhaar": "XXXXXXXX1006",
        "email": "karan.shah@demo.credbridge.internal",
        "phone": "+91 98765 01006",
        "city": "Ahmedabad",
        "occupation": "Rideshare Captain",
        "experience_months": 22,
        "pattern": "volatile",
        "min_monthly": 12000,
        "max_monthly": 58000,
        "platforms": ["QuickRide"],
        "accounts": [
            {"bank_name": "State Bank of India", "account_mask": "•••• 4410", "type": "SAVINGS", "balance": 16700.0}
        ]
    },
    {
        "index": 7,
        "name": "Nikhil Joshi",
        "aadhaar": "XXXXXXXX1007",
        "email": "nikhil.joshi@demo.credbridge.internal",
        "phone": "+91 98765 01007",
        "city": "Bengaluru",
        "occupation": "Multi-Platform Delivery Executive",
        "experience_months": 30,
        "pattern": "multiple_sources",
        "min_monthly": 32000,
        "max_monthly": 45000,
        "platforms": ["QuickRide", "FoodDash", "ParcelGo", "TaskKart"],
        "accounts": [
            {"bank_name": "HDFC Bank", "account_mask": "•••• 7812", "type": "SAVINGS", "balance": 41200.0},
            {"bank_name": "ICICI Bank", "account_mask": "•••• 5590", "type": "SAVINGS", "balance": 29800.0}
        ]
    },
    {
        "index": 8,
        "name": "Arjun Yadav",
        "aadhaar": "XXXXXXXX1008",
        "email": "arjun.yadav@demo.credbridge.internal",
        "phone": "+91 98765 01008",
        "city": "Kolkata",
        "occupation": "Transit Driver",
        "experience_months": 28,
        "pattern": "dominant_source",
        "min_monthly": 24000,
        "max_monthly": 31000,
        "platforms": ["UrbanMove"],
        "accounts": [
            {"bank_name": "Axis Bank", "account_mask": "•••• 2289", "type": "SAVINGS", "balance": 23500.0}
        ]
    },
    {
        "index": 9,
        "name": "Manish Gupta",
        "aadhaar": "XXXXXXXX1009",
        "email": "manish.gupta@demo.credbridge.internal",
        "phone": "+91 98765 01009",
        "city": "Jaipur",
        "occupation": "Food Delivery Specialist",
        "experience_months": 16,
        "pattern": "seasonal",
        "min_monthly": 15000,
        "max_monthly": 42000,
        "platforms": ["FoodDash"],
        "accounts": [
            {"bank_name": "Kotak Mahindra Bank", "account_mask": "•••• 9871", "type": "SAVINGS", "balance": 19400.0}
        ]
    },
    {
        "index": 10,
        "name": "Sahil Desai",
        "aadhaar": "XXXXXXXX1010",
        "email": "sahil.desai@demo.credbridge.internal",
        "phone": "+91 98765 01010",
        "city": "Surat",
        "occupation": "General Gig Partner",
        "experience_months": 19,
        "pattern": "mixed",
        "min_monthly": 22000,
        "max_monthly": 38000,
        "platforms": ["QuickRide", "UrbanMove", "Other Identified Gig Income"],
        "accounts": [
            {"bank_name": "HDFC Bank", "account_mask": "•••• 3412", "type": "SAVINGS", "balance": 27300.0},
            {"bank_name": "State Bank of India", "account_mask": "•••• 8109", "type": "SAVINGS", "balance": 14600.0}
        ]
    }
]

# Path to persisted mock transactions store
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
MOCK_STORE_PATH = os.path.join(DATA_DIR, "mock_transactions_data.json")

def generate_user_transactions(worker_def: Dict[str, Any], rng: random.Random) -> List[Dict[str, Any]]:
    """
    Generates 120-300 realistic raw synthetic transactions spanning exactly 12 months.
    Includes gig credits, internal transfers, unrelated expenses, loans, cash deposits,
    refunds, reversals, and controlled duplicates.
    """
    today = date.today()
    start_date = today - timedelta(days=365)
    
    pattern = worker_def["pattern"]
    min_m = worker_def["min_monthly"]
    max_m = worker_def["max_monthly"]
    platforms = worker_def["platforms"]
    accounts = worker_def["accounts"]
    
    transactions = []
    
    # 1. Generate 12 months of gig income credits
    for m_idx in range(12):
        # Determine target income for this month based on pattern
        if pattern == "stable":
            target_month_inc = rng.uniform(min_m, max_m)
        elif pattern == "high_fluctuating":
            target_month_inc = rng.uniform(min_m, max_m)
        elif pattern == "low_consistent":
            target_month_inc = rng.uniform(min_m, max_m)
        elif pattern == "upward_trend":
            progress = m_idx / 11.0
            target_month_inc = min_m + (max_m - min_m) * progress
        elif pattern == "downward_trend":
            progress = m_idx / 11.0
            target_month_inc = max_m - (max_m - min_m) * progress
        elif pattern == "volatile":
            factor = 1.0 if m_idx % 2 == 0 else 0.4
            target_month_inc = (min_m + (max_m - min_m) * factor)
        elif pattern == "seasonal":
            factor = 1.0 if m_idx in (2, 3, 8, 9) else 0.45
            target_month_inc = (min_m + (max_m - min_m) * factor)
        else:
            target_month_inc = rng.uniform(min_m, max_m)
        
        # Approximate 4-8 gig credits per month (weekly/bi-weekly payouts)
        num_payouts = rng.randint(4, 7)
        base_payout = target_month_inc / num_payouts
        
        # Month time boundaries
        m_start = start_date + timedelta(days=int(m_idx * 30.4))
        
        for p_idx in range(num_payouts):
            tx_day = m_start + timedelta(days=min(28, p_idx * 5 + rng.randint(1, 3)))
            if tx_day > today:
                continue
                
            plat = rng.choice(platforms)
            acc = rng.choice(accounts)
            payout_amt = round(rng.uniform(base_payout * 0.85, base_payout * 1.15), 2)
            ref = f"GIGPAY{tx_day.strftime('%Y%m%d')}{rng.randint(10000, 99999)}"
            
            tx_id = f"tx_gig_{worker_def['index']}_{m_idx}_{p_idx}_{rng.randint(1000,9999)}"
            
            transactions.append({
                "id": tx_id,
                "account_mask": acc["account_mask"],
                "bank_name": acc["bank_name"],
                "transaction_date": tx_day.isoformat(),
                "transaction_type": "CREDIT",
                "amount": payout_amt,
                "description": f"UPI/CR/{plat.upper()} DISBURSEMENT/WEEKLY PAYOUT",
                "source": f"{acc['bank_name']} ({acc['account_mask']})",
                "reference_id": ref,
                "is_demo": True
            })
            
            # Controlled Duplicate for test (Section 88): every once in a while produce duplicate
            if m_idx == 4 and p_idx == 0:
                transactions.append({
                    "id": f"{tx_id}_dup",
                    "account_mask": acc["account_mask"],
                    "bank_name": acc["bank_name"],
                    "transaction_date": tx_day.isoformat(),
                    "transaction_type": "CREDIT",
                    "amount": payout_amt,
                    "description": f"UPI/CR/{plat.upper()} DISBURSEMENT/WEEKLY PAYOUT",
                    "source": f"{acc['bank_name']} ({acc['account_mask']})",
                    "reference_id": ref, # Same reference!
                    "is_demo": True,
                    "is_duplicate": True
                })

    # 2. Add realistic Reversal (Section 90)
    rev_day = start_date + timedelta(days=95)
    rev_acc = accounts[0]
    rev_plat = platforms[0]
    transactions.append({
        "id": f"tx_rev_cr_{worker_def['index']}",
        "account_mask": rev_acc["account_mask"],
        "bank_name": rev_acc["bank_name"],
        "transaction_date": rev_day.isoformat(),
        "transaction_type": "CREDIT",
        "amount": 2000.00,
        "description": f"UPI/CR/{rev_plat.upper()}/TEMPORARY ADJUSTMENT",
        "source": f"{rev_acc['bank_name']} ({rev_acc['account_mask']})",
        "reference_id": f"REV{worker_def['index']}CR",
        "is_demo": True
    })
    transactions.append({
        "id": f"tx_rev_dr_{worker_def['index']}",
        "account_mask": rev_acc["account_mask"],
        "bank_name": rev_acc["bank_name"],
        "transaction_date": (rev_day + timedelta(days=1)).isoformat(),
        "transaction_type": "DEBIT",
        "amount": 2000.00,
        "description": f"UPI/DR/{rev_plat.upper()} PAYMENT REVERSED",
        "source": f"{rev_acc['bank_name']} ({rev_acc['account_mask']})",
        "reference_id": f"REV{worker_def['index']}DR",
        "is_demo": True
    })

    # 3. Add realistic Refund (Section 89)
    rfnd_day = start_date + timedelta(days=140)
    transactions.append({
        "id": f"tx_refund_{worker_def['index']}",
        "account_mask": rev_acc["account_mask"],
        "bank_name": rev_acc["bank_name"],
        "transaction_date": rfnd_day.isoformat(),
        "transaction_type": "CREDIT",
        "amount": 850.00,
        "description": f"UPI/CR/{platforms[0].upper()} REFUND",
        "source": f"{rev_acc['bank_name']} ({rev_acc['account_mask']})",
        "reference_id": f"REFUND{worker_def['index']}",
        "is_demo": True
    })

    # 4. Add Internal Transfers if multiple accounts exist (Section 87)
    if len(accounts) >= 2:
        for i in range(3):
            t_day = start_date + timedelta(days=45 + i * 80)
            transactions.append({
                "id": f"tx_internal_cr_{worker_def['index']}_{i}",
                "account_mask": accounts[1]["account_mask"],
                "bank_name": accounts[1]["bank_name"],
                "transaction_date": t_day.isoformat(),
                "transaction_type": "CREDIT",
                "amount": 5000.00,
                "description": f"INTERNAL TRANSFER: {accounts[0]['bank_name']} -> {accounts[1]['bank_name']}",
                "source": f"{accounts[1]['bank_name']} ({accounts[1]['account_mask']})",
                "reference_id": f"OWNACC{worker_def['index']}{i}",
                "is_demo": True
            })

    # 5. Add Synthetic Loans and Cash Deposits (Sections 91, 92)
    loan_day = start_date + timedelta(days=110)
    transactions.append({
        "id": f"tx_loan_{worker_def['index']}",
        "account_mask": accounts[0]["account_mask"],
        "bank_name": accounts[0]["bank_name"],
        "transaction_date": loan_day.isoformat(),
        "transaction_type": "CREDIT",
        "amount": 40000.00,
        "description": "NEFT CR/EARLYSALARY LENDING/PERSONAL LOAN DISBURSEMENT",
        "source": f"{accounts[0]['bank_name']} ({accounts[0]['account_mask']})",
        "reference_id": f"LOAN{worker_def['index']}",
        "is_demo": True
    })
    
    cash_day = start_date + timedelta(days=170)
    transactions.append({
        "id": f"tx_cash_{worker_def['index']}",
        "account_mask": accounts[0]["account_mask"],
        "bank_name": accounts[0]["bank_name"],
        "transaction_date": cash_day.isoformat(),
        "transaction_type": "CREDIT",
        "amount": 10000.00,
        "description": "BY CASH DEPOSIT AT CDM BRANCH",
        "source": f"{accounts[0]['bank_name']} ({accounts[0]['account_mask']})",
        "reference_id": f"CASH{worker_def['index']}",
        "is_demo": True
    })

    # 6. Add Personal P2P Transfers (Section 93)
    for p2p_idx in range(4):
        p2p_day = start_date + timedelta(days=30 + p2p_idx * 75)
        transactions.append({
            "id": f"tx_p2p_{worker_def['index']}_{p2p_idx}",
            "account_mask": accounts[0]["account_mask"],
            "bank_name": accounts[0]["bank_name"],
            "transaction_date": p2p_day.isoformat(),
            "transaction_type": "CREDIT",
            "amount": float(rng.randint(800, 3500)),
            "description": "UPI/CR/FAMILY TRANSFER/GIFT",
            "source": f"{accounts[0]['bank_name']} ({accounts[0]['account_mask']})",
            "reference_id": f"P2P{worker_def['index']}{p2p_idx}",
            "is_demo": True
        })

    # 7. Add Unrelated Living & Operating Expenses (Section 86)
    expense_templates = [
        ("POS DEBIT/HPCL FUEL STATION BANGALORE", 450.0, 950.0),
        ("UPI/DR/SWIGGY INSTAMART GROCERIES", 320.0, 1100.0),
        ("NEFT DR/HOUSE RENT PAYMENT", 6000.0, 9000.0),
        ("UPI/DR/BESCOM ELECTRICITY BILL", 450.0, 1200.0),
        ("UPI/DR/AIRTEL PREPAID RECHARGE", 299.0, 719.0),
        ("ATM WDL/SBI ATM CASH WITHDRAWAL", 1000.0, 4000.0),
        ("POS DEBIT/LOCAL CAFE RESTAURANT", 250.0, 680.0),
        ("UPI/DR/TWO WHEELER SERVICE MAINTENANCE", 650.0, 2200.0)
    ]
    
    # Target 120-300 transactions total
    needed_expenses = rng.randint(90, 180)
    for exp_i in range(needed_expenses):
        exp_day = start_date + timedelta(days=rng.randint(1, 364))
        acc = rng.choice(accounts)
        desc, low, high = rng.choice(expense_templates)
        amt = round(rng.uniform(low, high), 2)
        transactions.append({
            "id": f"tx_exp_{worker_def['index']}_{exp_i}_{rng.randint(1000,9999)}",
            "account_mask": acc["account_mask"],
            "bank_name": acc["bank_name"],
            "transaction_date": exp_day.isoformat(),
            "transaction_type": "DEBIT",
            "amount": amt,
            "description": desc,
            "source": f"{acc['bank_name']} ({acc['account_mask']})",
            "reference_id": f"EXP{worker_def['index']}{exp_i}",
            "is_demo": True
        })

    # Sort descending by transaction date
    transactions.sort(key=lambda x: x["transaction_date"], reverse=True)
    return transactions

def seed_database(reset: bool = False, seed_value: int = 42):
    """
    Seeds database with 10 synthetic demo users, worker profiles, bank accounts,
    and generates their randomized 12-month transaction records.
    """
    Base.metadata.create_all(bind=engine)
    from sqlalchemy import text
    with engine.connect() as conn:
        for tbl in ["users", "financial_accounts", "aa_consents", "income_reports"]:
            try:
                conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN is_demo BOOLEAN DEFAULT 0"))
                conn.commit()
            except Exception:
                pass
    rng = random.Random(seed_value)
    db = SessionLocal()
    
    all_mock_transactions: Dict[str, List[Dict[str, Any]]] = {}

    try:
        if reset:
            print("[INFO] Resetting existing synthetic demo data...")
            # Remove demo income reports
            db.query(IncomeReport).filter(IncomeReport.is_demo == True).delete(synchronize_session=False)
            # Remove demo financial accounts
            db.query(FinancialAccount).filter(FinancialAccount.is_demo == True).delete(synchronize_session=False)
            # Remove demo consents
            db.query(AAConsent).filter(AAConsent.is_demo == True).delete(synchronize_session=False)
            # Remove demo workers
            demo_user_ids = [u.id for u in db.query(User).filter(User.is_demo == True).all()]
            if demo_user_ids:
                db.query(WorkerProfile).filter(WorkerProfile.user_id.in_(demo_user_ids)).delete(synchronize_session=False)
                db.query(User).filter(User.id.in_(demo_user_ids)).delete(synchronize_session=False)
            db.commit()
            print("[OK] Demo records safely purged.")

        print(f"[INFO] Seeding 10 Synthetic Workers (Seed={seed_value})...")

        for w_def in DEMO_WORKERS:
            # Check or create User
            user = db.query(User).filter(
                (User.identity_provider_user_id == w_def["aadhaar"]) |
                (User.email == w_def["email"])
            ).first()

            if not user:
                user = User(
                    name=w_def["name"],
                    identity_provider="DigiLocker",
                    identity_provider_user_id=w_def["aadhaar"],
                    email=w_def["email"],
                    password_hash=None, # Passwordless DigiLocker user
                    role=UserRole.WORKER,
                    is_active=True,
                    is_demo=True
                )
                db.add(user)
                db.flush()

                profile = WorkerProfile(
                    user_id=user.id,
                    phone=w_def["phone"],
                    city=w_def["city"],
                    occupation=w_def["occupation"],
                    experience_months=w_def["experience_months"],
                    profile_completion=100.0,
                    identity_status="VERIFIED",
                    identity_source="DigiLocker",
                    identity_verified_at=datetime.now(timezone.utc),
                    masked_aadhaar=w_def["aadhaar"],
                    identity_name=w_def["name"]
                )
                db.add(profile)
                db.flush()
            else:
                user.is_demo = True
                user.identity_provider = "DigiLocker"
                user.identity_provider_user_id = w_def["aadhaar"]
                profile = user.worker_profile
                if not profile:
                    profile = WorkerProfile(
                        user_id=user.id,
                        phone=w_def["phone"],
                        city=w_def["city"],
                        occupation=w_def["occupation"],
                        experience_months=w_def["experience_months"],
                        profile_completion=100.0,
                        identity_status="VERIFIED",
                        identity_source="DigiLocker",
                        identity_verified_at=datetime.now(timezone.utc),
                        masked_aadhaar=w_def["aadhaar"],
                        identity_name=w_def["name"]
                    )
                    db.add(profile)
                    db.flush()
                else:
                    profile.identity_status = "VERIFIED"
                    profile.identity_source = "DigiLocker"
                    profile.masked_aadhaar = w_def["aadhaar"]
                    profile.identity_name = w_def["name"]

            # Seed bank accounts for this worker
            db.query(FinancialAccount).filter(FinancialAccount.worker_id == profile.id).delete(synchronize_session=False)
            
            for acc_def in w_def["accounts"]:
                fa = FinancialAccount(
                    worker_id=profile.id,
                    bank_name=acc_def["bank_name"],
                    account_mask=acc_def["account_mask"],
                    account_type=acc_def["type"],
                    fip_id=f"FIP-{acc_def['bank_name'].replace(' ', '')[:4].upper()}",
                    fip_name=f"{acc_def['bank_name']} Information Provider",
                    balance_indicative=acc_def["balance"],
                    currency="INR",
                    is_linked=True,
                    is_selected=True,
                    is_demo=True
                )
                db.add(fa)

            # Generate synthetic 12-month transactions
            user_txs = generate_user_transactions(w_def, rng)
            all_mock_transactions[profile.id] = user_txs
            all_mock_transactions[w_def["aadhaar"]] = user_txs

            print(f"  [+] Worker {w_def['index']:02d}: {w_def['name']:<16} ({w_def['pattern']:<16}) - {len(user_txs)} transactions across 12M")

        db.commit()

        # Persist transactions to JSON store for MockAAProvider
        with open(MOCK_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump(all_mock_transactions, f, indent=2)
        print(f"[OK] Saved {len(all_mock_transactions)} mock transaction sets to {MOCK_STORE_PATH}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed 10 Mock Worker Users & 12-Month Financial Transactions")
    parser.add_argument("--reset", action="store_true", help="Purge existing demo data before seeding")
    parser.add_argument("--seed", type=int, default=42, help="Deterministic random seed (default 42)")
    args = parser.parse_args()

    seed_database(reset=args.reset, seed_value=args.seed)
