"""
Asset Database Operations
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database.db_connection import Base
from app.models.asset_type_model import AssetType
from app.models.asset_model import Asset

def get_all_asset_types(db: Session, skip: int = 0, limit: int = 100):
    """Get all asset types"""
    return db.query(AssetType).offset(skip).limit(limit).all()

def get_asset_type_by_id(db: Session, asset_type_key: int):
    """Get asset type by ID"""
    return db.query(AssetType).filter(AssetType.Asset_Type_Key == asset_type_key).first()

def create_asset_type(db: Session, asset_type_data: dict):
    """Create new asset type"""
    try:
        asset_type = AssetType(**asset_type_data)
        db.add(asset_type)
        db.commit()
        db.refresh(asset_type)
        return True, asset_type
    except IntegrityError:
        db.rollback()
        return False, None
    except Exception as e:
        db.rollback()
        return False, None

def update_asset_type(db: Session, asset_type_key: int, asset_type_data: dict):
    """Update asset type"""
    asset_type = db.query(AssetType).filter(AssetType.Asset_Type_Key == asset_type_key).first()
    if not asset_type:
        return False, None
    
    for field, value in asset_type_data.items():
        setattr(asset_type, field, value)
    
    db.commit()
    db.refresh(asset_type)
    return True, asset_type

def delete_asset_type(db: Session, asset_type_key: int):
    """Soft delete asset type"""
    asset_type = db.query(AssetType).filter(AssetType.Asset_Type_Key == asset_type_key).first()
    if not asset_type:
        return False, None
    
    db.delete(asset_type)
    db.commit()
    return True, True

# Existing asset functions can be added here later

