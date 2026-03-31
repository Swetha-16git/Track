"""
Asset Database Operations (AssetType + Asset)
"""
 
import logging
from typing import Tuple, Optional, List, Dict, Any
 
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
 
from app.models.asset_type_model import AssetType
from app.models.asset_model import Asset  # (keep for future asset CRUD)
 
logger = logging.getLogger(__name__)
 
 
# -----------------------
# Asset Type CRUD
# -----------------------
 
def get_all_asset_types(db: Session, skip: int = 0, limit: int = 100) -> List[AssetType]:
    return db.query(AssetType).offset(skip).limit(limit).all()
 
 
def get_asset_type_by_id(db: Session, asset_type_key: int) -> Optional[AssetType]:
    return db.query(AssetType).filter(AssetType.Asset_Type_Key == asset_type_key).first()
 
 
def create_asset_type(db: Session, asset_type_data: Dict[str, Any]) -> Tuple[bool, Optional[AssetType]]:
    try:
        asset_type = AssetType(**asset_type_data)
        db.add(asset_type)
        db.commit()
        db.refresh(asset_type)
        return True, asset_type
    except IntegrityError:
        db.rollback()
        return False, None
    except Exception:
        db.rollback()
        logger.exception("Error creating AssetType")
        return False, None
 
 
def update_asset_type(db: Session, asset_type_key: int, asset_type_data: Dict[str, Any]) -> Tuple[bool, Optional[AssetType]]:
    asset_type = get_asset_type_by_id(db, asset_type_key)
    if not asset_type:
        return False, None
 
    for field, value in asset_type_data.items():
        setattr(asset_type, field, value)
 
    try:
        db.commit()
        db.refresh(asset_type)
        return True, asset_type
    except IntegrityError:
        db.rollback()
        return False, None
    except Exception:
        db.rollback()
        logger.exception("Error updating AssetType")
        return False, None
 
 
def delete_asset_type(db: Session, asset_type_key: int) -> Tuple[bool, bool]:
    asset_type = get_asset_type_by_id(db, asset_type_key)
    if not asset_type:
        return False, False
 
    try:
        db.delete(asset_type)
        db.commit()
        return True, True
    except Exception:
        db.rollback()
        logger.exception("Error deleting AssetType")
        return False, False
 
 
# -----------------------
# Asset CRUD (optional later)
# -----------------------
# You can add Asset CRUD here later using the same style.
 
 