"""
OEM Router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database.db_connection import get_db
from app.services.oem_service import oem_service
from app.security.permissions import require_assets_write, require_assets_read

router = APIRouter(tags=["OEMs"], prefix="/oems")

@router.get("/")
async def get_oems(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_read)
):
    """Get all OEMs"""
    oems = oem_service.get_oems(db, skip, limit)
    
    return {
        "success": True,
        "oems": [
            {
                "OEM_Key": o.OEM_Key,
                "OEM_Provider": o.OEM_Provider,
                "OEM_ProviderName": o.OEM_ProviderName,
                "OEM_Description": o.OEM_Description,
            }
            for o in oems
        ]
    }

@router.post("/")
async def create_oem(
    oem_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_write)
):
    """Create new OEM"""
    success, response = oem_service.create_oem(db, oem_data, current_user)
    if not success:
        raise HTTPException(status_code=400, detail=response["message"])
    return response

@router.get("/{oem_key}")
async def get_oem(
    oem_key: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_read)
):
    """Get specific OEM"""
    oem = oem_service.get_oem(db, oem_key)
    if not oem:
        raise HTTPException(status_code=404, detail="OEM not found")
    return {
        "success": True,
        "oem": oem.__dict__
    }

@router.put("/{oem_key}")
async def update_oem(
    oem_key: int,
    oem_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_write)
):
    """Update OEM"""
    success, response = oem_service.update_oem(db, oem_key, oem_data)
    if not success:
        raise HTTPException(status_code=400, detail=response["message"])
    return response

@router.delete("/{oem_key}")
async def delete_oem(
    oem_key: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_write)
):
    """Delete OEM"""
    success, response = oem_service.delete_oem(db, oem_key)
    if not success:
        raise HTTPException(status_code=400, detail=response["message"])
    return response

