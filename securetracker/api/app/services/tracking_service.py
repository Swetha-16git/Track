"""
Tracking Service
"""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging
 
from app.models.tracking_model import TrackingRecord, TrackingAlert, TrackingStatus
from app.models.asset_model import Asset
 
logger = logging.getLogger(__name__)
 
 
class TrackingService:
    """Tracking service for real-time location data"""
   
    @staticmethod
    def create_tracking_record(db: Session, asset_id: int, user_id: int,
                               latitude: float, longitude: float, **kwargs) -> TrackingRecord:
        """Create new tracking record"""
        record = TrackingRecord(
            asset_id=asset_id,
            user_id=user_id,
            latitude=latitude,
            longitude=longitude,
            altitude=kwargs.get("altitude"),
            speed=kwargs.get("speed"),
            heading=kwargs.get("heading"),
            accuracy=kwargs.get("accuracy"),
            status=kwargs.get("status", TrackingStatus.online),
            device_timestamp=kwargs.get("device_timestamp")
        )
        db.add(record)
       
        # Update asset's last known location
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if asset:
            asset.last_latitude = latitude
            asset.last_longitude = longitude
            asset.last_location_update = datetime.utcnow()
       
        db.commit()
        db.refresh(record)
        return record
   
    @staticmethod
    def get_tracking_records(db: Session, asset_id: Optional[int] = None,
                           skip: int = 0, limit: int = 100) -> List[TrackingRecord]:
        """Get tracking records"""
        query = db.query(TrackingRecord)
       
        if asset_id:
            query = query.filter(TrackingRecord.asset_id == asset_id)
       
        return query.order_by(TrackingRecord.server_timestamp.desc()).offset(skip).limit(limit).all()
   
    @staticmethod
    def get_latest_location(db: Session, asset_id: int) -> Optional[TrackingRecord]:
        """Get latest location for an asset"""
        return db.query(TrackingRecord).filter(
            TrackingRecord.asset_id == asset_id
        ).order_by(TrackingRecord.server_timestamp.desc()).first()
   
    @staticmethod
    def get_all_latest_locations(db: Session, organisation_id: Optional[int] = None) -> List[TrackingRecord]:
        """Get latest location for all assets"""
        # Get latest record for each asset
        from sqlalchemy import func
       
        subquery = db.query(
            TrackingRecord.asset_id,
            func.max(TrackingRecord.server_timestamp).label('max_timestamp')
        ).group_by(TrackingRecord.asset_id).subquery()
       
        query = db.query(TrackingRecord).join(
            subquery,
            TrackingRecord.asset_id == subquery.c.asset_id
        )
       
        if organisation_id:
            query = query.join(Asset).filter(Asset.organisation_id == organisation_id)
       
        return query.all()
   
    @staticmethod
    def get_tracking_history(db: Session, asset_id: int,
                           start_time: datetime = None,
                           end_time: datetime = None) -> List[TrackingRecord]:
        """Get tracking history for an asset"""
        query = db.query(TrackingRecord).filter(TrackingRecord.asset_id == asset_id)
       
        if start_time:
            query = query.filter(TrackingRecord.server_timestamp >= start_time)
        if end_time:
            query = query.filter(TrackingRecord.server_timestamp <= end_time)
       
        return query.order_by(TrackingRecord.server_timestamp.asc()).all()
 
 
# Singleton
tracking_service = TrackingService()
 
 
 