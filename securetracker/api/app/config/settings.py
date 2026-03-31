"""
Application Settings and Configuration
"""
 
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
 
# Explicitly load .env file (important for Windows & enterprise setups)
load_dotenv()
 
 
class Settings(BaseSettings):
    """Application settings"""
 
    # ========================
    # Application
    # ========================
    APP_NAME: str = "Secure Tracker"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=True)
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    API_PREFIX: str = "/api/v1"
    LOG_LEVEL: str = "INFO"
 
    # ========================
    # Security / Auth
    # ========================
    SECRET_KEY: str = Field(
        default="dev-secret-key-change-in-production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    MFA_TOKEN_EXPIRE_MINUTES: int = 5
 
    # ========================
    # Database (PostgreSQL)
    # ========================
    DATABASE_URL: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/securetracker"
    )
    DB_ECHO: bool = False
 
    # SQLAlchemy connection pool
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
 
    # ========================
    # CORS
    # ========================
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]
 
    # ========================
    # MFA / OTP
    # ========================
    MFA_ISSUER: str = "Secure Tracker"
    OTP_LENGTH: int = 6
    OTP_WINDOW: int = 1
 
    # ========================
    # SMS / Email (Optional)
    # ========================
    SMS_GATEWAY_API_KEY: str = ""
    SMS_GATEWAY_URL: str = ""
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@securetracker.com"
 
    # ========================
    # Active Directory (Optional)
    # ========================
    AD_SERVER: str = ""
    AD_PORT: int = 389
    AD_BASE_DN: str = ""
    AD_DOMAIN: str = ""
    AD_USE_SSL: bool = False
 
    # ========================
    # JWT
    # ========================
    JWT_ALGORITHM: str = "HS256"
    JWT_SECRET_KEY: str = Field(
        default="dev-jwt-secret-change-in-production"
    )
 
    # ========================
    # Roles
    # ========================
    ADMIN_ROLE: str = "admin"
    VIEWER_ROLE: str = "viewer"
 
    # ✅ ✅ ✅ IMPORTANT FIX (Pydantic v2)
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"   # ✅ allows MASTER_DB_* vars
    )
 
 
# ✅ Singleton settings instance
settings = Settings()
 
 
 