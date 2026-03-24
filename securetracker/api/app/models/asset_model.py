"""
Asset Model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Float, Text
from sqlalchemy.orm import relationship, validates
from datetime import datetime
import enum

from app.database.db_connection import Base
from app.config.constants import (
    # ✅ Construction asset types
    ASSET_TYPE_EXCAVATOR,
    ASSET_TYPE_BACKHOE_LOADER,
    ASSET_TYPE_BULLDOZER,
    ASSET_TYPE_WHEEL_LOADER,
    ASSET_TYPE_DUMP_TRUCK,
    ASSET_TYPE_CONCRETE_MIXER,
    ASSET_TYPE_TOWER_CRANE,
    ASSET_TYPE_MOBILE_CRANE,
    ASSET_TYPE_CRAWLER_CRANE,
    ASSET_TYPE_FORKLIFT,
    ASSET_TYPE_GRADER,
    ASSET_TYPE_ROLLER,
    ASSET_TYPE_PAVER,
    ASSET_TYPE_COMPACTOR,
    ASSET_TYPE_TELEHANDLER,
    ASSET_TYPE_OTHER,

    # Status remains same
    ASSET_STATUS_ACTIVE, ASSET_STATUS_INACTIVE, ASSET_STATUS_MAINTENANCE, ASSET_STATUS_STOLEN
)


class AssetType(enum.Enum):
    """Construction asset type enumeration"""
    excavator = ASSET_TYPE_EXCAVATOR
    backhoe_loader = ASSET_TYPE_BACKHOE_LOADER
    bulldozer = ASSET_TYPE_BULLDOZER
    wheel_loader = ASSET_TYPE_WHEEL_LOADER
    dump_truck = ASSET_TYPE_DUMP_TRUCK
    concrete_mixer = ASSET_TYPE_CONCRETE_MIXER
    tower_crane = ASSET_TYPE_TOWER_CRANE
    mobile_crane = ASSET_TYPE_MOBILE_CRANE
    crawler_crane = ASSET_TYPE_CRAWLER_CRANE
    forklift = ASSET_TYPE_FORKLIFT
    grader = ASSET_TYPE_GRADER
    roller = ASSET_TYPE_ROLLER
    paver = ASSET_TYPE_PAVER
    compactor = ASSET_TYPE_COMPACTOR
    telehandler = ASSET_TYPE_TELEHANDLER
    other = ASSET_TYPE_OTHER


class AssetStatus(enum.Enum):
    """Asset status enumeration"""
    active = ASSET_STATUS_ACTIVE
    inactive = ASSET_STATUS_INACTIVE
    maintenance = ASSET_STATUS_MAINTENANCE
    stolen = ASSET_STATUS_STOLEN


class Asset(Base):
    """Asset model for construction equipment"""
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)

    # ✅ Your numeric asset id (stored as string so it can stay "0012" etc.)
    asset_id = Column(String(50), unique=True, index=True, nullable=False)

    # ✅ Keep name in DB for compatibility, but you can auto-generate it in API
    name = Column(String(200), nullable=False)

    description = Column(Text, nullable=True)

    # ✅ Updated enum default
    asset_type = Column(Enum(AssetType), default=AssetType.excavator, nullable=False)
    status = Column(Enum(AssetStatus), default=AssetStatus.active, nullable=False)

    make = Column(String(100))
    model = Column(String(100))
    year = Column(Integer)
    license_plate = Column(String(50), unique=True, nullable=True)
    vin = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)

    organisation_id = Column(Integer, ForeignKey("organisations.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    tracking_device_id = Column(Integer, ForeignKey("tracking_devices.id"), nullable=True)

    last_latitude = Column(Float, nullable=True)
    last_longitude = Column(Float, nullable=True)
    last_location_update = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organisation = relationship("Organisation", back_populates="assets")
    owner = relationship("User", back_populates="assets")
    tracking_device = relationship("TrackingDevice", back_populates="asset")
    tracking_records = relationship("TrackingRecord", back_populates="asset")

    # ✅ Enforce numeric-only asset_id at the model level (works for any DB)
    @validates("asset_id")
    def validate_asset_id(self, key, value):
        if value is None:
            raise ValueError("asset_id is required")

        s = str(value).strip()
        if not s.isdigit():
            raise ValueError("asset_id must contain only numbers (digits)")
        return s

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

    def __repr__(self):
        return f"<TrackingDevice(id={self.id}, device_id={self.device_id})>"


AssetTypeEnum = AssetType
AssetStatusEnum = AssetStatus