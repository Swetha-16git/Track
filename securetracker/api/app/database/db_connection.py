"""
Database Connection and Session Management - PostgreSQL
"""
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy.engine.url import make_url
from typing import Generator, Dict, Tuple
import logging
import os
import threading

from app.config.settings import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

# =========================
# MASTER / ADMIN DB ENGINE
# =========================
def get_engine():
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
    return create_engine(settings.DATABASE_URL, pool_pre_ping=True, echo=settings.DB_ECHO)

engine = get_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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
# TENANT ENGINE by DB NAME (used by provisioning)
# =========================
def get_tenant_engine(db_name: str):
    base_url = make_url(settings.DATABASE_URL)
    tenant_url = base_url.set(database=db_name)
    return create_engine(tenant_url, pool_pre_ping=True, echo=settings.DB_ECHO)

# =========================
# TENANT RESOLVER by client_code (runtime)
# =========================
_TENANT_ENGINE_CACHE: Dict[str, any] = {}
_CACHE_LOCK = threading.Lock()

def resolve_tenant_connection(client_code: str) -> Tuple[str, str]:
    if not client_code:
        raise ValueError("client_code is required")

    code = str(client_code).strip().upper()

    with engine.begin() as conn:
        row = conn.execute(
            text("""
                SELECT dbconstr, dbname
                FROM d_client
                WHERE clientcode = :code
                LIMIT 1
            """),
            {"code": code}
        ).first()

    if not row:
        raise ValueError(f"Client not found in d_client: {code}")

    dbconstr, dbname = row[0], row[1]

    if dbconstr and str(dbconstr).strip():
        return str(dbconstr).strip(), str(dbname).strip() if dbname else ""

    if not dbname:
        raise ValueError(f"dbname missing in d_client for client: {code}")

    base_url = make_url(settings.DATABASE_URL).set(database=str(dbname).strip())
    conn_str = base_url.render_as_string(hide_password=False)
    return conn_str, str(dbname).strip()

def get_tenant_sessionmaker(client_code: str) -> sessionmaker:
    conn_str, _ = resolve_tenant_connection(client_code)

    with _CACHE_LOCK:
        eng = _TENANT_ENGINE_CACHE.get(conn_str)
        if eng is None:
            eng = create_engine(
                conn_str,
                pool_pre_ping=True,
                poolclass=QueuePool,
                pool_size=5,
                max_overflow=10,
                echo=settings.DB_ECHO,
            )
            _TENANT_ENGINE_CACHE[conn_str] = eng

    return sessionmaker(autocommit=False, autoflush=False, bind=eng)

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise