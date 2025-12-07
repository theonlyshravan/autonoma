import asyncio
import os
from database import engine, Base, AsyncSessionLocal
from models import User, Vehicle, AnomalyEvent, Diagnosis, ServiceBooking, ManufacturingInsight, UserRole, VehicleType, AnomalySeverity, BookingStatus
from passlib.context import CryptContext
from sqlalchemy import select
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_db():
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all) # Optional: Reset DB
        await conn.run_sync(Base.metadata.create_all)

async def seed_data():
    await init_db()
    
    async with AsyncSessionLocal() as session:
        # Check if users exist
        result = await session.execute(select(User))
        if result.scalars().first():
            print("Database already seeded.")
            return

        print("Seeding data...")

        # 1. Users
        users = [
            User(
                email="user@demo.com", 
                password_hash=pwd_context.hash("pass123"), 
                role=UserRole.customer
            ),
            User(
                email="service@ey.com", 
                password_hash=pwd_context.hash("ey_secure"), 
                role=UserRole.service
            ),
            User(
                email="admin@oem.com", 
                password_hash=pwd_context.hash("admin_pass"), 
                role=UserRole.manufacturer
            )
        ]
        session.add_all(users)
        await session.commit() # Commit to get IDs

        # 2. Vehicle (Linked to Customer)
        customer = users[0]
        vehicle = Vehicle(
            owner_id=customer.id,
            vin="VIN123456789",
            model="Tesla Model 3",
            year=2023,
            vehicle_type=VehicleType.EV
        )
        session.add(vehicle)
        await session.commit()

        # 3. Anomaly Event (Past)
        anomaly = AnomalyEvent(
            vehicle_id=vehicle.id,
            anomaly_type="Battery Overheat",
            severity=AnomalySeverity.High,
            sensor_snapshot={"temp": 55, "voltage": 380},
            rul_prediction=85.5,
            detected_at=datetime.now() - timedelta(days=2)
        )
        session.add(anomaly)
        await session.commit()

        # 4. Diagnosis
        diagnosis = Diagnosis(
            anomaly_event_id=anomaly.id,
            diagnosis_text="Thermal runaway risk detected due to cooling system failure.",
            confidence_score=0.95
        )
        session.add(diagnosis)

        # 5. Service Booking (Completed)
        booking = ServiceBooking(
            vehicle_id=vehicle.id,
            service_center_id="SC-001",
            appointment_time=datetime.now() - timedelta(days=1),
            status=BookingStatus.COMPLETED,
            customer_notes="Fixing battery issue"
        )
        session.add(booking)

        # 6. Manufacturing Insight
        insight = ManufacturingInsight(
            component_name="Battery Cooling Pump",
            failure_pattern="High failure rate in Batch B-2023",
            affected_batch="B-2023",
            recommendation="Recall batch and check seal integrity",
            confidence_score=0.88
        )
        session.add(insight)

        await session.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
