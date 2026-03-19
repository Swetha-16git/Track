"""
Tracking Service
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from datetime import datetime
import logging

from app.models.tracking_model import TrackingRecord, TrackingAlert, TrackingStatus
from app.models.asset_model import Asset

logger = logging.getLogger(__name__)


class TrackingService:
    """Tracking service for real-time location data"""

    @staticmethod
    def create_tracking_record(
        db: Session,
        asset_id: int,
        user_id: int,
        latitude: float,
        longitude: float,
        **kwargs
    ) -> TrackingRecord:
        """Create new tracking record"""

        # ✅ 1) Validate asset exists (avoid FK crash + clearer error)
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            # Don't commit anything; fail early
            raise ValueError(f"Asset not found for asset_id={asset_id}")

        # ✅ 2) Normalize status value (Enum-safe)
        default_status = (
            TrackingStatus.online.value
            if hasattr(TrackingStatus.online, "value")
            else "online"
        )
        status_value = kwargs.get("status", default_status)

        # ✅ 3) Build record
        record = TrackingRecord(
            asset_id=asset_id,
            user_id=user_id,
            latitude=latitude,
            longitude=longitude,
            altitude=kwargs.get("altitude"),
            speed=kwargs.get("speed"),
            heading=kwargs.get("heading"),
            accuracy=kwargs.get("accuracy"),
            status=status_value,
            device_timestamp=kwargs.get("device_timestamp") or datetime.utcnow(),
            # raw_data is optional; only set if your model supports it
            raw_data=kwargs.get("raw_data") if "raw_data" in TrackingRecord.__table__.columns else None
        )

        db.add(record)

        # ✅ 4) Update asset's last known location (reuse already fetched asset)
        asset.last_latitude = latitude
        asset.last_longitude = longitude
        asset.last_location_update = datetime.utcnow()

        # ✅ 5) Commit safely with rollback
        try:
            db.commit()
            db.refresh(record)
            return record

        except IntegrityError as e:
            db.rollback()
            logger.exception(
                "IntegrityError while inserting tracking record "
                f"(asset_id={asset_id}, user_id={user_id})."
            )
            # Raise a clean error; router can convert to HTTP 400 if desired
            raise ValueError(f"Database integrity error: {str(e.orig)}") from e

        except SQLAlchemyError as e:
            db.rollback()
            logger.exception(
                "SQLAlchemyError while inserting tracking record "
                f"(asset_id={asset_id}, user_id={user_id})."
            )
            raise RuntimeError("Database error occurred while saving tracking record") from e

    @staticmethod
    def get_tracking_records(
        db: Session,
        asset_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[TrackingRecord]:
        """Get tracking records"""
        query = db.query(TrackingRecord)

        if asset_id:
            query = query.filter(TrackingRecord.asset_id == asset_id)

        return (
            query
            .order_by(TrackingRecord.server_timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_latest_location(
        db: Session,
        asset_id: int
    ) -> Optional[TrackingRecord]:
        """Get latest location for an asset"""
        return (
            db.query(TrackingRecord)
            .filter(TrackingRecord.asset_id == asset_id)
            .order_by(TrackingRecord.server_timestamp.desc())
            .first()
        )

    @staticmethod
    def get_all_latest_locations(
        db: Session,
        organisation_id: Optional[int] = None
    ) -> List[TrackingRecord]:
        """Get latest location for all assets"""
        from sqlalchemy import func

        subquery = (
            db.query(
                TrackingRecord.asset_id,
                func.max(TrackingRecord.server_timestamp).label("max_timestamp")
            )
            .group_by(TrackingRecord.asset_id)
            .subquery()
        )

        query = (
            db.query(TrackingRecord)
            .join(subquery, TrackingRecord.asset_id == subquery.c.asset_id)
        )

        if organisation_id:
            query = query.join(Asset).filter(
                Asset.organisation_id == organisation_id
            )

        return query.all()

    @staticmethod
    def get_tracking_history(
        db: Session,
        asset_id: int,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[TrackingRecord]:
        """Get tracking history for an asset"""
        query = db.query(TrackingRecord).filter(
            TrackingRecord.asset_id == asset_id
        )

        if start_time:
            query = query.filter(TrackingRecord.server_timestamp >= start_time)
        if end_time:
            query = query.filter(TrackingRecord.server_timestamp <= end_time)

        return query.order_by(TrackingRecord.server_timestamp.asc()).all()


# ✅ Singleton instance
tracking_service = TrackingService()