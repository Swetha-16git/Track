"""
Database Connection and Session Management - PostgreSQL
"""
 
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy.engine.url import make_url
from typing import Generator
import logging
import os
 
from app.config.settings import settings
 
logger = logging.getLogger(__name__)
 
# ✅ Base for models
Base = declarative_base()
 
 
# =========================
# DEFAULT APPLICATION ENGINE
# =========================
def get_engine():
    """
    Create main application DB engine (master DB)
    """
    if "postgresql" in settings.DATABASE_URL:
        return create_engine(
            settings.DATABASE_URL,
            poolclass=QueuePool,
            pool_size=settings.DB_POOL_SIZE,
            max_overflow=settings.DB_MAX_OVERFLOW,
            pool_timeout=settings.DB_POOL_TIMEOUT,
            pool_pre_ping=True,
            echo=settings.DB_ECHO,
        )
    else:
        return create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            echo=settings.DB_ECHO,
        )
 
 
engine = get_engine()
 
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
 
 
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
 
 
# =========================
# ADMIN ENGINE (CREATE DATABASE)
# =========================
def get_admin_engine(**kwargs):
    """
    Engine with AUTOCOMMIT for CREATE DATABASE
    """
    admin_url = (
        f"postgresql+psycopg2://"
        f"{os.getenv('MASTER_DB_ADMIN')}:"
        f"{os.getenv('MASTER_DB_PASSWORD')}@"
        f"{os.getenv('MASTER_DB_HOST')}:"
        f"{os.getenv('MASTER_DB_PORT')}/"
        f"{os.getenv('MASTER_DB_POSTGRES_DB', 'postgres')}"
    )
 
    return create_engine(
        admin_url,
        isolation_level=kwargs.get("isolation_level", "AUTOCOMMIT"),
        pool_pre_ping=True,
        echo=False,
    )
 
 
# =========================
# TENANT ENGINE (PER CLIENT DB)
# =========================
def get_tenant_engine(db_name: str):
    """
    Create engine for a tenant/client database
    """
    base_url = make_url(settings.DATABASE_URL)
    tenant_url = base_url.set(database=db_name)
 
    return create_engine(
        tenant_url,
        pool_pre_ping=True,
        echo=settings.DB_ECHO,
    )
 
 
# =========================
# INIT DB (MASTER)
# =========================
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
 