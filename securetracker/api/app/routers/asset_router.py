"""
Asset Router (TENANT-AWARE)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, Generator
import logging

from app.services.asset_service import asset_service
from app.database.db_connection import get_tenant_sessionmaker
from app.security.permissions import (
    get_current_user,
    require_assets_read,
    require_assets_write
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Assets"])

# -----------------------------
# ✅ Tenant DB Dependencies
# -----------------------------
def _extract_client_code(user: dict) -> str:
    """
    Try common keys from your JWT/current_user.
    Adjusting here avoids touching 10 files.
    """
    return (
        user.get("client_code")
        or user.get("clientcode")
        or user.get("client")           # fallback if you used "client"
        or user.get("organisation_code") # fallback if you used organisation_code
    )

def get_tenant_db_read(current_user: dict = Depends(require_assets_read)) -> Generator[Session, None, None]:
    client_code = _extract_client_code(current_user)
    if not client_code:
        raise HTTPException(status_code=400, detail="client_code missing in token/user")

    SessionTenant = get_tenant_sessionmaker(client_code)
    db = SessionTenant()
    try:
        yield db
    finally:
        db.close()

def get_tenant_db_write(current_user: dict = Depends(require_assets_write)) -> Generator[Session, None, None]:
    client_code = _extract_client_code(current_user)
    if not client_code:
        raise HTTPException(status_code=400, detail="client_code missing in token/user")

    SessionTenant = get_tenant_sessionmaker(client_code)
    db = SessionTenant()
    try:
        yield db
    finally:
        db.close()

def get_tenant_db_user(current_user: dict = Depends(get_current_user)) -> Generator[Session, None, None]:
    client_code = _extract_client_code(current_user)
    if not client_code:
        raise HTTPException(status_code=400, detail="client_code missing in token/user")

    SessionTenant = get_tenant_sessionmaker(client_code)
    db = SessionTenant()
    try:
        yield db
    finally:
        db.close()

# -----------------------------
# Routes
# -----------------------------
@router.get("/")
async def get_assets(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_tenant_db_read),
    current_user: dict = Depends(require_assets_read),
):
    """Get list of assets from TENANT DB"""
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
                "vin": a.vin,
                "color": a.color,
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
    asset_id: int,  # ✅ DB primary key (Asset.id)
    db: Session = Depends(get_tenant_db_read),
    current_user: dict = Depends(require_assets_read),
):
    """Get asset by DB ID from TENANT DB"""
    asset = asset_service.get_asset_by_id(db, asset_id)

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )

    return {
        "success": True,
        "asset": asset_service._asset_to_dict(asset)
    }

@router.post("/")
async def create_asset(
    asset_data: dict,
    db: Session = Depends(get_tenant_db_write),
    current_user: dict = Depends(require_assets_write),
):
    """Create new asset in TENANT DB"""
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
    db: Session = Depends(get_tenant_db_write),
    current_user: dict = Depends(require_assets_write),
):
    """Update asset in TENANT DB"""
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
    db: Session = Depends(get_tenant_db_write),
    current_user: dict = Depends(require_assets_write),
):
    """Delete asset in TENANT DB"""
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
    db: Session = Depends(get_tenant_db_user),
    current_user: dict = Depends(get_current_user),
):
    """Update asset location in TENANT DB"""
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