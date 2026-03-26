"""
Asset Type Model (D_ASSET_TYPE)
"""
from sqlalchemy import Column, Integer, String, Float, Text, LargeBinary, DateTime
from sqlalchemy.orm import relationship
from app.database.db_connection import Base
from datetime import datetime

class AssetType(Base):
    __tablename__ = "D_ASSET_TYPE"

    Asset_Type_Key = Column(Integer, primary_key=True, autoincrement=True)
    
    # String fields
    Asset_Type = Column(String(255))
    Asset_Code = Column(String(100))
    Criticality = Column(String(50))
    DashboardURL = Column(String(800))
    IconCssName = Column(String(50))
    ShortCode = Column(String(15))
    
    # Float fields
    Exp_Working_Hrs = Column(Float)
    Exp_Idle_Hrs = Column(Float)
    Exp_OFF_Hrs = Column(Float)
    Exp_Runtime_Hrs = Column(Float)
    Exp_IdleFuelBurnRate = Column(Float)
    Exp_WorkingFuelBurnRate = Column(Float)
    Exp_RuntimeFuelBurnRate = Column(Float)
    Engine_Oil_Pressure_LTL = Column(Float)
    Engine_Oil_Pressure_UTL = Column(Float)
    KW_Hours_Benchmark = Column(Float)
    Average_RPM = Column(Float)
    Transmission_Temperature_LTL = Column(Float)
    Transmission_Temperature_UTL = Column(Float)
    
    # Integer fields
    Is_Critical_Flag = Column(Integer)
    SortingOrderId = Column(Integer)
    EquipmentCategory_Key = Column(Integer)
    
    # Binary
    ImageFileData = Column(LargeBinary)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<AssetType(Asset_Type_Key={self.Asset_Type_Key}, Asset_Type='{self.Asset_Type}')>"


