"""
Authentication Service
"""
 
from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict, Any
import logging
import uuid
import re
import random
import hashlib
import os
 
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy.inspection import inspect as sa_inspect
 
from app.models.user_model import User, UserRole  # ✅ import UserRole
from app.models.organisation_model import Organisation
from app.models.auth_model import LoginRequest, SignupRequest, MFAMethod
from app.security.jwt_handler import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, create_mfa_token,
)
from app.security.mfa_handler import mfa_handler
from app.security.ad_auth import ad_authenticator
from app.config.constants import (
    MSG_LOGIN_SUCCESS, MSG_LOGIN_FAILED, MSG_MFA_REQUIRED,
    MSG_MFA_SUCCESS, MSG_MFA_FAILED, ROLE_VIEWER
)
from app.config.settings import settings
from app.database import user_db
from app.utils.email_utils import send_email
 
logger = logging.getLogger(__name__)
 
mfa_pending_logins: Dict[int, Dict[str, Any]] = {}
 
# ===========================
# ✅ Default Admin credentials
# ===========================
DEFAULT_ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@securetracker.com")
DEFAULT_ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@123!")
 
 
# ===========================
# ✅ Permissions builder
# ===========================
def _build_permissions(role_name: str) -> list:
    """
    role_name should be: 'admin' or 'viewer'
    """
    role_name = (role_name or "").lower()
 
    if role_name == "admin":
        return [
            "admin:access",
            "clients:provision",
            "clients:read",
            "assets:read",
            "assets:write",
            "tracking:read",
            "tracking:write",
            "roles:read",
            "roles:write",
        ]
 
    # viewer/customer
    return [
        "assets:read",
        "tracking:read"
    ]
 
 
def _slugify(text: str) -> str:
    text = (text or "").strip().lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text)
    return text or "org"
 
 
def _get_field(obj: Any, *names: str, default=None):
    for n in names:
        if hasattr(obj, n):
            v = getattr(obj, n)
            if v is not None and v != "":
                return v
    return default
 
 
def _model_has_attr(model_obj: Any, field_name: str) -> bool:
    try:
        mapper = sa_inspect(model_obj.__class__)
        return field_name in mapper.attrs
    except Exception:
        return hasattr(model_obj, field_name)
 
 
def _safe_set(model_obj: Any, field_name: str, value: Any) -> None:
    if value is None:
        return
    if _model_has_attr(model_obj, field_name):
        setattr(model_obj, field_name, value)
 
 
def _role_name(user: User) -> str:
    """
    Returns enum name => 'admin' or 'viewer'
    """
    try:
        if isinstance(user.role, UserRole):
            return user.role.name
        return str(user.role)  # fallback
    except Exception:
        return ""
 
 
def _role_display(user: User) -> str:
    """
    Returns enum value => ROLE_ADMIN/ROLE_VIEWER (often 'ADMIN'/'VIEWER')
    """
    try:
        if isinstance(user.role, UserRole):
            return user.role.value
        return str(user.role)
    except Exception:
        return ""
 
 
def _is_admin_user(user: User) -> bool:
    """
    Determines admin based on role OR fixed username/email.
    """
    if _role_name(user).lower() == "admin":
        return True
    if (getattr(user, "username", "") or "").lower() == DEFAULT_ADMIN_USERNAME.lower():
        return True
    if (getattr(user, "email", "") or "").lower() == DEFAULT_ADMIN_EMAIL.lower():
        return True
    return False
 
 
