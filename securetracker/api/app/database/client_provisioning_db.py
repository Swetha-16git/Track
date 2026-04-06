"""
Client Provisioning DB Operations (PostgreSQL) — d_* TABLES ONLY

✅ Creates tenant DB name: securetracker_<client_slug>
✅ Creates tenant tables prefixed by client_slug (inside tenant DB)
✅ Stores client registry in ADMIN DB table: d_client (NOT clients)
✅ Admin dashboard summary reads from: d_client

Important fixes:
✅ migration-safe d_client creation (no duplicate PK errors)
✅ adds missing columns with IF NOT EXISTS
✅ handles clientkey identity/sequence OR manual increment safely
✅ NEW: builds tenant DB connection string and stores into d_client.dbconstr
✅ NEW: returns connection details in provision_client response
"""

import re
import logging
from typing import Dict, List, Any, Optional

from sqlalchemy import text
from sqlalchemy.engine import Engine

from app.database.db_connection import (
    engine as master_engine,
    get_admin_engine,
    get_tenant_engine,
)

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


def _engine_conn_details(engine: Engine) -> Dict[str, Any]:
    """
    Extracts connection details from SQLAlchemy engine URL.
    Works even if you are not creating per-tenant DB users.
    """
    url = engine.url

    # Full conn string (includes password if present in URL)
    try:
        conn_str = url.render_as_string(hide_password=False)
    except Exception:
        # fallback
        conn_str = str(url)

    return {
        "engine": (url.drivername or "postgresql"),
        "host": url.host,
        "port": url.port,
        "database_name": url.database,
        "username": url.username,
        "password": url.password,  # may be None depending on your engine config
        "connection_string": conn_str,
    }


# -------------------------
# ADMIN (Registry) — d_client
# -------------------------
def ensure_admin_ready() -> None:
    """
    Ensures d_client exists with required columns.
    Migration-safe:
    ✅ does NOT assume PK constraint name
    ✅ does NOT attempt to create a second PK
    """
    with master_engine.begin() as conn:
        # 1) Create table if missing (minimal required columns)
        conn.execute(
            text(
                """
            CREATE TABLE IF NOT EXISTS d_client (
                clientkey INTEGER NOT NULL,
                clientcode VARCHAR(50) UNIQUE NOT NULL,
                clientname VARCHAR(255) NOT NULL,
                dbname VARCHAR(255) NOT NULL,
                isactive VARCHAR(5) NOT NULL DEFAULT 'Y'
            );
        """
            )
        )

        # 2) Add optional columns if missing
        conn.execute(text("ALTER TABLE d_client ADD COLUMN IF NOT EXISTS dbconstr TEXT NULL;"))
        conn.execute(
            text(
                "ALTER TABLE d_client ADD COLUMN IF NOT EXISTS recordcreatedtimestamp TIMESTAMPTZ NOT NULL DEFAULT now();"
            )
        )

        # 3) Ensure DEFAULT for isactive
        conn.execute(text("ALTER TABLE d_client ALTER COLUMN isactive SET DEFAULT 'Y';"))

        # 4) Ensure a PRIMARY KEY exists (without relying on name)
        pk_exists = conn.execute(
            text(
                """
            SELECT 1
            FROM pg_constraint
            WHERE conrelid = 'd_client'::regclass
              AND contype = 'p'
            LIMIT 1;
        """
            )
        ).first()

        if not pk_exists:
            conn.execute(text("ALTER TABLE d_client ADD PRIMARY KEY (clientkey);"))


def _d_client_sequence_name(conn) -> Optional[str]:
    """
    Returns sequence name if clientkey is backed by a sequence (SERIAL/IDENTITY).
    If not, returns None.
    """
    return conn.execute(text("SELECT pg_get_serial_sequence('d_client','clientkey')")).scalar()


def _clientkey_is_identity(conn) -> bool:
    """
    Checks if clientkey is an IDENTITY column (Postgres 10+).
    Works even if pg_get_serial_sequence returns null.
    """
    row = conn.execute(
        text(
            """
        SELECT identity_generation
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'd_client'
          AND column_name = 'clientkey'
        LIMIT 1;
    """
        )
    ).first()

    return bool(row and row[0])  # identity_generation is not null when identity is used


def _next_client_key(conn) -> int:
    """
    Safely generate next clientkey if NOT identity/serial.
    Uses table lock to avoid duplicates in concurrent requests.
    """
    conn.execute(text("LOCK TABLE d_client IN EXCLUSIVE MODE;"))
    nxt = conn.execute(text("SELECT COALESCE(MAX(clientkey), 0) + 1 FROM d_client")).scalar()
    return int(nxt)


