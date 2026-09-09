import sys
from pathlib import Path

# Ensure backend and credbridge monorepo root directories are present in sys.path
backend_dir = str(Path(__file__).resolve().parent.parent)
credbridge_dir = str(Path(__file__).resolve().parent.parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if credbridge_dir not in sys.path:
    sys.path.insert(0, credbridge_dir)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from app.core.config import settings
from app.core.logging import logger
from app.api.v1.router import api_v1_router
from app.db.session import engine, SessionLocal
from app.db.base import Base
import app.models
from app.services.admin_service import seed_demo_accounts

def ensure_schema_upgrades():
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            for tbl, col, col_type in [
                ("lender_profiles", "organization_id", "VARCHAR(36)"),
                ("lender_profiles", "status", "VARCHAR(50) DEFAULT 'ACTIVE'"),
                ("lender_profiles", "invitation_token", "VARCHAR(100)"),
                ("lender_profiles", "invitation_sent_at", "TIMESTAMP"),
                ("lender_profiles", "last_login_at", "TIMESTAMP"),
                ("lender_organizations", "organization_identifier", "VARCHAR(100)"),
                ("lender_organizations", "contact_person", "VARCHAR(150)"),
                ("lender_organizations", "max_users", "INTEGER DEFAULT 25"),
                ("lender_organizations", "activated_at", "TIMESTAMP"),
                ("lender_organizations", "deactivated_at", "TIMESTAMP"),
                ("lender_organizations", "suspended_at", "TIMESTAMP"),
                ("lender_organizations", "last_activity_at", "TIMESTAMP"),
                ("audit_logs", "actor_role", "VARCHAR(50)"),
                ("audit_logs", "result", "VARCHAR(50) DEFAULT 'SUCCESS'"),
                ("users", "is_demo", "BOOLEAN DEFAULT 0"),
            ]:
                try:
                    conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN {col} {col_type}"))
                    conn.commit()
                except Exception:
                    pass
    except Exception:
        pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables and seed demo accounts if they do not exist
    try:
        Base.metadata.create_all(bind=engine)
        ensure_schema_upgrades()
        db = SessionLocal()
        try:
            seed_demo_accounts(db)
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Database auto-creation/seeding error: {e}")


    logger.info(f"Starting {settings.APP_NAME} in environment: {settings.APP_ENV}")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Configure CORS for local frontend development and specified origins
cors_origins = (
    settings.CORS_ORIGINS 
    if isinstance(settings.CORS_ORIGINS, list) 
    else [settings.CORS_ORIGINS]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.method} {request.url.path}")
    errors = jsonable_encoder(exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": "Input validation error",
            "detail": errors,
            "details": errors
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected server error on {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "message": "An internal server error occurred."}
    )

# Root Endpoint
@app.get("/", summary="Root Endpoint")
def read_root():
    return {"message": "CredBridge API is running"}

# Include API v1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
