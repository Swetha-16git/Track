"""
User Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging
 
from app.database.db_connection import get_db
from app.services.user_service import user_service
from app.security.permissions import get_current_user, require_admin
from app.models.user_model import User
 
logger = logging.getLogger(__name__)
 
router = APIRouter()
 
 
@router.get("/")
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get list of users"""
    organisation_id = current_user.get("organisation_id")
    users = user_service.get_users(db, skip, limit, organisation_id)
    return {
        "success": True,
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role.value if hasattr(u.role, 'value') else u.role,
                "organisation_id": u.organisation_id,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None
            }
            for u in users
        ]
    }
 
 
@router.get("/{user_id}")
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get user by ID"""
    user = user_service.get_user_by_id(db, user_id)
   
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
   
    return {
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role.value if hasattr(user.role, 'value') else user.role,
            "organisation_id": user.organisation_id,
            "mfa_enabled": user.mfa_enabled,
            "mfa_method": user.mfa_method,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None
        }
    }
 
 
@router.post("/")
async def create_user(
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Create new user (admin only)"""
    success, response = user_service.create_user(db, user_data)
   
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message")
        )
   
    return response
 
 
@router.put("/{user_id}")
async def update_user(
    user_id: int,
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # ✅ Admin OR same user
    if current_user.get("role") != "admin" and int(current_user.get("sub")) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
 
    success, response = user_service.update_user(db, user_id, user_data)
 
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message")
        )
 
    return response
 
@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Delete user (admin only)"""
    success, response = user_service.delete_user(db, user_id)
   
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message")
        )
   
    return response
 
 
 