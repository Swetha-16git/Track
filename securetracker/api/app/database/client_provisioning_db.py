"""
Client Provisioning DB Operations (PostgreSQL)

Fixes included:
✅ Ensures master table 'clients' has table_prefix column (migration-safe)
✅ Creates tenant DB name from client_name: securetracker_<client_slug>
✅ Creates tenant tables prefixed by client_slug
✅ Creates client onboarding tables + asset tables inside client DB
✅ Adds helper: get_clients_summary() for Admin dashboard
"""

import re
import logging
from typing import Dict, List, Any
from sqlalchemy import text
from app.database.db_connection import engine as master_engine, get_admin_engine, get_tenant_engine

logger = logging.getLogger(__name__)
SAFE_IDENT_RE = re.compile(r"^[a-zA-Z0-9_]+$")


# -------------------------
# Helpers
# -------------------------
def _slug(value: str) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9_]", "_", value)
    value = re.sub(r"_+", "_", value).strip("_")
    return value


def _ident(name: str) -> str:
    if not name or not SAFE_IDENT_RE.match(name):
        raise ValueError(f"Unsafe identifier: {name}")
    return name


# -------------------------
# MASTER (Registry)
# -------------------------
MASTER_DDL_STEPS = [
    "CREATE EXTENSION IF NOT EXISTS pgcrypto;",
    """
    CREATE TABLE IF NOT EXISTS clients (
      client_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_code TEXT UNIQUE NOT NULL,
      client_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      db_name TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """,
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS table_prefix TEXT;",
    "UPDATE clients SET table_prefix = COALESCE(table_prefix, client_code) WHERE table_prefix IS NULL;",
    "ALTER TABLE clients ALTER COLUMN table_prefix SET NOT NULL;",
    """
    CREATE OR REPLACE PROCEDURE sp_upsert_client(
      IN p_client_code TEXT,
      IN p_client_name TEXT,
      IN p_contact_email TEXT,
      IN p_db_name TEXT,
      IN p_table_prefix TEXT
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      INSERT INTO clients (client_code, client_name, contact_email, db_name, table_prefix)
      VALUES (p_client_code, p_client_name, p_contact_email, p_db_name, p_table_prefix)
      ON CONFLICT (client_code)
      DO UPDATE SET
        client_name = EXCLUDED.client_name,
        contact_email = EXCLUDED.contact_email,
        db_name = EXCLUDED.db_name,
        table_prefix = EXCLUDED.table_prefix,
        status = 'ACTIVE';
    END;
    $$;
    """
]


def ensure_master_ready() -> None:
    with master_engine.begin() as conn:
        for step in MASTER_DDL_STEPS:
            conn.execute(text(step))