def upsert_client_in_admin_d_client(
    client_code: str,
    client_name: str,
    db_name: str,
    is_active: str = "Y",
    db_con_str: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Upsert client into ADMIN DB table d_client.
    ✅ Works whether clientkey is identity/serial OR manual integer.
    """
    ensure_admin_ready()

    client_code = (client_code or "").strip().upper()
    client_name = (client_name or "").strip()
    db_name = (db_name or "").strip()

    if not client_code or not client_name or not db_name:
        raise ValueError("client_code, client_name and db_name are required")

    with master_engine.begin() as conn:
        seq = _d_client_sequence_name(conn)
        is_identity = _clientkey_is_identity(conn)

        # ✅ If identity/serial exists, we can omit clientkey on insert
        if seq or is_identity:
            conn.execute(
                text(
                    """
                    INSERT INTO d_client (clientcode, clientname, dbname, dbconstr, isactive)
                    VALUES (:code, :name, :dbname, :dbconstr, :isactive)
                    ON CONFLICT (clientcode)
                    DO UPDATE SET
                        clientname = EXCLUDED.clientname,
                        dbname = EXCLUDED.dbname,
                        dbconstr = EXCLUDED.dbconstr,
                        isactive = EXCLUDED.isactive;
                """
                ),
                {
                    "code": client_code,
                    "name": client_name,
                    "dbname": db_name,
                    "dbconstr": db_con_str,
                    "isactive": is_active,
                },
            )
        else:
            # ✅ Manual clientkey mode
            existing_key = conn.execute(
                text("SELECT clientkey FROM d_client WHERE clientcode = :code"),
                {"code": client_code},
            ).scalar()

            if existing_key is None:
                new_key = _next_client_key(conn)
                conn.execute(
                    text(
                        """
                        INSERT INTO d_client (clientkey, clientcode, clientname, dbname, dbconstr, isactive)
                        VALUES (:key, :code, :name, :dbname, :dbconstr, :isactive)
                    """
                    ),
                    {
                        "key": new_key,
                        "code": client_code,
                        "name": client_name,
                        "dbname": db_name,
                        "dbconstr": db_con_str,
                        "isactive": is_active,
                    },
                )
            else:
                conn.execute(
                    text(
                        """
                        UPDATE d_client
                        SET clientname = :name,
                            dbname = :dbname,
                            dbconstr = :dbconstr,
                            isactive = :isactive
                        WHERE clientcode = :code
                    """
                    ),
                    {
                        "code": client_code,
                        "name": client_name,
                        "dbname": db_name,
                        "dbconstr": db_con_str,
                        "isactive": is_active,
                    },
                )

    return {
        "client_code": client_code,
        "client_name": client_name,
        "db_name": db_name,
        "isactive": is_active,
    }


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
    -- CLIENT ONBOARDING TABLES (TENANT DB)
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
    -- ASSET / IOT TABLES (TENANT DB)
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
            {"db": db_name},
        ).first()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{db_name}"'))


def init_tenant_schema(db_name: str, table_prefix: str) -> None:
    tenant_engine = get_tenant_engine(db_name)
    ddl = build_tenant_schema_sql(table_prefix)
    with tenant_engine.begin() as conn:
        conn.execute(text(ddl))


def provision_client(client_name: str, client_code: str, contact_email: str) -> Dict[str, Any]:
    """
    ✅ creates tenant DB
    ✅ creates tenant tables with prefix
    ✅ upserts registry in ADMIN DB: d_client
    ✅ NEW: builds/stores connection string and returns connection info
    """
    ensure_admin_ready()

    name_slug = _slug(client_name) or _slug(client_code)
    db_name = _ident(f"securetracker_{name_slug}")
    table_prefix = _ident(name_slug)

    # Create tenant DB + schema
    create_database_if_missing(db_name)
    init_tenant_schema(db_name, table_prefix)

    # ✅ Build connection details using the same tenant engine your app uses
    tenant_engine = get_tenant_engine(db_name)
    conn_info = _engine_conn_details(tenant_engine)
    db_con_str = conn_info.get("connection_string")

    # Store registry in ADMIN DB (d_client)
    safe_code = (client_code or "").strip().upper()

    upsert_client_in_admin_d_client(
        client_code=safe_code,
        client_name=client_name,
        db_name=db_name,
        is_active="Y",
        db_con_str=db_con_str,   # ✅ previously you passed None
    )

    # ✅ Return complete info so frontend can show it immediately
    return {
        "client_code": safe_code,
        "client_name": client_name,
        "db_name": db_name,
        "table_prefix": table_prefix,
        "database": conn_info,  # contains host/port/user/password/conn-string (if available)
    }


def get_clients_summary() -> List[Dict[str, Any]]:
    """
    ✅ returns clients from d_client (ADMIN DB)
    Frontend expects: client_code, client_name, db_name, status
    """
    ensure_admin_ready()
    with master_engine.begin() as conn:
        rows = conn.execute(
            text(
                """
            SELECT clientkey, clientcode, clientname, dbname, isactive, dbconstr
            FROM d_client
            ORDER BY clientkey ASC
        """
            )
        ).fetchall()

    def _status(isactive: str) -> str:
        v = (isactive or "").strip().upper()
        return "ACTIVE" if v in ("Y", "YES", "TRUE", "ACTIVE", "1") else "INACTIVE"

    return [
        {
            "client_key": r[0],
            "client_code": r[1],
            "client_name": r[2],
            "db_name": r[3],
            "status": _status(r[4]),
            # optional for admin use
            "db_con_str": r[5],
        }
        for r in rows
    ]