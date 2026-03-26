"""
OEM Database Operations
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database.db_connection import Base
from app.models.oem_model import OEM

def get_all_oems(db: Session, skip: int = 0, limit: int = 100):
    """Get all OEMs"""
    return db.query(OEM).offset(skip).limit(limit).all()

def get_oem_by_id(db: Session, oem_key: int):
    """Get OEM by ID"""
    return db.query(OEM).filter(OEM.OEM_Key == oem_key).first()

def create_oem(db: Session, oem_data: dict):
    """Create new OEM"""
    try:
        oem = OEM(**oem_data)
        db.add(oem)
        db.commit()
        db.refresh(oem)
        return True, oem
    except IntegrityError:
        db.rollback()
        return False, None
    except Exception as e:
        db.rollback()
        return False, None

def update_oem(db: Session, oem_key: int, oem_data: dict):
    """Update OEM"""
    oem = db.query(OEM).filter(OEM.OEM_Key == oem_key).first()
    if not oem:
        return False, None
    
    for field, value in oem_data.items():
        setattr(oem, field, value)
    
    db.commit()
    db.refresh(oem)
    return True, oem

def delete_oem(db: Session, oem_key: int):
    """Delete OEM"""
    oem = db.query(OEM).filter(OEM.OEM_Key == oem_key).first()
    if not oem:
        return False, None
    
    db.delete(oem)
    db.commit()
    return True, True


