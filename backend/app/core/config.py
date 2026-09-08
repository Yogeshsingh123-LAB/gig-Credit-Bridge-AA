import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CredBridge API"
    API_V1_STR: str = "/api/v1"
    
    # Environment variable fallbacks
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://credbridge_user:credbridge_password@localhost:5432/credbridge_db"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
