"""
Client Provisioning Router (Admin)
- POST /provision -> creates client DB + tables + procedures
"""
 
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
 
from app.database.client_provisioning_db import provision_client
 
router = APIRouter()
 
# ✅ Replace this with your real RBAC / admin auth dependency later
def require_admin():
    # Example: validate JWT role == "admin"
    return True
 
 
class ClientProvisionRequest(BaseModel):
    client_name: str
    client_code: str
    contact_email: EmailStr
 
 
@router.post("/provision")
def provision(req: ClientProvisionRequest, _=Depends(require_admin)):
    try:
        return provision_client(
            client_name=req.client_name,
            client_code=req.client_code,
            contact_email=req.contact_email,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 