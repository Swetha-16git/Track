"""
User Model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database.db_connection import Base
from app.config.constants import ROLE_ADMIN, ROLE_VIEWER


class UserRole(enum.Enum):
    """User role enumeration"""
    admin = ROLE_ADMIN
    viewer = ROLE_VIEWER


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200))
    phone = Column(String(20))
    
    # Role-based access
    role = Column(Enum(UserRole), default=UserRole.viewer, nullable=False)
    
    # Organization
    organisation_id = Column(Integer, ForeignKey("organisations.id"), nullable=True)
    
    # MFA settings
    mfa_enabled = Column(Boolean, default=False)
    mfa_method = Column(String(50), nullable=True)
    totp_secret = Column(String(255), nullable=True)
    phone_for_sms = Column(String(20), nullable=True)
    
    # Biometric (store hash only, not actual biometric data)
    fingerprint_hash = Column(String(255), nullable=True)
    faceid_hash = Column(String(255), nullable=True)
    
    # Active Directory
    ad_username = Column(String(255), nullable=True)
    ad_sid = Column(String(255), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    organisation = relationship("Organisation", back_populates="users")
    assets = relationship("Asset", back_populates="owner")
    tracking_records = relationship("TrackingRecord", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"


# Alias for backward compatibility
RoleEnum = UserRole

