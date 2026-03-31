"""
OEM Database Operations (SQLAlchemy ORM)
"""
 
import logging
from typing import Tuple, Optional, List, Dict, Any
 
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
 
from app.models.oem_model import OEM
 
logger = logging.getLogger(__name__)
 
 
def get_all_oems(db: Session, skip: int = 0, limit: int = 100) -> List[OEM]:
    return db.query(OEM).offset(skip).limit(limit).all()
 
 
def get_oem_by_id(db: Session, oem_key: int) -> Optional[OEM]:
    return db.query(OEM).filter(OEM.OEM_Key == oem_key).first()
 
 
def create_oem(db: Session, oem_data: Dict[str, Any]) -> Tuple[bool, Optional[OEM]]:
    try:
        oem = OEM(**oem_data)
        db.add(oem)
        db.commit()
        db.refresh(oem)
        return True, oem
    except IntegrityError:
        db.rollback()
        return False, None
    except Exception:
        db.rollback()
        logger.exception("Error creating OEM")
        return False, None
 
 
def update_oem(db: Session, oem_key: int, oem_data: Dict[str, Any]) -> Tuple[bool, Optional[OEM]]:
    oem = get_oem_by_id(db, oem_key)
    if not oem:
        return False, None
 
    for field, value in oem_data.items():
        setattr(oem, field, value)
 
    try:
        db.commit()
        db.refresh(oem)
        return True, oem
    except IntegrityError:
        db.rollback()
        return False, None
    except Exception:
        db.rollback()
        logger.exception("Error updating OEM")
        return False, None
 
 
def delete_oem(db: Session, oem_key: int) -> Tuple[bool, bool]:
    oem = get_oem_by_id(db, oem_key)
    if not oem:
        return False, False
 
    try:
        db.delete(oem)
        db.commit()
        return True, True
    except Exception:
        db.rollback()
        logger.exception("Error deleting OEM")
        return False, False
 