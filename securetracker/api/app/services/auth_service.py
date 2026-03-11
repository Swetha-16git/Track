"""
Authentication Service
"""
 
from datetime import datetime
from typing import Optional, Tuple, Dict, Any
import logging
import uuid
import re
 
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy.inspection import inspect as sa_inspect
 
from app.models.user_model import User
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
 
logger = logging.getLogger(__name__)
 
mfa_pending_logins: Dict[int, Dict[str, Any]] = {}
 
 
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
 
 
def _set_role_safely(user_obj: Any, desired: str) -> None:
    if not _model_has_attr(user_obj, "role"):
        return
    try:
        mapper = sa_inspect(user_obj.__class__)
        role_prop = mapper.attrs.get("role")
        col = None
        if hasattr(role_prop, "columns") and role_prop.columns:
            col = role_prop.columns[0]
 
        if col is not None and hasattr(col.type, "enums") and col.type.enums:
            enums = list(col.type.enums)
            value = desired if desired in enums else enums[0]
            setattr(user_obj, "role", value)
        else:
            setattr(user_obj, "role", desired)
    except Exception:
        try:
            setattr(user_obj, "role", desired)
        except Exception:
            pass
 
 
class AuthService:
    """Authentication service"""
 
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
                        _set_role_safely(user, ROLE_VIEWER)
 
                        db.add(user)
                        db.commit()
                        db.refresh(user)
 
            if not user:
                return False, {"success": False, "message": MSG_LOGIN_FAILED}
 
            if hasattr(user, "is_active") and not user.is_active:
                return False, {"success": False, "message": "Account is disabled"}
 
            # MFA flow
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
 
            # ✅ Normal login => return JWT tokens
            tokens = AuthService._generate_tokens(user)
            _safe_set(user, "last_login", datetime.utcnow())
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
                    "role": getattr(getattr(user, "role", None), "value", getattr(user, "role", None)),
                    "organisation_id": getattr(user, "organisation_id", None)
                }
            }
 
        except Exception:
            db.rollback()
            logger.exception("Login failed")
            return False, {"success": False, "message": "Login failed due to server error"}
 
    @staticmethod
    def verify_mfa(db: Session, user_id: int, code: str, method: str) -> Tuple[bool, dict]:
        """
        NOTE:
        - TOTP is real verification.
        - SMS/Email currently placeholder unless you store OTP + expiry in DB/Redis.
        """
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False, {"success": False, "message": "User not found"}
 
            verified = False
 
            if method == MFAMethod.TOTP.value:
                verified = mfa_handler.verify_totp(getattr(user, "totp_secret", "") or "", code)
 
            elif method == MFAMethod.SMS.value:
                # TODO: verify against stored OTP (db or redis). Placeholder:
                verified = True
 
            elif method == MFAMethod.EMAIL.value:
                # TODO: verify against stored OTP (db or redis). Placeholder:
                verified = True
 
            elif method in (MFAMethod.FINGERPRINT.value, MFAMethod.FACEID.value):
                biometric_hash = getattr(user, "fingerprint_hash", None) if method == MFAMethod.FINGERPRINT.value else getattr(user, "faceid_hash", None)
                verified = mfa_handler.verify_biometric(biometric_hash or "", code)
 
            if not verified:
                return False, {"success": False, "message": MSG_MFA_FAILED}
 
            tokens = AuthService._generate_tokens(user)
            _safe_set(user, "last_login", datetime.utcnow())
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
                    "role": getattr(getattr(user, "role", None), "value", getattr(user, "role", None)),
                    "organisation_id": getattr(user, "organisation_id", None)
                }
            }
 
        except Exception:
            db.rollback()
            logger.exception("MFA verify failed")
            return False, {"success": False, "message": "MFA verification server error"}
 
    @staticmethod
    def signup(db: Session, request: SignupRequest) -> Tuple[bool, dict]:
        email = _get_field(request, "email")
        password = _get_field(request, "password")
        phone = _get_field(request, "phone")
 
        full_name = _get_field(request, "full_name", "fullname")
        org_name = _get_field(request, "organisation_name", "organization_name")
        org_id = _get_field(request, "organisation_id", "organization_id")
 
        username = _get_field(request, "username")
        if not username and email:
            username = email.split("@")[0]
 
        if not email or not password or not username:
            return False, {"success": False, "message": "email, password and username are required"}
 
        try:
            existing = db.query(User).filter(
                (User.username == username) | (User.email == email)
            ).first()
 
            if existing:
                return False, {"success": False, "message": "Username or email already exists"}
 
            organisation = None
            if org_id:
                organisation = db.query(Organisation).filter(Organisation.id == org_id).first()
                if not organisation:
                    return False, {"success": False, "message": "Organisation ID not found"}
            elif org_name:
                organisation = db.query(Organisation).filter(Organisation.name == org_name).first()
                if not organisation:
                    organisation = Organisation(name=org_name)
                    _safe_set(organisation, "slug", _slugify(org_name))
                    _safe_set(organisation, "description", f"Organisation for {org_name}")
                    db.add(organisation)
                    db.commit()
                    db.refresh(organisation)
 
            # ✅ Hash password (bcrypt based in jwt_handler now)
            try:
                hashed = get_password_hash(password)
            except Exception:
                db.rollback()
                logger.exception("Password hashing failed")
                return False, {
                    "success": False,
                    "message": "Password hashing failed. Ensure bcrypt is installed and restart backend."
                }
 
            user = User(
                username=username,
                email=email,
                hashed_password=hashed,
            )
 
            _safe_set(user, "full_name", full_name)
            _safe_set(user, "phone", phone)
            _safe_set(user, "organisation_id", organisation.id if organisation else None)
            _safe_set(user, "is_active", True)
            _safe_set(user, "is_verified", False)
            _set_role_safely(user, ROLE_VIEWER)
 
            db.add(user)
            db.commit()
            db.refresh(user)
 
            return True, {
                "success": True,
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "organisation_id": getattr(user, "organisation_id", None)
                }
            }
 
        except IntegrityError:
            db.rollback()
            logger.exception("Signup integrity error")
            return False, {"success": False, "message": "User already exists or invalid data (DB constraint)"}
 
        except Exception:
            db.rollback()
            logger.exception("Signup failed")
            return False, {"success": False, "message": "Signup failed due to server error"}
 
    @staticmethod
    def enable_mfa(db: Session, user_id: int, method: str, phone: Optional[str] = None) -> Tuple[bool, dict]:
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False, {"success": False, "message": "User not found"}
 
            if method == MFAMethod.TOTP.value:
                secret = mfa_handler.generate_totp_secret()
                uri = mfa_handler.get_totp_uri(secret, user.username)
                qr_code = mfa_handler.generate_qr_code(uri)
 
                _safe_set(user, "totp_secret", secret)
                _safe_set(user, "mfa_method", MFAMethod.TOTP.value)
                _safe_set(user, "mfa_enabled", True)
                db.commit()
 
                return True, {
                    "success": True,
                    "method": method,
                    "qr_code": qr_code,
                    "message": "TOTP MFA enabled. Scan QR code with authenticator app."
                }
 
            if method == MFAMethod.SMS.value:
                # ✅ use phone argument OR fallback to user.phone
                phone_to_use = phone or getattr(user, "phone", None)
                if not phone_to_use:
                    return False, {"success": False, "message": "Phone number not available for SMS MFA"}
 
                _safe_set(user, "mfa_method", MFAMethod.SMS.value)
                _safe_set(user, "phone_for_sms", phone_to_use)
                _safe_set(user, "mfa_enabled", True)
                db.commit()
 
                # (optional) generate/send OTP using your handler (currently logs only)
                mfa_handler.generate_sms_otp(phone_to_use)
 
                return True, {"success": True, "method": method, "message": "SMS MFA enabled. OTP sent (dev mode)."}
 
            if method == MFAMethod.EMAIL.value:
                email_to_use = getattr(user, "email", None)
                if not email_to_use:
                    return False, {"success": False, "message": "Email not available for Email MFA"}
 
                _safe_set(user, "mfa_method", MFAMethod.EMAIL.value)
                _safe_set(user, "mfa_enabled", True)
                db.commit()
 
                mfa_handler.generate_email_otp(email_to_use)
 
                return True, {"success": True, "method": method, "message": "Email MFA enabled. OTP sent (dev mode)."}
 
            if method in [MFAMethod.FINGERPRINT.value, MFAMethod.FACEID.value]:
                _safe_set(user, "mfa_method", method)
                _safe_set(user, "mfa_enabled", True)
                db.commit()
                return True, {"success": True, "method": method, "message": f"{method.upper()} MFA enabled (dev placeholder)."}
 
            return False, {"success": False, "message": "Unsupported MFA method"}
 
        except Exception:
            db.rollback()
            logger.exception("Enable MFA failed")
            return False, {"success": False, "message": "Enable MFA failed due to server error"}
 
    @staticmethod
    def disable_mfa(db: Session, user_id: int) -> Tuple[bool, dict]:
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False, {"success": False, "message": "User not found"}
 
            _safe_set(user, "mfa_enabled", False)
            _safe_set(user, "mfa_method", None)
            _safe_set(user, "totp_secret", None)
            db.commit()
 
            return True, {"success": True, "message": "MFA disabled"}
 
        except Exception:
            db.rollback()
            logger.exception("Disable MFA failed")
            return False, {"success": False, "message": "Disable MFA failed due to server error"}
 
    @staticmethod
    def _generate_tokens(user: User) -> dict:
        access_token = create_access_token({
            "sub": str(user.id),
            "username": user.username,
            "email": user.email,
            "role": getattr(getattr(user, "role", None), "value", getattr(user, "role", None)),
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
            "expires_in": 1800
        }
 
 
auth_service = AuthService()
 
 
 