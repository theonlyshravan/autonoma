import enum
import uuid
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Enum, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class UserRole(str, enum.Enum):
    customer = "customer"
    service = "service"
    manufacturer = "manufacturer"

class VehicleType(str, enum.Enum):
    EV = "EV"
    ICE = "ICE"

class AnomalySeverity(str, enum.Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"
    Critical = "Critical"

class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class UEBAStatus(str, enum.Enum):
    ALLOWED = "ALLOWED"
    BLOCKED = "BLOCKED"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    full_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicles = relationship("Vehicle", back_populates="owner", cascade="all, delete-orphan")

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    vin = Column(String, unique=True, index=True, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer)
    vehicle_type = Column(Enum(VehicleType))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="vehicles")
    anomalies = relationship("AnomalyEvent", back_populates="vehicle")
    bookings = relationship("ServiceBooking", back_populates="vehicle")

class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="CASCADE"))
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    anomaly_type = Column(String, nullable=False)
    severity = Column(Enum(AnomalySeverity))
    sensor_snapshot = Column(JSON)
    rul_prediction = Column(Float)

    vehicle = relationship("Vehicle", back_populates="anomalies")
    diagnosis = relationship("Diagnosis", back_populates="anomaly_event", uselist=False)

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    anomaly_event_id = Column(UUID(as_uuid=True), ForeignKey("anomaly_events.id", ondelete="CASCADE"))
    diagnosis_text = Column(Text, nullable=False)
    confidence_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    anomaly_event = relationship("AnomalyEvent", back_populates="diagnosis")

class ServiceBooking(Base):
    __tablename__ = "service_bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="CASCADE"))
    service_center_id = Column(String)
    appointment_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    customer_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicle = relationship("Vehicle", back_populates="bookings")

class ManufacturingInsight(Base):
    __tablename__ = "manufacturing_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    component_name = Column(String, nullable=False)
    failure_pattern = Column(String, nullable=False)
    affected_batch = Column(String)
    recommendation = Column(Text)
    confidence_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UEBALog(Base):
    __tablename__ = "ueba_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_name = Column(String, nullable=False)
    action_type = Column(String, nullable=False)
    source_node = Column(String)
    target_node = Column(String)
    status = Column(Enum(UEBAStatus))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
