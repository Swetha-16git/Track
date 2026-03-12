"""
Permissions and Role-Based Access Control
"""
from typing import List, Optional
from functools import wraps
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
 
from app.security.jwt_handler import verify_token
from app.config.constants import ROLE_ADMIN, ROLE_MANAGER, ROLE_VIEWER
 
logger = logging.getLogger(__name__)
 
# Security scheme
security = HTTPBearer()
 
 
class PermissionChecker:
    """Check user permissions based on roles"""
   
    # Role hierarchy - higher roles have access to lower role permissions
    ROLE_HIERARCHY = {
        ROLE_ADMIN: [ROLE_ADMIN, ROLE_MANAGER, ROLE_VIEWER],
        ROLE_MANAGER: [ROLE_MANAGER, ROLE_VIEWER],
        ROLE_VIEWER: [ROLE_VIEWER],
    }
   
    @staticmethod
    def has_role(user_role: str, required_role: str) -> bool:
        """Check if user has the required role"""
        allowed_roles = PermissionChecker.ROLE_HIERARCHY.get(required_role, [])
        return user_role in allowed_roles
   
    @staticmethod
    def has_permission(user_role: str, permission: str) -> bool:
        """Check if user role has specific permission"""
        # Define role-based permissions
        role_permissions = {
            ROLE_ADMIN: [
                "users:read", "users:write", "users:delete",
                "assets:read", "assets:write", "assets:delete",
                "tracking:read", "tracking:write",
                "roles:read", "roles:write",
                "organisations:read", "organisations:write",
                "settings:read", "settings:write"
            ],
            ROLE_MANAGER: [
                "users:read", "assets:read", "assets:write",
                "tracking:read", "tracking:write",
                "roles:read"
            ],
            ROLE_VIEWER: [
                "assets:read",
                "tracking:read"
            ]
        }
       
        return permission in role_permissions.get(user_role, [])
 
 
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
   
    payload = verify_token(token, "access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
   
    return payload
 
 
async def get_current_active_user(payload: dict = Depends(get_current_user)):
    """Get current active user"""
    if not payload.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    return payload
 
 
def require_roles(allowed_roles: List[str]):
    """Dependency to require specific roles"""
    def role_checker(payload: dict = Depends(get_current_user)):
        user_role = payload.get("role", "")
       
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
       
        return payload
   
    return role_checker
 
 
def require_permissions(required_permissions: List[str]):
    """Dependency to require specific permissions"""
    def permission_checker(payload: dict = Depends(get_current_user)):
        user_role = payload.get("role", "")
       
        # Admin has all permissions
        if user_role == ROLE_ADMIN:
            return payload
       
        # Check each permission
        for permission in required_permissions:
            if not PermissionChecker.has_permission(user_role, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required permission: {permission}"
                )
       
        return payload
   
    return permission_checker
 
 
# Pre-defined role dependencies
require_admin = require_roles([ROLE_ADMIN])
require_manager = require_roles([ROLE_ADMIN, ROLE_MANAGER])
require_user = require_roles([ROLE_ADMIN, ROLE_MANAGER, ROLE_VIEWER])
 
# Pre-defined permission dependencies
require_assets_read = require_permissions(["assets:read"])
require_assets_write = require_permissions(["assets:write"])
require_tracking_read = require_permissions(["tracking:read"])
require_tracking_write = require_permissions(["tracking:write"])
 
 
 
 