"""
Asset Type Service
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database.asset_db import (
    get_all_asset_types, 
    get_asset_type_by_id, 
    create_asset_type, 
    update_asset_type, 
    delete_asset_type
)
from app.database.db_connection import get_db

class AssetTypeService:
    def get_asset_types(self, db: Session, skip: int = 0, limit: int = 100):
        """Get all asset types"""
        return get_all_asset_types(db, skip, limit)

    def get_asset_type(self, db: Session, asset_type_key: int):
        """Get asset type by ID"""
        return get_asset_type_by_id(db, asset_type_key)

    def create_asset_type(self, db: Session, asset_type_data: dict, current_user: dict = None):
        """Create new asset type"""
        try:
            # Basic validation
            if not asset_type_data.get('Asset_Type'):
                return False, {"message": "Asset_Type is required"}
            
            success, result = create_asset_type(db, asset_type_data)
            if not success:
                return False, {"message": "Failed to create asset type - duplicate key or constraint violation"}
            
            return True, {
                "success": True,
                "asset_type": {
                    "Asset_Type_Key": result.Asset_Type_Key,
                    "Asset_Type": result.Asset_Type,
                    "Asset_Code": result.Asset_Code,
                    "ShortCode": result.ShortCode,
                },
                "message": "Asset type created successfully"
            }
        except Exception as e:
            db.rollback()
            return False, {"message": str(e)}

    def update_asset_type(self, db: Session, asset_type_key: int, asset_type_data: dict):
        """Update asset type"""
        success, result = update_asset_type(db, asset_type_key, asset_type_data)
        if not success:
            return False, {"message": "Asset type not found"}
        
        return True, {
            "success": True,
            "asset_type": {
                "Asset_Type_Key": result.Asset_Type_Key,
                "Asset_Type": result.Asset_Type,
                "Asset_Code": result.Asset_Code,
                "ShortCode": result.ShortCode,
            },
            "message": "Asset type updated successfully"
        }

    def delete_asset_type(self, db: Session, asset_type_key: int):
        """Delete asset type"""
        success, result = delete_asset_type(db, asset_type_key)
        if not success:
            return False, {"message": "Asset type not found"}
        
        return True, {"success": True, "message": "Asset type deleted successfully"}

# Singleton instance
asset_type_service = AssetTypeService()

