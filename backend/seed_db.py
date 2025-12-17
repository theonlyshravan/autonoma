
import asyncio
from database import engine, get_db
from models import User, Vehicle
from security import get_password_hash
from sqlalchemy.future import select
import uuid

async def seed_users():
    async with engine.begin() as conn:
        print("Seeding database...")
        # Create a session-like interaction using direct execution or a session maker if available
        # But simpler to just use the engine connection for raw inserts or basic model support if setup
        pass

    # Using a session for ORM convenience
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        # 1. Customer (User) - Amit Patel (Mahindra XUV400)
        amit_result = await session.execute(select(User).where(User.email == "amit@demo.com"))
        if not amit_result.scalars().first():
            user_id = uuid.uuid4()
            user = User(
                id=user_id,
                email="amit@demo.com",
                password_hash=get_password_hash("pass123"),
                full_name="Amit Patel",
                phone_number="+91 98765 43210",
                role="customer"
            )
            session.add(user)
            await session.flush()
            
            # Vehicle
            vehicle_id = uuid.uuid4()
            vehicle = Vehicle(
                id=vehicle_id,
                owner_id=user_id,
                vin="MAHINDRAXUV400EV01",
                model="Mahindra XUV400",
                year=2024,
                vehicle_type="EV"
            )
            session.add(vehicle)

            # Booking (Different Problem)
            from models import ServiceBooking, BookingStatus
            from datetime import datetime
            booking = ServiceBooking(
                id=uuid.uuid4(),
                vehicle_id=vehicle_id,
                service_center_id="SC-001",
                appointment_time=datetime.now(), 
                status=BookingStatus.CONFIRMED,
                customer_notes="Battery Overheating during fast charging"
            )
            session.add(booking)
            print("Added amit@demo.com")

        # 2. Customer - Priya Sharma (Tata Nexon EV)
        priya_result = await session.execute(select(User).where(User.email == "priya@demo.com"))
        if not priya_result.scalars().first():
            user_id = uuid.uuid4()
            user = User(
                id=user_id,
                email="priya@demo.com",
                password_hash=get_password_hash("pass123"),
                full_name="Priya Sharma",
                phone_number="+91 91234 56789",
                role="customer"
            )
            session.add(user)
            await session.flush()
            
            # Vehicle
            vehicle_id = uuid.uuid4()
            vehicle = Vehicle(
                id=vehicle_id,
                owner_id=user_id,
                vin="TATANEXONEVMAX02",
                model="Tata Nexon EV Max",
                year=2023,
                vehicle_type="EV"
            )
            session.add(vehicle)

            # Booking (Different Problem)
            booking = ServiceBooking(
                id=uuid.uuid4(),
                vehicle_id=vehicle_id,
                service_center_id="SC-002",
                appointment_time=datetime.now(),
                status=BookingStatus.PENDING,
                customer_notes="Infotainment screen flickering"
            )
            session.add(booking)
            print("Added priya@demo.com")

        # 3. Customer - Rahul Verma (Ola S1 Pro)
        rahul_result = await session.execute(select(User).where(User.email == "rahul@demo.com"))
        if not rahul_result.scalars().first():
            user_id = uuid.uuid4()
            user = User(
                id=user_id,
                email="rahul@demo.com",
                password_hash=get_password_hash("pass123"),
                full_name="Rahul Verma",
                phone_number="+91 88888 77777",
                role="customer"
            )
            session.add(user)
            await session.flush()
            
            # Vehicle
            vehicle_id = uuid.uuid4()
            vehicle = Vehicle(
                id=vehicle_id,
                owner_id=user_id,
                vin="OLAS1PROGEN203",
                model="Ola S1 Pro",
                year=2024,
                vehicle_type="EV"
            )
            session.add(vehicle)

            # Anomaly Event (Different Problem for Dashboard Simulation)
            from models import AnomalyEvent, AnomalySeverity
            anomaly = AnomalyEvent(
                id=uuid.uuid4(),
                vehicle_id=vehicle_id,
                anomaly_type="Motor Controller Fault",
                severity=AnomalySeverity.High,
                rul_prediction=150.5,
                sensor_snapshot={"motor_temp": 85, "rpm": 0}
            )
            session.add(anomaly)
            print("Added rahul@demo.com")


        # Service and Admin
        if not (await session.execute(select(User).where(User.email == "service@ey.com"))).scalars().first():
            service = User(id=uuid.uuid4(), email="service@ey.com", password_hash=get_password_hash("ey_secure"), full_name="Service Agent", role="service")
            session.add(service)

        if not (await session.execute(select(User).where(User.email == "admin@oem.com"))).scalars().first():
            admin = User(id=uuid.uuid4(), email="admin@oem.com", password_hash=get_password_hash("admin_pass"), full_name="OEM Admin", role="manufacturer")
            session.add(admin)

        await session.commit()
    
    await engine.dispose()
    print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_users())
