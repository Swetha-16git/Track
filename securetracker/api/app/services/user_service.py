"""
User Service (FIXED)
"""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime
import logging
 
from app.models.user_model import User
from app.security.jwt_handler import get_password_hash
from app.config.constants import MSG_USER_CREATED, MSG_USER_UPDATED, MSG_USER_DELETED
from app.services.auth_service import _set_role_safely
 
logger = logging.getLogger(__name__)
 
 
class UserService:
    """User management service"""
 
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()
 
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100, organisation_id: Optional[int] = None):
        query = db.query(User)
        if organisation_id:
            query = query.filter(User.organisation_id == organisation_id)
        return query.offset(skip).limit(limit).all()
 
    @staticmethod
    def create_user(db: Session, user_data: dict) -> Tuple[bool, dict]:
        existing = db.query(User).filter(
            (User.username == user_data.get("username")) |
            (User.email == user_data.get("email"))
        ).first()
 
        if existing:
            return False, {"message": "User already exists"}
 
        try:
            if "password" in user_data:
                user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
 
            user = User(**user_data)
            db.add(user)
            db.commit()
            db.refresh(user)
 
            return True, {"success": True, "message": MSG_USER_CREATED, "user": user}
 
        except Exception:
            db.rollback()
            logger.exception("Create user failed")
            raise
 
    @staticmethod
    def update_user(db: Session, user_id: int, user_data: dict) -> Tuple[bool, dict]:
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return False, {"message": "User not found"}
 
        try:
            # ✅ Safe field updates
            if "email" in user_data:
                user.email = user_data["email"]
 
            if "username" in user_data:
                user.username = user_data["username"]
 
            if "password" in user_data:
                user.hashed_password = get_password_hash(user_data["password"])
 
            if "role" in user_data:
                _set_role_safely(user, user_data["role"])
 
            if "organisation_id" in user_data:
                user.organisation_id = user_data["organisation_id"]
 
            if "is_active" in user_data:
                user.is_active = user_data["is_active"]
 
            user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(user)
 
            return True, {"success": True, "message": MSG_USER_UPDATED, "user": user}
 
        except Exception:
            db.rollback()
            logger.exception("Update user failed")
            raise
 
    @staticmethod
    def delete_user(db: Session, user_id: int) -> Tuple[bool, dict]:
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return False, {"message": "User not found"}
 
        db.delete(user)
        db.commit()
        return True, {"success": True, "message": MSG_USER_DELETED}
 
 
user_service = UserService()
 