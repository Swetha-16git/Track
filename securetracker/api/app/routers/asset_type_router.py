"""
Asset Type Router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database.db_connection import get_db
from app.services.asset_type_service import asset_type_service
from app.security.permissions import require_assets_write, require_assets_read

router = APIRouter(tags=["Asset Types"], prefix="/asset-types")

@router.get("/")
async def get_asset_types(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_read)
):
    """Get all asset types"""
    asset_types = asset_type_service.get_asset_types(db, skip, limit)
    
    return {
        "success": True,
        "asset_types": [
            {
                "Asset_Type_Key": at.Asset_Type_Key,
                "Asset_Type": at.Asset_Type,
                "Asset_Code": at.Asset_Code,
                "Criticality": at.Criticality,
                "ShortCode": at.ShortCode,
                "IconCssName": at.IconCssName,
            }
            for at in asset_types
        ]
    }

@router.post("/")
async def create_asset_type(
    asset_type_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_write)
):
    """Create new asset type"""
    success, response = asset_type_service.create_asset_type(db, asset_type_data, current_user)
    if not success:
        raise HTTPException(status_code=400, detail=response["message"])
    return response

@router.get("/{asset_type_key}")
async def get_asset_type(
    asset_type_key: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_read)
):
    """Get specific asset type"""
    asset_type = asset_type_service.get_asset_type(db, asset_type_key)
    if not asset_type:
        raise HTTPException(status_code=404, detail="Asset type not found")
    return {
        "success": True,
        "asset_type": asset_type.__dict__
    }

@router.put("/{asset_type_key}")
async def update_asset_type(
    asset_type_key: int,
    asset_type_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_write)
):
    """Update asset type"""
    success, response = asset_type_service.update_asset_type(db, asset_type_key, asset_type_data)
    if not success:
        raise HTTPException(status_code=400, detail=response["message"])
    return response

@router.delete("/{asset_type_key}")
async def delete_asset_type(
    asset_type_key: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_write)
):
    """Delete asset type"""
    success, response = asset_type_service.delete_asset_type(db, asset_type_key)
    if not success:
        raise HTTPException(status_code=400, detail=response["message"])
    return response

