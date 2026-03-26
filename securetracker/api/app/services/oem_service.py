"""
OEM Service
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database.oem_db import (
    get_all_oems, 
    get_oem_by_id, 
    create_oem, 
    update_oem, 
    delete_oem
)

class OEMService:
    def get_oems(self, db: Session, skip: int = 0, limit: int = 100):
        """Get all OEMs"""
        return get_all_oems(db, skip, limit)

    def get_oem(self, db: Session, oem_key: int):
        """Get OEM by ID"""
        return get_oem_by_id(db, oem_key)

    def create_oem(self, db: Session, oem_data: dict, current_user: dict = None):
        """Create new OEM"""
        try:
            # Validate required field
            if not oem_data.get('OEM_Provider'):
                return False, {"message": "OEM_Provider is required"}
            
            success, result = create_oem(db, oem_data)
            if not success:
                return False, {"message": "Failed to create OEM - duplicate OEM_Provider"}
            
            return True, {
                "success": True,
                "oem": {
                    "OEM_Key": result.OEM_Key,
                    "OEM_Provider": result.OEM_Provider,
                    "OEM_ProviderName": result.OEM_ProviderName,
                },
                "message": "OEM created successfully"
            }
        except Exception as e:
            db.rollback()
            return False, {"message": str(e)}

    def update_oem(self, db: Session, oem_key: int, oem_data: dict):
        """Update OEM"""
        success, result = update_oem(db, oem_key, oem_data)
        if not success:
            return False, {"message": "OEM not found"}
        
        return True, {
            "success": True,
            "oem": {
                "OEM_Key": result.OEM_Key,
                "OEM_Provider": result.OEM_Provider,
                "OEM_ProviderName": result.OEM_ProviderName,
            },
            "message": "OEM updated successfully"
        }

    def delete_oem(self, db: Session, oem_key: int):
        """Delete OEM"""
        success, result = delete_oem(db, oem_key)
        if not success:
            return False, {"message": "OEM not found"}
        
        return True, {"success": True, "message": "OEM deleted successfully"}

# Singleton instance
oem_service = OEMService()

