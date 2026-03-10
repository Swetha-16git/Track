"""
Organisation Model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.db_connection import Base


class Organisation(Base):
    """Organisation model"""
    __tablename__ = "organisations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Contact info
    email = Column(String(255))
    phone = Column(String(20))
    address = Column(Text)
    
    # Settings
    is_active = Column(Boolean, default=True)
    max_users = Column(Integer, default=10)
    max_assets = Column(Integer, default=100)
    
    # AD integration
    ad_domain = Column(String(255), nullable=True)
    ad_server = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = relationship("User", back_populates="organisation")
    assets = relationship("Asset", back_populates="organisation")
    tracking_devices = relationship("TrackingDevice", back_populates="organisation")

    def __repr__(self):
        return f"<Organisation(id={self.id}, name={self.name})>"

