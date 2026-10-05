from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, func, JSON
from app.database import Base
from datetime import datetime, timezone
# 1. Existing User Table
class Operator(Base):
    __tablename__ = "operators"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="operator")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 2. New Sensor Table
class Sensor(Base):
    __tablename__ = "sensors"
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, unique=True, index=True, nullable=False) # e.g., 'P-103'
    name = Column(String, nullable=False) # e.g., 'Reactor Pressure'
    unit = Column(String, nullable=False) # e.g., 'bar'
    area = Column(String, nullable=False) # e.g., 'Reactor Area'

# 3. New Readings Table (The actual telemetry data)
class Reading(Base):
    __tablename__ = "readings"
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, ForeignKey('sensors.sensor_id'), index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    value = Column(Float, nullable=False)
    is_anomaly = Column(Boolean, default=False)
# 4. Incident Table (For tracking anomalies that need attention)
class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, ForeignKey('sensors.sensor_id'), index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    severity = Column(String, nullable=False) # "low", "medium", "critical"
    status = Column(String, nullable=False, default="open") # "open", "investigating", "resolved"
    description = Column(String, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String, nullable=True)    
# 5. Scenario Table (For simulation/testing)
class Scenario(Base):
    __tablename__ = "scenarios"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now(timezone.utc))
    # Store scenario parameters as JSON (e.g., which sensors to affect, what values to simulate)
    parameters = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)