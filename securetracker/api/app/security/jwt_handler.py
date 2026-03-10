"""
JWT Token Handler
"""
 
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
import logging
import bcrypt
 
from app.config.settings import settings
 
logger = logging.getLogger(__name__)
 
 
# -------------------------
# Password hashing (bcrypt only)
# -------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception as e:
        logger.error(f"Password verify error: {e}")
        return False
 
 
def get_password_hash(password: str) -> str:
    try:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        return hashed.decode("utf-8")
    except Exception as e:
        logger.error(f"Password hash error: {e}")
        raise
 
 
# -------------------------
# JWT creation helpers
# -------------------------
def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
 
    expire = (
        datetime.utcnow() + expires_delta
        if expires_delta
        else datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
 
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
 
    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
 
 
def create_refresh_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
 
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
 
    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
 
 
def create_mfa_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.MFA_TOKEN_EXPIRE_MINUTES)
 
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "mfa"
    })
 
    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
 
 
# -------------------------
# JWT verification helpers
# -------------------------
def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
    except JWTError as e:
        logger.error(f"Token decode error: {e}")
        return None
 
 
def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
    payload = decode_token(token)
    if not payload:
        return None
 
    if payload.get("type") != token_type:
        logger.warning(
            f"Invalid token type: {payload.get('type')} (expected {token_type})"
        )
        return None
 
    exp = payload.get("exp")
    if exp:
        exp_dt = (
            datetime.fromtimestamp(exp)
            if isinstance(exp, (int, float))
            else exp
        )
        if exp_dt < datetime.utcnow():
            logger.warning("Token expired")
            return None
 
    return payload
 
 
# -------------------------
# ✅ FIXED refresh logic
# -------------------------
def refresh_access_token(refresh_token: str) -> Optional[Dict[str, Any]]:
    """
    Refresh access token using refresh token.
    SAFE version – will NOT crash with 500.
    """
    try:
        payload = verify_token(refresh_token, "refresh")
        if not payload:
            return None
 
        user_id = payload.get("sub")
        username = payload.get("username")
 
        if not user_id or not username:
            logger.warning("Invalid refresh token payload")
            return None
 
        new_access_token = create_access_token({
            "sub": user_id,
            "username": username
        })
 
        new_refresh_token = create_refresh_token({
            "sub": user_id,
            "username": username
        })
 
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
 
    except Exception:
        logger.exception("Refresh token failed")
        return None
 