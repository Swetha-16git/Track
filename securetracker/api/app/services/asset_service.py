"""
Asset Service
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.asset_model import Asset, AssetType, AssetStatus


class AssetService:
    # -----------------------------
    # Helpers
    # -----------------------------
    def _digits_only(self, value) -> str:
        """Convert to string, trim, enforce digits-only"""
        if value is None:
            raise ValueError("asset_id is required")

        s = str(value).strip()
        if not s.isdigit():
            raise ValueError("asset_id must contain only numbers (digits)")
        return s

    def _make_name(self, asset_type: AssetType, asset_id: str) -> str:
        return f"{asset_type.value.replace('_', ' ').title()} {asset_id}"

    def _to_asset_type(self, value) -> AssetType:
        """Convert string -> AssetType enum"""
        if value is None:
            # default type
            return AssetType.excavator

        if isinstance(value, AssetType):
            return value

        s = str(value).strip()
        return AssetType(s)

    def _to_status(self, value) -> AssetStatus:
        """Convert string -> AssetStatus enum"""
        if value is None:
            return AssetStatus.active
        if isinstance(value, AssetStatus):
            return value
        s = str(value).strip()
        return AssetStatus(s)

    def _asset_to_dict(self, a: Asset) -> dict:
        return {
            "id": a.id,
            "asset_id": a.asset_id,
            "name": a.name,
            "description": a.description,
            "asset_type": a.asset_type.value if hasattr(a.asset_type, "value") else str(a.asset_type),
            "status": a.status.value if hasattr(a.status, "value") else str(a.status),
            "make": a.make,
            "model": a.model,
            "year": a.year,
            "license_plate": a.license_plate,
            "vin": a.vin,
            "color": a.color,
            "last_latitude": a.last_latitude,
            "last_longitude": a.last_longitude,
            "last_location_update": a.last_location_update.isoformat() if a.last_location_update else None,
            "organisation_id": a.organisation_id,
            "owner_id": a.owner_id,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None,
        }

    # -----------------------------
    # Read APIs
    # -----------------------------
    def get_assets(self, db: Session, skip: int, limit: int, organisation_id: int, status: str = None):
        query = db.query(Asset).filter(
            Asset.organisation_id == organisation_id,
            Asset.is_active == True
        )

        if status:
            # status is enum in DB; accept status string
            query = query.filter(Asset.status == AssetStatus(status))

        return query.offset(skip).limit(limit).all()

    def get_asset_by_id(self, db: Session, asset_pk: int):
        return db.query(Asset).filter(Asset.id == asset_pk, Asset.is_active == True).first()

    # -----------------------------
    # Create
    # -----------------------------
    def create_asset(self, db: Session, asset_data: dict, current_user: dict):
        try:
            # ✅ enforce numeric-only asset_id
            asset_id = self._digits_only(asset_data.get("asset_id"))

            # ✅ enums
            asset_type = self._to_asset_type(asset_data.get("asset_type"))
            status = self._to_status(asset_data.get("status"))

            # ✅ auto-generate name if missing/empty
            incoming_name = asset_data.get("name")
            name = incoming_name.strip() if isinstance(incoming_name, str) else incoming_name
            if not name:
                name = self._make_name(asset_type, asset_id)

            asset = Asset(
                asset_id=asset_id,
                name=name,
                description=asset_data.get("description"),
                asset_type=asset_type,
                status=status,
                make=asset_data.get("make"),
                model=asset_data.get("model"),
                year=asset_data.get("year"),
                license_plate=asset_data.get("license_plate"),
                vin=asset_data.get("vin"),
                color=asset_data.get("color"),
                last_latitude=asset_data.get("last_latitude"),
                last_longitude=asset_data.get("last_longitude"),
                last_location_update=datetime.utcnow() if asset_data.get("last_latitude") is not None and asset_data.get("last_longitude") is not None else None,
                organisation_id=current_user.get("organisation_id"),
                owner_id=current_user.get("id"),
            )

            db.add(asset)
            db.commit()
            db.refresh(asset)

            return True, {
                "success": True,
                "asset": self._asset_to_dict(asset),
                "message": "Asset created successfully"
            }

        except IntegrityError as e:
            db.rollback()
            return False, {"message": "Duplicate asset_id or license_plate already exists"}
        except ValueError as e:
            db.rollback()
            return False, {"message": str(e)}
        except Exception as e:
            db.rollback()
            return False, {"message": f"Unexpected error: {str(e)}"}

    # -----------------------------
    # Update
    # -----------------------------
    def update_asset(self, db: Session, asset_pk: int, asset_data: dict):
        try:
            asset = db.query(Asset).filter(Asset.id == asset_pk, Asset.is_active == True).first()
            if not asset:
                return False, {"message": "Asset not found"}

            # ✅ update asset_id only if provided (and must be digits)
            if "asset_id" in asset_data and asset_data.get("asset_id") is not None:
                asset.asset_id = self._digits_only(asset_data.get("asset_id"))

            # ✅ update type/status if provided
            if "asset_type" in asset_data and asset_data.get("asset_type") is not None:
                asset.asset_type = self._to_asset_type(asset_data.get("asset_type"))

            if "status" in asset_data and asset_data.get("status") is not None:
                asset.status = self._to_status(asset_data.get("status"))

            # ✅ normal fields
            for field in [
                "description", "make", "model", "year",
                "license_plate", "vin", "color", "notes"
            ]:
                if field in asset_data:
                    setattr(asset, field, asset_data.get(field))

            # ✅ location
            if "last_latitude" in asset_data:
                asset.last_latitude = asset_data.get("last_latitude")
            if "last_longitude" in asset_data:
                asset.last_longitude = asset_data.get("last_longitude")
            if ("last_latitude" in asset_data) or ("last_longitude" in asset_data):
                if asset.last_latitude is not None and asset.last_longitude is not None:
                    asset.last_location_update = datetime.utcnow()

            # ✅ AUTO-GENERATE name if not provided/empty
            incoming_name = asset_data.get("name")
            name = incoming_name.strip() if isinstance(incoming_name, str) else incoming_name
            if name:
                asset.name = name
            else:
                asset.name = self._make_name(asset.asset_type, asset.asset_id)

            db.commit()
            db.refresh(asset)

            return True, {
                "success": True,
                "asset": self._asset_to_dict(asset),
                "message": "Asset updated successfully"
            }

        except IntegrityError:
            db.rollback()
            return False, {"message": "Duplicate asset_id or license_plate already exists"}
        except ValueError as e:
            db.rollback()
            return False, {"message": str(e)}
        except Exception as e:
            db.rollback()
            return False, {"message": f"Unexpected error: {str(e)}"}

    # -----------------------------
    # Delete (soft delete)
    # -----------------------------
    def delete_asset(self, db: Session, asset_pk: int):
        try:
            asset = db.query(Asset).filter(Asset.id == asset_pk, Asset.is_active == True).first()
            if not asset:
                return False, {"message": "Asset not found"}

            asset.is_active = False
            db.commit()

            return True, {"success": True, "message": "Asset deleted successfully"}

        except Exception as e:
            db.rollback()
            return False, {"message": f"Unexpected error: {str(e)}"}

    # -----------------------------
    # Location update
    # -----------------------------
    def update_asset_location(self, db: Session, asset_pk: int, latitude: float, longitude: float):
        try:
            asset = db.query(Asset).filter(Asset.id == asset_pk, Asset.is_active == True).first()
            if not asset:
                return False, {"message": "Asset not found"}

            asset.last_latitude = latitude
            asset.last_longitude = longitude
            asset.last_location_update = datetime.utcnow()

            db.commit()
            db.refresh(asset)

            return True, {
                "success": True,
                "asset": self._asset_to_dict(asset),
                "message": "Location updated successfully"
            }

        except Exception as e:
            db.rollback()
            return False, {"message": f"Unexpected error: {str(e)}"}


# ✅ singleton like your imports expect
asset_service = AssetService()