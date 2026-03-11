"""
Role Service
"""
from typing import List, Optional, Dict
import logging
 
from app.config.constants import ROLE_ADMIN, ROLE_MANAGER, ROLE_VIEWER
 
logger = logging.getLogger(__name__)
 
 
class RoleService:
    """Role management service"""
   
    # Role definitions with permissions
    ROLES = {
        ROLE_ADMIN: {
            "name": "Administrator",
            "description": "Full system access",
            "permissions": [
                "users:read", "users:write", "users:delete",
                "assets:read", "assets:write", "assets:delete",
                "tracking:read", "tracking:write",
                "roles:read", "roles:write",
                "organisations:read", "organisations:write",
                "settings:read", "settings:write"
            ]
        },
        ROLE_MANAGER: {
            "name": "Manager",
            "description": "Manage users and assets",
            "permissions": [
                "users:read", "assets:read", "assets:write",
                "tracking:read", "tracking:write",
                "roles:read"
            ]
        },
        ROLE_VIEWER: {
            "name": "Viewer",
            "description": "Read-only access",
            "permissions": [
                "assets:read",
                "tracking:read"
            ]
        }
    }
   
    @staticmethod
    def get_all_roles() -> List[Dict]:
        """Get all available roles"""
        return [
            {"id": role_id, **role_data}
            for role_id, role_data in RoleService.ROLES.items()
        ]
   
    @staticmethod
    def get_role(role_id: str) -> Optional[Dict]:
        """Get role by ID"""
        return RoleService.ROLES.get(role_id)
   
    @staticmethod
    def has_permission(role: str, permission: str) -> bool:
        """Check if role has specific permission"""
        role_data = RoleService.ROLES.get(role)
        if not role_data:
            return False
        return permission in role_data.get("permissions", [])
   
    @staticmethod
    def get_permissions(role: str) -> List[str]:
        """Get all permissions for a role"""
        role_data = RoleService.ROLES.get(role)
        if not role_data:
            return []
        return role_data.get("permissions", [])
 
 
# Singleton
role_service = RoleService()
 