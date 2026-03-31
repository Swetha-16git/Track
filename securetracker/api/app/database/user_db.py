"""
User DB Helpers (User + OTP storage)
"""
 
import logging
from datetime import datetime
from typing import Optional, Any, Dict
 
from sqlalchemy.orm import Session
from sqlalchemy import text
 
from app.models.user_model import User
 
logger = logging.getLogger(__name__)
 
 
# -----------------------
# User helpers
# -----------------------
 
def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()
 
 
def get_user_by_username_or_email(db: Session, username_or_email: str) -> Optional[User]:
    return db.query(User).filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()
 
 
# -----------------------
# OTP helpers (user_otp table)
# -----------------------
 
def upsert_user_otp(db: Session, user_id: int, otp_hash: str, expires_at: datetime) -> None:
    """
    Store/replace OTP for a user (one active OTP per user)
    """
    try:
        db.execute(
            text("""
                INSERT INTO user_otp (user_id, otp_hash, expires_at, attempts, created_at)
                VALUES (:user_id, :otp_hash, :expires_at, 0, NOW())
                ON CONFLICT (user_id)
                DO UPDATE SET otp_hash = EXCLUDED.otp_hash,
                              expires_at = EXCLUDED.expires_at,
                              attempts = 0,
                              created_at = NOW();
            """),
            {"user_id": user_id, "otp_hash": otp_hash, "expires_at": expires_at},
        )
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Failed to upsert user OTP")
        raise
 
 
def get_user_otp_row(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
    row = db.execute(
        text("""
            SELECT user_id, otp_hash, expires_at, attempts, created_at
            FROM user_otp
            WHERE user_id = :user_id
        """),
        {"user_id": user_id},
    ).mappings().first()
 
    return dict(row) if row else None
 
 
def increment_otp_attempt(db: Session, user_id: int) -> None:
    try:
        db.execute(
            text("""
                UPDATE user_otp
                SET attempts = attempts + 1
                WHERE user_id = :user_id
            """),
            {"user_id": user_id},
        )
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Failed to increment OTP attempts")
        raise
 
 
def delete_user_otp(db: Session, user_id: int) -> None:
    try:
        db.execute(
            text("DELETE FROM user_otp WHERE user_id = :user_id"),
            {"user_id": user_id},
        )
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Failed to delete OTP")
        raise
 
 