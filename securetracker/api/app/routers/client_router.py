"""
Client Provisioning Router (Admin)

Endpoints:
- POST   /provision           -> creates client DB + tables
- GET    /summary             -> list clients for Admin dashboard
- GET    /                    -> same as summary (backward compatibility)
- DELETE /{client_code}       -> drop client DB + mark client INACTIVE
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import text

from app.services.organisation_service import (
    provision_new_client,
    list_clients_summary,
)
from app.database.db_connection import get_admin_engine, engine

router = APIRouter()

# ✅ Replace this with real RBAC later
def require_admin():
    # Example: validate JWT role == "admin"
    return True


# =========================
# REQUEST MODELS
# =========================
class ClientProvisionRequest(BaseModel):
    client_name: str
    client_code: str
    contact_email: EmailStr


# =========================
# CREATE / PROVISION CLIENT
# =========================
@router.post("/provision")
def provision(req: ClientProvisionRequest, _=Depends(require_admin)):
    try:
        return provision_new_client(
            client_name=req.client_name,
            client_code=req.client_code,
            contact_email=req.contact_email,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# LIST CLIENTS (SUMMARY)
# =========================
@router.get("/summary")
def summary(_=Depends(require_admin)):
    try:
        return list_clients_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Backward compatibility
@router.get("")
@router.get("/")
def list_all(_=Depends(require_admin)):
    try:
        return list_clients_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# DELETE CLIENT (IMPORTANT)
# =========================
