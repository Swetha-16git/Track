"""
Permissions and Role-Based Access Control
"""
from typing import List
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

from app.security.jwt_handler import verify_token
from app.config.constants import ROLE_ADMIN, ROLE_VIEWER

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

# Optional service role for console / IoT apps
ROLE_SERVICE = "service"


class PermissionChecker:
    """
    Check user permissions based on roles and optional permission claims
    """

    ROLE_HIERARCHY = {
        ROLE_ADMIN: [ROLE_ADMIN, ROLE_VIEWER, ROLE_SERVICE],
        ROLE_VIEWER: [ROLE_VIEWER],
        ROLE_SERVICE: [ROLE_SERVICE]
    }

    ROLE_PERMISSIONS = {
        ROLE_ADMIN: [
            "users:read", "users:write", "users:delete",
            "assets:read", "assets:write", "assets:delete",
            "tracking:read", "tracking:write",
            "roles:read", "roles:write",
            "organisations:read", "organisations:write",
            "settings:read", "settings:write"
        ],
        ROLE_VIEWER: [
            "assets:read",
            "tracking:read"
        ],
        ROLE_SERVICE: [
            "tracking:write",
            "tracking:read"
        ]
    }

    @staticmethod
    def has_permission(user_role: str, permission: str) -> bool:
        return permission in PermissionChecker.ROLE_PERMISSIONS.get(user_role, [])


# ------------------------------------------------------------------
# AUTH HELPERS
# ------------------------------------------------------------------

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = verify_token(token, "access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not payload.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    if "role" not in payload:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role missing in token"
        )

    return payload


# ------------------------------------------------------------------
# ROLE CHECK
# ------------------------------------------------------------------

def require_roles(allowed_roles: List[str]):
    def role_checker(payload: dict = Depends(get_current_user)):
        user_role = payload.get("role")

        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return payload

    return role_checker


# ------------------------------------------------------------------
# PERMISSION CHECK
# ------------------------------------------------------------------

def require_permissions(required_permissions: List[str]):
    def permission_checker(payload: dict = Depends(get_current_user)):
        user_role = payload.get("role")

        # ✅ Admin bypass
        if user_role == ROLE_ADMIN:
            return payload

        # ✅ Explicit permission check
        for permission in required_permissions:
            if not PermissionChecker.has_permission(user_role, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required permission: {permission}"
                )

        return payload

    return permission_checker


# ------------------------------------------------------------------
# PRE-DEFINED DEPENDENCIES
# ------------------------------------------------------------------

require_admin = require_roles([ROLE_ADMIN])
require_user = require_roles([ROLE_ADMIN, ROLE_VIEWER])

require_assets_read = require_permissions(["assets:read"])
require_assets_write = require_permissions(["assets:write"])

require_tracking_read = require_permissions(["tracking:read"])
require_tracking_write = require_permissions(["tracking:write"])