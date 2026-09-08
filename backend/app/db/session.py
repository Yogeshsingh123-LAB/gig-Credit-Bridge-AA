from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.logging import logger

# Create SQLAlchemy engine
# Supports local PostgreSQL, Supabase, Neon, or SQLite fallback for tests
db_url = settings.DATABASE_URL
engine_kwargs = {}
if db_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_pre_ping"] = True

engine = create_engine(db_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency generator for FastAPI routes to manage per-request database sessions.
    Ensures every request receives a clean session that is closed upon completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
