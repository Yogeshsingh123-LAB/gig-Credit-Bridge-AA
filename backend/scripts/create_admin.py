import sys
import os
import argparse

# Add parent directory to path to allow importing app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.enums import UserRole
from app.core.security import hash_password
from app.services.auth_service import get_user_by_email

def create_admin(name: str, email: str, password: str):
    """
    Safely creates an ADMIN user in the database without public endpoint exposure.
    """
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        normalized_email = email.strip().lower()
        existing = get_user_by_email(db, normalized_email)
        if existing:
            print(f"[-] Admin creation skipped: Account with email '{normalized_email}' already exists.")
            return

        if len(password) < 8:
            print("[-] Admin creation failed: Password must be at least 8 characters long.")
            sys.exit(1)

        hashed_pwd = hash_password(password)
        admin_user = User(
            name=name.strip(),
            email=normalized_email,
            password_hash=hashed_pwd,
            role=UserRole.ADMIN,
            is_active=True
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"[+] Admin user successfully created!")
        print(f"    ID: {admin_user.id}")
        print(f"    Name: {admin_user.name}")
        print(f"    Email: {admin_user.email}")
        print(f"    Role: {admin_user.role.value}")
    except Exception as e:
        db.rollback()
        print(f"[-] Error creating admin user: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create initial CredBridge ADMIN user.")
    parser.add_argument("--name", default=os.getenv("ADMIN_NAME", "System Admin"), help="Admin full name")
    parser.add_argument("--email", default=os.getenv("ADMIN_EMAIL", "admin@credbridge.io"), help="Admin email address")
    parser.add_argument("--password", default=os.getenv("ADMIN_PASSWORD", ""), help="Admin password")

    args = parser.parse_args()

    if not args.password:
        print("[-] Error: Admin password must be provided via --password argument or ADMIN_PASSWORD env variable.")
        sys.exit(1)

    create_admin(name=args.name, email=args.email, password=args.password)
