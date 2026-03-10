"""
Tracking Model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database.db_connection import Base
from app.config.constants import TRACKING_STATUS_ONLINE, TRACKING_STATUS_OFFLINE, TRACKING_STATUS_IDLE


class TrackingStatus(enum.Enum):
    """Tracking status enumeration"""
    online = TRACKING_STATUS_ONLINE
    offline = TRACKING_STATUS_OFFLINE
    idle = TRACKING_STATUS_IDLE


class TrackingRecord(Base):
    """Tracking record model for real-time location data"""
    __tablename__ = "tracking_records"

    id = Column(Integer, primary_key=True, index=True)
    
    # Asset reference
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Location data
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude = Column(Float, nullable=True)
    speed = Column(Float, nullable=True)  # km/h
    heading = Column(Float, nullable=True)  # degrees
    
    # Accuracy
    accuracy = Column(Float, nullable=True)
    
    # Status
    status = Column(Enum(TrackingStatus), default=TrackingStatus.online, nullable=False)
    
    # Additional data
    device_timestamp = Column(DateTime, nullable=True)
    server_timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Metadata
    raw_data = Column(Text, nullable=True)  # Store raw GPS data
    
    # Relationships
    asset = relationship("Asset", back_populates="tracking_records")
    user = relationship("User", back_populates="tracking_records")

    def __repr__(self):
        return f"<TrackingRecord(id={self.id}, asset_id={self.asset_id}, lat={self.latitude}, lon={self.longitude})>"


class TrackingAlert(Base):
    """Tracking alerts for geofencing, speed, etc."""
    __tablename__ = "tracking_alerts"

    id = Column(Integer, primary_key=True, index=True)
    
    # Asset reference
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    
    # Alert type
    alert_type = Column(String(50), nullable=False)  # geofence, speed, battery, etc.
    severity = Column(String(20), nullable=False)  # info, warning, critical
    
    # Alert details
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    
    # Location (if applicable)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Status
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    asset = relationship("Asset")

    def __repr__(self):
        return f"<TrackingAlert(id={self.id}, type={self.alert_type}, severity={self.severity})>"


# Alias for backward compatibility
TrackingStatusEnum = TrackingStatus

