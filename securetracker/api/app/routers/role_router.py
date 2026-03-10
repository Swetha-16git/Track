"""
Role Router
"""
from fastapi import APIRouter, Depends
import logging

from app.services.role_service import role_service
from app.security.permissions import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
async def get_roles(current_user: dict = Depends(get_current_user)):
    """Get all available roles"""
    roles = role_service.get_all_roles()
    return {
        "success": True,
        "roles": roles
    }


@router.get("/{role_id}")
async def get_role(role_id: str, current_user: dict = Depends(get_current_user)):
    """Get role by ID"""
    role = role_service.get_role(role_id)
    
    if not role:
        return {
            "success": False,
            "message": "Role not found"
        }
    
    return {
        "success": True,
        "role": {
            "id": role_id,
            **role
        }
    }


@router.get("/{role_id}/permissions")
async def get_role_permissions(role_id: str, current_user: dict = Depends(get_current_user)):
    """Get permissions for a role"""
    permissions = role_service.get_permissions(role_id)
    
    return {
        "success": True,
        "role_id": role_id,
        "permissions": permissions
    }

