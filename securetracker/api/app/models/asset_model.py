"""
Asset Model
"""
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    ForeignKey, Enum as PgEnum, Float, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database.db_connection import Base
from app.config.constants import (
    ASSET_STATUS_ACTIVE,
    ASSET_STATUS_INACTIVE,
    ASSET_STATUS_MAINTENANCE,
    ASSET_STATUS_STOLEN
)


# ✅ MATCHES POSTGRES ENUM assettype EXACTLY
class AssetType(str, enum.Enum):
    car = "car"
    bike = "bike"
    truck = "truck"
    bus = "bus"
    van = "van"
    motorcycle = "motorcycle"
    scooter = "scooter"
    boat = "boat"
    other = "other"


class AssetStatus(str, enum.Enum):
    active = ASSET_STATUS_ACTIVE
    inactive = ASSET_STATUS_INACTIVE
    maintenance = ASSET_STATUS_MAINTENANCE
    stolen = ASSET_STATUS_STOLEN


class Asset(Base):
    """Asset model for vehicles"""
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)

    # Asset identification
    asset_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    # ✅ ENUM FIX (CRITICAL)
    asset_type = Column(
        PgEnum(AssetType, name="assettype", native_enum=True, create_type=False),
        nullable=False
    )

    status = Column(
        PgEnum(AssetStatus, name="assetstatus", native_enum=True, create_type=False),
        nullable=False,
        default=AssetStatus.active
    )

    # Vehicle details
    make = Column(String(100))
    model = Column(String(100))
    year = Column(Integer)
    license_plate = Column(String(50), unique=True, nullable=True)
    vin = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)

    # Organization and owner
    organisation_id = Column(Integer, ForeignKey("organisations.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Tracking device
    tracking_device_id = Column(Integer, ForeignKey("tracking_devices.id"), nullable=True)

    # Location (last known)
    last_latitude = Column(Float, nullable=True)
    last_longitude = Column(Float, nullable=True)
    last_location_update = Column(DateTime, nullable=True)

    # Metadata
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organisation = relationship("Organisation", back_populates="assets")
    owner = relationship("User", back_populates="assets")
    tracking_device = relationship("TrackingDevice", back_populates="asset")
    tracking_records = relationship("TrackingRecord", back_populates="asset")

    def __repr__(self):
        return f"<Asset(id={self.id}, asset_id={self.asset_id}, name={self.name})>"


class TrackingDevice(Base):
    """Tracking device model"""
    __tablename__ = "tracking_devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(100), unique=True, index=True, nullable=False)
    device_name = Column(String(200), nullable=False)
    device_type = Column(String(50), nullable=True)
    imei = Column(String(50), nullable=True)
    phone_number = Column(String(20), nullable=True)

    organisation_id = Column(Integer, ForeignKey("organisations.id"), nullable=False)

    is_active = Column(Boolean, default=True)
    is_online = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_seen = Column(DateTime, nullable=True)

    organisation = relationship("Organisation", back_populates="tracking_devices")
    asset = relationship("Asset", back_populates="tracking_device", uselist=False)


# Aliases for backward compatibility
AssetTypeEnum = AssetType
AssetStatusEnum = AssetStatus