# -------------------------
# TENANT (Client DB) Schema
# -------------------------
def build_tenant_schema_sql(prefix: str) -> str:
    prefix = _ident(prefix)

    # Core onboarding tables (prefixed)
    t_client = f"{prefix}_d_client"
    t_client_role = f"{prefix}_d_clientrole"
    t_user = f"{prefix}_d_user"
    t_user_role_map = f"{prefix}_d_userrolemapping"
    t_module = f"{prefix}_d_module"
    t_menu = f"{prefix}_d_menu"
    t_module_menu_map = f"{prefix}_d_modulemenumapping"
    t_client_module_map = f"{prefix}_d_clientmodulemapping"
    t_client_module_menu_map = f"{prefix}_d_clientmodulemenumapping"
    t_client_module_menu_role_map = f"{prefix}_d_clientmodulemenurolemapping"
    t_date = f"{prefix}_d_date"

    # Asset tables (prefixed)
    t_asset_type = f"{prefix}_d_asset_type"
    t_oem = f"{prefix}_d_oem"
    t_gateway = f"{prefix}_d_gateway"
    t_asset = f"{prefix}_d_asset"

    return f"""
    -- ============================
    -- CLIENT ONBOARDING TABLES
    -- ============================
    CREATE TABLE IF NOT EXISTS {t_client}(
        clientkey integer PRIMARY KEY,
        clientcode varchar(50) UNIQUE NOT NULL,
        clientname varchar(255) NOT NULL,
        isactive varchar(5) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS {t_module}(
        modulekey integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        modulecode varchar(50) UNIQUE NOT NULL,
        modulename varchar(255) NOT NULL,
        isactive varchar(5) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS {t_menu}(
        menukey integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        menuname varchar(255) UNIQUE NOT NULL,
        iconname varchar(255) NOT NULL,
        isactive varchar(5) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS {t_client_role}(
        clientrolekey integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        clientkey integer REFERENCES {t_client}(clientkey),
        rolecode varchar(50) NOT NULL,
        rolename varchar(255) NOT NULL,
        isactive varchar(5) NOT NULL,
        UNIQUE (clientkey, rolecode)
    );

    CREATE TABLE IF NOT EXISTS {t_user}(
        userkey integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        username varchar(255) NOT NULL,
        emailid varchar(100) UNIQUE NOT NULL,
        clientkey integer REFERENCES {t_client}(clientkey),
        isactive varchar(5) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS {t_user_role_map}(
        userrolemapkey integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        userkey integer REFERENCES {t_user}(userkey),
        clientrolekey integer REFERENCES {t_client_role}(clientrolekey),
        isactive varchar(5) NOT NULL,
        UNIQUE (userkey, clientrolekey)
    );

    CREATE TABLE IF NOT EXISTS {t_date}(
        datekey integer PRIMARY KEY,
        fulldate date UNIQUE NOT NULL
    );

    -- ============================
    -- ASSET / IOT TABLES
    -- ============================
    CREATE TABLE IF NOT EXISTS {t_asset_type}(
        assettypekey integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        assettypecode varchar(50) UNIQUE NOT NULL,
        assettypename varchar(255) NOT NULL,
        isactive varchar(5) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS {t_oem}(
        oemkey integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        oemcode varchar(50) UNIQUE NOT NULL,
        oemname varchar(255) NOT NULL,
        isactive varchar(5) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS {t_gateway}(
        gatewaykey integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        gatewaycode varchar(50) UNIQUE NOT NULL,
        gatewayname varchar(255) NOT NULL,
        oemkey integer REFERENCES {t_oem}(oemkey),
        isactive varchar(5) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS {t_asset}(
        assetkey integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        assetcode varchar(50) UNIQUE NOT NULL,
        assetname varchar(255) NOT NULL,
        assettypekey integer REFERENCES {t_asset_type}(assettypekey),
        gatewaykey integer REFERENCES {t_gateway}(gatewaykey),
        oemkey integer REFERENCES {t_oem}(oemkey),
        ismobile boolean DEFAULT TRUE,
        isactive varchar(5) NOT NULL
    );
    """


# -------------------------
# Provisioning Operations
# -------------------------
def create_database_if_missing(db_name: str) -> None:
    _ident(db_name)
    admin_engine = get_admin_engine()
    with admin_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :db"),
            {"db": db_name}
        ).first()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{db_name}"'))


def init_tenant_schema(db_name: str, table_prefix: str) -> None:
    tenant_engine = get_tenant_engine(db_name)
    ddl = build_tenant_schema_sql(table_prefix)
    with tenant_engine.begin() as conn:
        conn.execute(text(ddl))


def upsert_client_in_master(client_code: str, client_name: str, email: str, db_name: str, table_prefix: str) -> None:
    with master_engine.begin() as conn:
        conn.execute(
            text("CALL sp_upsert_client(:c,:n,:e,:d,:p)"),
            {"c": client_code, "n": client_name, "e": email, "d": db_name, "p": table_prefix}
        )


def provision_client(client_name: str, client_code: str, contact_email: str) -> Dict[str, str]:
    """
    One-call provisioning:
    ✅ ensures master registry exists
    ✅ creates tenant database
    ✅ creates tenant tables with prefix
    ✅ upserts client registry
    """
    ensure_master_ready()

    name_slug = _slug(client_name) or _slug(client_code)
    db_name = _ident(f"securetracker_{name_slug}")
    table_prefix = _ident(name_slug)

    create_database_if_missing(db_name)
    init_tenant_schema(db_name, table_prefix)

    safe_code = _slug(client_code) or table_prefix
    upsert_client_in_master(
        client_code=safe_code,
        client_name=client_name,
        email=contact_email,
        db_name=db_name,
        table_prefix=table_prefix
    )

    return {"client_code": safe_code, "db_name": db_name, "table_prefix": table_prefix}


def get_clients_summary() -> List[Dict[str, Any]]:
    """
    Used by Admin dashboard:
    Returns client list from master registry table 'clients'
    """
    ensure_master_ready()
    with master_engine.begin() as conn:
        rows = conn.execute(text("""
            SELECT client_code, client_name, contact_email, db_name, table_prefix, status, created_at
            FROM clients
            ORDER BY created_at DESC
        """)).fetchall()

    return [
        {
            "client_code": r[0],
            "client_name": r[1],
            "contact_email": r[2],
            "db_name": r[3],
            "table_prefix": r[4],
            "status": r[5],
            "created_at": str(r[6]),
        }
        for r in rows
    ]