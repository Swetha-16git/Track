"""
Tracking Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import logging

from app.database.db_connection import get_db
from app.services.tracking_service import tracking_service
from app.security.permissions import get_current_user, require_tracking_read, require_tracking_write

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/locations")
async def get_all_latest_locations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get latest locations for all assets"""
    organisation_id = current_user.get("organisation_id")
    locations = tracking_service.get_all_latest_locations(db, organisation_id)
    
    return {
        "success": True,
        "locations": [
            {
                "asset_id": loc.asset_id,
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "speed": loc.speed,
                "heading": loc.heading,
                "status": loc.status.value if hasattr(loc.status, 'value') else loc.status,
                "timestamp": loc.server_timestamp.isoformat() if loc.server_timestamp else None
            }
            for loc in locations
        ]
    }


@router.get("/asset/{asset_id}")
async def get_tracking_history(
    asset_id: int,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_tracking_read)
):
    """Get tracking history for an asset"""
    start = datetime.fromisoformat(start_time) if start_time else None
    end = datetime.fromisoformat(end_time) if end_time else None
    
    records = tracking_service.get_tracking_history(db, asset_id, start, end)
    
    return {
        "success": True,
        "records": [
            {
                "id": r.id,
                "asset_id": r.asset_id,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "altitude": r.altitude,
                "speed": r.speed,
                "heading": r.heading,
                "accuracy": r.accuracy,
                "status": r.status.value if hasattr(r.status, 'value') else r.status,
                "timestamp": r.server_timestamp.isoformat() if r.server_timestamp else None
            }
            for r in records
        ]
    }


@router.get("/asset/{asset_id}/latest")
async def get_latest_location(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_tracking_read)
):
    """Get latest location for an asset"""
    location = tracking_service.get_latest_location(db, asset_id)
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tracking data found for this asset"
        )
    
    return {
        "success": True,
        "location": {
            "asset_id": location.asset_id,
            "latitude": location.latitude,
            "longitude": location.longitude,
            "altitude": location.altitude,
            "speed": location.speed,
            "heading": location.heading,
            "accuracy": location.accuracy,
            "status": location.status.value if hasattr(location.status, 'value') else location.status,
            "timestamp": location.server_timestamp.isoformat() if location.server_timestamp else None
        }
    }


@router.post("/record")
async def create_tracking_record(
    record_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_tracking_write)
):
    """Create new tracking record"""
    user_id = int(current_user.get("sub"))
    
    record = tracking_service.create_tracking_record(
        db,
        asset_id=record_data.get("asset_id"),
        user_id=user_id,
        latitude=record_data.get("latitude"),
        longitude=record_data.get("longitude"),
        altitude=record_data.get("altitude"),
        speed=record_data.get("speed"),
        heading=record_data.get("heading"),
        accuracy=record_data.get("accuracy")
    )
    
    return {
        "success": True,
        "record_id": record.id,
        "message": "Tracking record created"
    }

