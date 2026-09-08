from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

# Handle sqlite vs postgresql dialect if needed, defaulting to standard postgresql connection engine
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Lazy/resilient engine creation
engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency helper for acquiring DB sessions in API endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
