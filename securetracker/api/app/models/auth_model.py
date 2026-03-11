"""
Authentication Models and Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


# ==================== ENUMS ====================

class MFAMethod(str, Enum):
    """MFA methods supported"""
    TOTP = "totp"
    SMS = "sms"
    EMAIL = "email"
    FINGERPRINT = "fingerprint"
    FACEID = "faceid"


class UserRole(str, Enum):
    """User roles"""
    ADMIN = "admin"
    MANAGER = "manager"
    VIEWER = "viewer"


# ==================== REQUEST MODELS ====================

class LoginRequest(BaseModel):
    """Login request"""
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    organisation_id: Optional[int] = None


class SignupRequest(BaseModel):
    """Signup request"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    phone: Optional[str] = None
    organisation_id: Optional[int] = None
    organisation_name: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class PasswordResetRequest(BaseModel):
    """Password reset request"""
    email: EmailStr


class PasswordChangeRequest(BaseModel):
    """Password change request"""
    old_password: str
    new_password: str = Field(..., min_length=8)


class MFAEnableRequest(BaseModel):
    """Enable MFA request"""
    method: MFAMethod
    phone: Optional[str] = None


class MFAVerifyRequest(BaseModel):
    """MFA verification request"""
    temp_token: str = Field(..., description="JWT temp token returned during login")
    code: str = Field(..., min_length=4, description="OTP / TOTP / biometric code")
    method: MFAMethod


# ==================== RESPONSE MODELS ====================

class TokenResponse(BaseModel):
    """Token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class MFASetupResponse(BaseModel):
    """MFA setup response"""
    method: MFAMethod
    secret: Optional[str] = None
    qr_code: Optional[str] = None
    message: str


class LoginResponse(BaseModel):
    """Login response"""
    success: bool
    message: str
    requires_mfa: bool = False

    # MFA flow
    mfa_methods: Optional[List[MFAMethod]] = None
    temp_token: Optional[str] = None

    # Normal login (no MFA)
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
    expires_in: Optional[int] = None

    # Optional user info
    user: Optional[Dict] = None


class UserResponse(BaseModel):
    """User response"""
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole
    organisation_id: Optional[int] = None
    mfa_enabled: bool = False
    mfa_method: Optional[MFAMethod] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Generic message response"""
    success: bool
    message: str


# ==================== TOKEN PAYLOAD MODELS ====================

class TokenPayload(BaseModel):
    """JWT token payload"""
    sub: str
    username: str
    email: Optional[str] = None
    role: str
    organisation_id: Optional[int] = None
    exp: Optional[datetime] = None
    iat: Optional[datetime] = None


class MFATokenPayload(BaseModel):
    """MFA verification token payload"""
    username: str
    user_id: int
    purpose: str  # "mfa_verify" or "password_reset"
    exp: Optional[datetime] = None