"""
Authentication Router
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging

from pydantic import BaseModel, Field

from app.database.db_connection import get_db
from app.models.auth_model import (
    LoginRequest, SignupRequest,
    TokenResponse, MFAVerifyRequest,
    RefreshTokenRequest, PasswordChangeRequest
)
from app.services.auth_service import auth_service
from app.security.jwt_handler import verify_token, refresh_access_token
from app.security.permissions import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


class MFASendOtpRequest(BaseModel):
    temp_token: str = Field(..., description="JWT temp token returned during login (type=mfa)")


@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    success, response = auth_service.login(db, request)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=response.get("message")
        )
    return response


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    success, response = auth_service.signup(db, request)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message")
        )
    return response


# ✅ NEW: Send Email OTP during MFA stage
@router.post("/mfa/email/send")
async def send_email_otp(request: MFASendOtpRequest, db: Session = Depends(get_db)):
    # validate temp token
    payload = verify_token(request.temp_token, "mfa")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired MFA temp token"
        )

    user_id = int(payload.get("user_id"))

    success, response = auth_service.send_email_otp(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message")
        )
    return response


@router.post("/verify-mfa")
async def verify_mfa(request: MFAVerifyRequest, db: Session = Depends(get_db)):
    payload = verify_token(request.temp_token, "mfa")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired MFA temp token"
        )

    user_id = int(payload.get("user_id"))

    success, response = auth_service.verify_mfa(db, user_id, request.code, request.method)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=response.get("message")
        )

    return response


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    result = refresh_access_token(request.refresh_token)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    return result


@router.post("/enable-mfa")
async def enable_mfa(
    method: str = Query(..., description="totp | sms | email | fingerprint | faceid"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user.get("sub"))
    success, response = auth_service.enable_mfa(db, user_id, method)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message")
        )
    return response


@router.post("/disable-mfa")
async def disable_mfa(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user.get("sub"))
    success, response = auth_service.disable_mfa(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message")
        )
    return response


@router.post("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return {"success": True, "message": "Password changed successfully"}


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}