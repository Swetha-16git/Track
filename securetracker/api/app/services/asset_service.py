"""
Asset Service (CORRECTED)
"""
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, DataError, ProgrammingError
from datetime import datetime
import uuid
import logging
 
from app.models.asset_model import Asset, TrackingDevice
from app.models.user_model import User
from app.config.constants import MSG_ASSET_CREATED, MSG_ASSET_UPDATED, MSG_ASSET_DELETED
 
logger = logging.getLogger(__name__)
 
 
class AssetService:
    """Asset management service"""
 
    # -------------------------
    # Helpers
    # -------------------------
    @staticmethod
    def generate_asset_id() -> str:
        return f"AST-{uuid.uuid4().hex[:8].upper()}"
 
    @staticmethod
    def get_asset_by_id(db: Session, asset_id: int) -> Optional[Asset]:
        return db.query(Asset).filter(Asset.id == asset_id).first()
 
    @staticmethod
    def get_asset_by_asset_id(db: Session, asset_id: str) -> Optional[Asset]:
        return db.query(Asset).filter(Asset.asset_id == asset_id).first()
 
    @staticmethod
    def get_assets(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        organisation_id: Optional[int] = None,
        status: Optional[str] = None
    ) -> List[Asset]:
        query = db.query(Asset)
 
        if organisation_id:
            query = query.filter(Asset.organisation_id == organisation_id)
 
        if status:
            query = query.filter(Asset.status == status)
 
        return query.offset(skip).limit(limit).all()
 
    # -------------------------
    # ✅ KEY FIX: normalize payload keys
    # -------------------------
    @staticmethod
    def _normalize_asset_payload(asset_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Accepts old keys from Swagger/UI and maps them to Asset model keys.
        Prevents: TypeError invalid keyword argument for Asset
        """
        data = dict(asset_data or {})
 
        mapping = {
            "asset_name": "name",
            "asset_description": "description",
            "manufacturer": "make",
            "registration_number": "license_plate",
            "serial_number": "vin",
            "asset_code": "asset_id",
        }
 
        normalized: Dict[str, Any] = {}
        for k, v in data.items():
            normalized[mapping.get(k, k)] = v
 
        # never allow these from client
        normalized.pop("password", None)
        normalized.pop("organisation_id", None)  # should come from token/db
        normalized.pop("owner_id", None)         # should come from token
 
        return normalized
 
    @staticmethod
    def _set_attr_safely(obj: Any, key: str, value: Any) -> None:
        """
        Sets attribute only if it exists on model.
        If the field is Enum in DB/model, tries to cast using Enum class.
        """
        if value is None:
            return
        if not hasattr(obj, key):
            return
 
        current = getattr(obj, key)
 
        try:
            # if current looks like an Enum value
            if hasattr(current, "value") and current.__class__:
                enum_cls = current.__class__
                setattr(obj, key, enum_cls(value))
                return
        except Exception:
            pass
 
        setattr(obj, key, value)
 
    @staticmethod
    def _set_default_if_column_exists(data: Dict[str, Any], field: str, value: Any) -> None:
        """
        Only set defaults for fields that exist in the Asset model.
        """
        if field in data:
            return
        if hasattr(Asset, field):
            data[field] = value
 
    # -------------------------
    # ✅ FIXED: create_asset INSIDE class + safe defaults + safe org/owner
    # -------------------------
    @staticmethod
    def create_asset(db: Session, asset_data: dict, current_user: dict) -> Tuple[bool, dict]:
        """
        Create new asset
        - Normalizes payload keys
        - Sets organisation_id, owner_id from current_user
        - Adds safe defaults (only if model columns exist)
        - Returns DB error clearly instead of crashing
        """
        try:
            data = AssetService._normalize_asset_payload(asset_data)
 
            # required IDs
            data["asset_id"] = data.get("asset_id") or AssetService.generate_asset_id()
 
            # org + owner from token
            org_id = current_user.get("organisation_id")
            user_id = current_user.get("sub")
 
            if user_id is None:
                return False, {"success": False, "message": "Missing user id in token (sub)."}
 
            user_id = int(user_id)
 
            # If organisation_id missing in token, fallback to DB user lookup
            if not org_id:
                user = db.query(User).filter(User.id == user_id).first()
                if not user or not getattr(user, "organisation_id", None):
                    return False, {"success": False, "message": "User organisation_id missing. Set organisation_id for this user in DB."}
                org_id = user.organisation_id
 
            data["organisation_id"] = org_id
            data["owner_id"] = user_id
 
            # safe defaults (only if those columns exist)
            AssetService._set_default_if_column_exists(data, "status", "active")
            AssetService._set_default_if_column_exists(data, "asset_type", "vehicle")
            AssetService._set_default_if_column_exists(data, "description", "")
            AssetService._set_default_if_column_exists(data, "year", 2026)
            AssetService._set_default_if_column_exists(data, "created_at", datetime.utcnow())
            AssetService._set_default_if_column_exists(data, "updated_at", datetime.utcnow())
 
            asset = Asset(**data)
            db.add(asset)
            db.commit()
            db.refresh(asset)
 
            return True, {"success": True, "message": MSG_ASSET_CREATED, "asset": asset}
 
        except IntegrityError as e:
            db.rollback()
            logger.exception("Asset create IntegrityError")
            return False, {"success": False, "message": f"DB IntegrityError: {str(e.orig)}"}
 
        except (DataError, ProgrammingError) as e:
            db.rollback()
            logger.exception("Asset create DB error")
            # e.orig exists for many DB drivers; fallback to str(e)
            msg = str(getattr(e, "orig", e))
            return False, {"success": False, "message": f"DB Error: {msg}"}
 
        except Exception as e:
            db.rollback()
            logger.exception("Asset create failed")
            return False, {"success": False, "message": f"Unexpected error: {str(e)}"}
 
    # -------------------------
    # Update / Delete / Location
    # -------------------------
    @staticmethod
    def update_asset(db: Session, asset_id: int, asset_data: dict) -> Tuple[bool, dict]:
        asset = AssetService.get_asset_by_id(db, asset_id)
        if not asset:
            return False, {"success": False, "message": "Asset not found"}
 
        try:
            data = AssetService._normalize_asset_payload(asset_data)
 
            for key, value in data.items():
                AssetService._set_attr_safely(asset, key, value)
 
            if hasattr(asset, "updated_at"):
                asset.updated_at = datetime.utcnow()
 
            db.commit()
            db.refresh(asset)
 
            return True, {"success": True, "message": MSG_ASSET_UPDATED, "asset": asset}
 
        except Exception as e:
            db.rollback()
            logger.exception("Update asset failed")
            return False, {"success": False, "message": f"Asset update failed: {str(e)}"}
 
    @staticmethod
    def delete_asset(db: Session, asset_id: int) -> Tuple[bool, dict]:
        asset = AssetService.get_asset_by_id(db, asset_id)
        if not asset:
            return False, {"success": False, "message": "Asset not found"}
 
        try:
            db.delete(asset)
            db.commit()
            return True, {"success": True, "message": MSG_ASSET_DELETED}
        except Exception as e:
            db.rollback()
            logger.exception("Delete asset failed")
            return False, {"success": False, "message": f"Asset delete failed: {str(e)}"}
 
    @staticmethod
    def update_asset_location(db: Session, asset_id: int, latitude: float, longitude: float) -> Tuple[bool, dict]:
        asset = AssetService.get_asset_by_id(db, asset_id)
        if not asset:
            return False, {"success": False, "message": "Asset not found"}
 
        try:
            if hasattr(asset, "last_latitude"):
                asset.last_latitude = latitude
            if hasattr(asset, "last_longitude"):
                asset.last_longitude = longitude
            if hasattr(asset, "last_location_update"):
                asset.last_location_update = datetime.utcnow()
 
            db.commit()
            return True, {"success": True, "message": "Location updated"}
        except Exception as e:
            db.rollback()
            logger.exception("Update asset location failed")
            return False, {"success": False, "message": f"Location update failed: {str(e)}"}
 
 
asset_service = AssetService()
 