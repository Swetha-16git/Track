"""
OEM Model (D_OEM)
"""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from app.database.db_connection import Base
from datetime import datetime

class OEM(Base):
    __tablename__ = "D_OEM"

    OEM_Key = Column(Integer, primary_key=True, autoincrement=True)

    OEM_Provider = Column(String(100), unique=True, index=True)
    OEM_ProviderName = Column(String(100))
    OEM_Description = Column(String(255))
    History_TableName = Column(String(150))
    Is_Solution = Column(String(5))
    Is_ForLiveTracking = Column(String(5))
    AssetIdColumnName = Column(String(100))
    CCodeColumnName = Column(String(100))
    InstanceTimeColumnName = Column(String(100))
    InstanceDateColumnName = Column(String(100))
    Productivity_TableName = Column(String(150))
    WorkDoneUOM = Column(String(50))
    APPLICATION_NAME = Column(String(100))
    AssetSubCategory = Column(String(90))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<OEM(OEM_Key={self.OEM_Key}, OEM_Provider='{self.OEM_Provider}')>"

