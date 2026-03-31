"""
User Service (FIXED - Enum Role Compatible)
"""
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime
import logging
 
from app.models.user_model import User, UserRole
from app.security.jwt_handler import get_password_hash
from app.config.constants import MSG_USER_CREATED, MSG_USER_UPDATED, MSG_USER_DELETED
 
 
logger = logging.getLogger(__name__)
 
 
def _parse_role(role_value) -> Optional[UserRole]:
    """
    Convert incoming role values safely to Enum.
    Accepts: "admin", "viewer", "ADMIN", "VIEWER", UserRole.admin, UserRole.viewer.
    Returns: UserRole or None if invalid/empty.
    """
    if role_value is None:
        return None
 
    # already enum
    if isinstance(role_value, UserRole):
        return role_value
 
    # string conversions
    s = str(role_value).strip()
    if not s:
        return None
 
    # allow both enum NAME (admin/viewer) and enum VALUE (ROLE_ADMIN/ROLE_VIEWER)
    s_lower = s.lower()
 
    if s_lower in ("admin", "role_admin"):
        return UserRole.admin
    if s_lower in ("viewer", "role_viewer"):
        return UserRole.viewer
 
    # also handle common DB/value formats like "ADMIN" / "VIEWER"
    if s.upper() == "ADMIN":
        return UserRole.admin
    if s.upper() == "VIEWER":
        return UserRole.viewer
 
    return None
 
 
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
            # ✅ Hash password if provided
            if "password" in user_data and user_data.get("password"):
                user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
 
            # ✅ Convert role to Enum if provided
            if "role" in user_data:
                parsed = _parse_role(user_data.get("role"))
                if parsed is not None:
                    user_data["role"] = parsed
                else:
                    # if invalid role passed, default to viewer
                    user_data["role"] = UserRole.viewer
 
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
            if "email" in user_data and user_data["email"] is not None:
                user.email = user_data["email"]
 
            if "username" in user_data and user_data["username"] is not None:
                user.username = user_data["username"]
 
            if "password" in user_data and user_data["password"]:
                user.hashed_password = get_password_hash(user_data["password"])
 
            # ✅ FIX: Role update using Enum
            if "role" in user_data:
                parsed = _parse_role(user_data.get("role"))
                if parsed is not None:
                    user.role = parsed
 
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
 