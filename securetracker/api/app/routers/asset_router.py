"""
Asset Router (CORRECTED)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import logging

from app.database.db_connection import get_db
from app.services.asset_service import asset_service
from app.security.permissions import (
    get_current_user,
    require_assets_read,
    require_assets_write
)

logger = logging.getLogger(__name__)

# ✅ IMPORTANT: prefix must match Swagger URL
router = APIRouter(tags=["Assets"])


@router.get("/")
async def get_assets(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_read)
):
    """Get list of assets"""
    organisation_id = current_user.get("organisation_id")

    assets = asset_service.get_assets(
        db=db,
        skip=skip,
        limit=limit,
        organisation_id=organisation_id,
        status=status
    )

    return {
        "success": True,
        "assets": [
            {
                "id": a.id,
                "asset_id": a.asset_id,
                "name": a.name,
                "description": a.description,
                "asset_type": a.asset_type.value if hasattr(a.asset_type, "value") else a.asset_type,
                "status": a.status.value if hasattr(a.status, "value") else a.status,
                "make": a.make,
                "model": a.model,
                "year": a.year,
                "license_plate": a.license_plate,
                "last_latitude": a.last_latitude,
                "last_longitude": a.last_longitude,
                "organisation_id": a.organisation_id,
                "created_at": a.created_at.isoformat() if a.created_at else None
            }
            for a in assets
        ]
    }


@router.get("/{asset_id}")
async def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_read)
):
    """Get asset by ID"""
    asset = asset_service.get_asset_by_id(db, asset_id)

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )

    return {
        "success": True,
        "asset": {
            "id": asset.id,
            "asset_id": asset.asset_id,
            "name": asset.name,
            "description": asset.description,
            "asset_type": asset.asset_type.value if hasattr(asset.asset_type, "value") else asset.asset_type,
            "status": asset.status.value if hasattr(asset.status, "value") else asset.status,
            "make": asset.make,
            "model": asset.model,
            "year": asset.year,
            "license_plate": asset.license_plate,
            "vin": asset.vin,
            "color": asset.color,
            "last_latitude": asset.last_latitude,
            "last_longitude": asset.last_longitude,
            "last_location_update": asset.last_location_update.isoformat() if asset.last_location_update else None,
            "organisation_id": asset.organisation_id,
            "owner_id": asset.owner_id,
            "created_at": asset.created_at.isoformat() if asset.created_at else None,
            "updated_at": asset.updated_at.isoformat() if asset.updated_at else None
        }
    }


@router.post("/")
async def create_asset(
    asset_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_write)
):
    """Create new asset"""
    success, response = asset_service.create_asset(db, asset_data, current_user)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message")
        )

    return response


@router.put("/{asset_id}")
async def update_asset(
    asset_id: int,
    asset_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_write)
):
    """Update asset"""
    success, response = asset_service.update_asset(db, asset_id, asset_data)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message")
        )

    return response


@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_assets_write)
):
    """Delete asset"""
    success, response = asset_service.delete_asset(db, asset_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message")
        )

    return response


@router.put("/{asset_id}/location")
async def update_asset_location(
    asset_id: int,
    location_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update asset location"""
    latitude = location_data.get("latitude")
    longitude = location_data.get("longitude")

    if latitude is None or longitude is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Latitude and longitude are required"
        )

    success, response = asset_service.update_asset_location(
        db, asset_id, latitude, longitude
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message")
        )

    return response