# -----------------------
# OTP helpers
# -----------------------
def _generate_otp(length: int = 6) -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(length))
 
 
def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode("utf-8")).hexdigest()
 
 
class AuthService:
    """Authentication service"""
 
    # ============================================
    # ✅ Ensure a default Admin user exists (no MFA)
    # ============================================
    @staticmethod
    def ensure_default_admin(db: Session) -> None:
        """
        Ensures a default admin user exists.
        ✅ role will be set using Enum: UserRole.admin
        ✅ MFA disabled for admin
        """
        try:
            admin = db.query(User).filter(
                (User.username == DEFAULT_ADMIN_USERNAME) |
                (User.email == DEFAULT_ADMIN_EMAIL)
            ).first()
 
            if admin:
                # enforce admin properties always
                if _is_admin_user(admin):
                    admin.role = UserRole.admin          # ✅ FIXED
                    admin.mfa_enabled = False            # ✅ NO MFA
                    admin.mfa_method = None
                    admin.is_active = True
                    db.commit()
                return
 
            # create admin if missing
            admin = User(
                username=DEFAULT_ADMIN_USERNAME,
                email=DEFAULT_ADMIN_EMAIL,
                hashed_password=get_password_hash(DEFAULT_ADMIN_PASSWORD),
            )
 
            admin.role = UserRole.admin                 # ✅ FIXED
            admin.mfa_enabled = False                   # ✅ NO MFA
            admin.mfa_method = None
            admin.is_active = True
            admin.is_verified = True
 
            db.add(admin)
            db.commit()
            db.refresh(admin)
 
            logger.info("✅ Default admin user ensured in DB")
 
        except Exception:
            db.rollback()
            logger.exception("Failed to ensure default admin user")
 
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        if not username or not password:
            return None
 
        user = db.query(User).filter(
            (User.username == username) | (User.email == username)
        ).first()
 
        if not user:
            return None
 
        if not verify_password(password, user.hashed_password):
            return None
 
        return user
 
    @staticmethod
    def login(db: Session, request: LoginRequest) -> Tuple[bool, dict]:
        try:
            # ✅ Ensure admin exists before authenticating
            AuthService.ensure_default_admin(db)
 
            user = AuthService.authenticate_user(db, request.username, request.password)
 
            # If not found locally, try Active Directory
            if not user:
                ad_ok, ad_profile = ad_authenticator.authenticate(request.username, request.password)
                if ad_ok:
                    user = db.query(User).filter(User.username == request.username).first()
                    if not user:
                        user = User(
                            username=request.username,
                            email=ad_profile.get("email", f"{request.username}@company.com"),
                            hashed_password=get_password_hash(str(uuid.uuid4())),
                        )
                        _safe_set(user, "full_name", ad_profile.get("full_name"))
                        _safe_set(user, "ad_username", request.username)
                        _safe_set(user, "is_active", True)
                        user.role = UserRole.viewer
 
                        # Enforce MFA by default for AD-created users
                        user.mfa_enabled = True
                        user.mfa_method = MFAMethod.EMAIL.value
 
                        db.add(user)
                        db.commit()
                        db.refresh(user)
 
            if not user:
                return False, {"success": False, "message": MSG_LOGIN_FAILED}
 
            if hasattr(user, "is_active") and not user.is_active:
                return False, {"success": False, "message": "Account is disabled"}
 
            # ✅ FORCE: admin never requires MFA
            if _is_admin_user(user):
                user.role = UserRole.admin
                user.mfa_enabled = False
                user.mfa_method = None
 
                tokens = AuthService._generate_tokens(user)
                perms = tokens.get("permissions", [])
 
                user.last_login = datetime.utcnow()
                db.commit()
 
                return True, {
                    "success": True,
                    "message": MSG_LOGIN_SUCCESS,
                    "requires_mfa": False,
                    **tokens,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": _role_display(user),     # "ADMIN"
                        "role_name": _role_name(user),   # "admin"
                        "permissions": perms,
                        "organisation_id": getattr(user, "organisation_id", None)
                    }
                }
 
            # MFA flow (non-admin users)
            if getattr(user, "mfa_enabled", False):
                mfa_token = create_mfa_token({
                    "user_id": user.id,
                    "username": user.username,
                    "purpose": "mfa_verify"
                })
 
                mfa_pending_logins[user.id] = {
                    "user_id": user.id,
                    "username": user.username,
                    "timestamp": datetime.utcnow()
                }
 
                methods = [getattr(user, "mfa_method", None)] if getattr(user, "mfa_method", None) else [MFAMethod.TOTP.value]
 
                return True, {
                    "success": True,
                    "message": MSG_MFA_REQUIRED,
                    "requires_mfa": True,
                    "mfa_methods": methods,
                    "temp_token": mfa_token
                }
 
            # Normal login => return JWT tokens
            tokens = AuthService._generate_tokens(user)
            perms = tokens.get("permissions", [])
 
            user.last_login = datetime.utcnow()
            db.commit()
 
            return True, {
                "success": True,
                "message": MSG_LOGIN_SUCCESS,
                "requires_mfa": False,
                **tokens,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": _role_display(user),     # "VIEWER"
                    "role_name": _role_name(user),   # "viewer"
                    "permissions": perms,
                    "organisation_id": getattr(user, "organisation_id", None)
                }
            }
 
        except Exception:
            db.rollback()
            logger.exception("Login failed")
            return False, {"success": False, "message": "Login failed due to server error"}
 
    # -----------------------
    # Email OTP send
    # -----------------------
    @staticmethod
    def send_email_otp(db: Session, user_id: int) -> Tuple[bool, dict]:
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False, {"success": False, "message": "User not found"}
 
            email_to_use = getattr(user, "email", None)
            if not email_to_use:
                return False, {"success": False, "message": "Email not available for Email MFA"}
 
            otp = _generate_otp(settings.OTP_LENGTH)
            otp_hash = _hash_otp(otp)
            expires_at = datetime.utcnow() + timedelta(minutes=settings.MFA_TOKEN_EXPIRE_MINUTES)
 
            user_db.upsert_user_otp(db, user_id, otp_hash, expires_at)
 
            subject = "SecureTracker - Your OTP"
            body = (
                f"Hi {user.username},\n\n"
                f"Your OTP is: {otp}\n\n"
                f"This OTP is valid for {settings.MFA_TOKEN_EXPIRE_MINUTES} minutes.\n"
                f"Do not share this OTP with anyone.\n\n"
                f"Regards,\nSecureTracker Team\n"
            )
 
            send_email(email_to_use, subject, body)
 
            return True, {"success": True, "message": "OTP sent to registered email address"}
 
        except Exception:
            db.rollback()
            logger.exception("Failed to send email OTP")
            return False, {"success": False, "message": "Failed to send OTP email"}
 
    @staticmethod
    def verify_email_otp(db: Session, user_id: int, code: str) -> bool:
        row = user_db.get_user_otp_row(db, user_id)
        if not row:
            return False
 
        expires_at = row["expires_at"]
        if expires_at < datetime.utcnow():
            user_db.delete_user_otp(db, user_id)
            return False
 
        attempts = row["attempts"] or 0
        if attempts >= 3:
            return False
 
        if _hash_otp(code) != row["otp_hash"]:
            user_db.increment_otp_attempt(db, user_id)
            return False
 
        user_db.delete_user_otp(db, user_id)
        return True
 
    @staticmethod
    def verify_mfa(db: Session, user_id: int, code: str, method: str) -> Tuple[bool, dict]:
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False, {"success": False, "message": "User not found"}
 
            verified = False
 
            if method == MFAMethod.TOTP.value:
                verified = mfa_handler.verify_totp(getattr(user, "totp_secret", "") or "", code)
            elif method == MFAMethod.SMS.value:
                verified = True  # placeholder
            elif method == MFAMethod.EMAIL.value:
                verified = AuthService.verify_email_otp(db, user_id, code)
            elif method in (MFAMethod.FINGERPRINT.value, MFAMethod.FACEID.value):
                biometric_hash = getattr(user, "fingerprint_hash", None) if method == MFAMethod.FINGERPRINT.value else getattr(user, "faceid_hash", None)
                verified = mfa_handler.verify_biometric(biometric_hash or "", code)
 
            if not verified:
                return False, {"success": False, "message": MSG_MFA_FAILED}
 
            tokens = AuthService._generate_tokens(user)
            perms = tokens.get("permissions", [])
 
            user.last_login = datetime.utcnow()
            db.commit()
            mfa_pending_logins.pop(user_id, None)
 
            return True, {
                "success": True,
                "message": MSG_MFA_SUCCESS,
                **tokens,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": _role_display(user),
                    "role_name": _role_name(user),
                    "permissions": perms,
                    "organisation_id": getattr(user, "organisation_id", None)
                }
            }
 
        except Exception:
            db.rollback()
            logger.exception("MFA verify failed")
            return False, {"success": False, "message": "MFA verification server error"}
 
    @staticmethod
    def _generate_tokens(user: User) -> dict:
        role_name = _role_name(user).lower()        # "admin" / "viewer"
        role_display = _role_display(user)          # "ADMIN" / "VIEWER"
 
        permissions = _build_permissions(role_name)
 
        access_token = create_access_token({
            "sub": str(user.id),
            "username": user.username,
            "email": user.email,
            "role": role_name,                 # ✅ frontend-friendly
            "role_display": role_display,       # ✅ UI-friendly
            "permissions": permissions,         # ✅ permissions in JWT
            "organisation_id": getattr(user, "organisation_id", None)
        })
 
        refresh_token = create_refresh_token({
            "sub": str(user.id),
            "username": user.username
        })
 
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 1800,
            "permissions": permissions
        }
 
 
auth_service = AuthService()
 