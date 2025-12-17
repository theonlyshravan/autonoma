import asyncio
import uuid
import random
from models import User, Vehicle, AnomalyEvent, AnomalySeverity, UserRole, VehicleType
from security import get_password_hash
from database import DATABASE_URL
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

TARGET_USER = {
    "email": "shravankumarsatpathy@gmail.com",
    "password": "SKS123",
    "full_name": "theonly_shravan",
    "phone_number": "+91 6425798562",
    "vehicle_vin": "OD 06 AP 5653",
    "vehicle_model": "Mahindra XUV 700",
    "vehicle_year": 2019
}

async def register_shravan_direct():
    async with async_session() as session:
        print(f"Registering user: {TARGET_USER['email']}...")
        
        # Check existing
        result = await session.execute(select(User).where(User.email == TARGET_USER['email']))
        if result.scalars().first():
            print("User already exists (unexpected after delete). Skipping.")
            return

        # 1. Create User
        user_id = uuid.uuid4()
        user = User(
            id=user_id,
            email=TARGET_USER['email'],
            password_hash=get_password_hash(TARGET_USER['password']),
            full_name=TARGET_USER['full_name'],
            phone_number=TARGET_USER['phone_number'],
            role=UserRole.customer
        )
        session.add(user)
        await session.flush()
        
        # 2. Create Vehicle
        vehicle = Vehicle(
            id=uuid.uuid4(),
            owner_id=user.id,
            vin=TARGET_USER['vehicle_vin'],
            model=TARGET_USER['vehicle_model'],
            year=TARGET_USER['vehicle_year'],
            vehicle_type=VehicleType.ICE
        )
        session.add(vehicle)
        await session.flush()
        
        # 3. Create Anomaly (Fix "No Problem" issue)
        anomaly = AnomalyEvent(
            id=uuid.uuid4(),
            vehicle_id=vehicle.id,
            anomaly_type="Critical Brake Failure",
            severity=AnomalySeverity.High,
            rul_prediction=45.0,
            sensor_snapshot={"brake_pressure": 12, "fluid": 10}
        )
        session.add(anomaly)
        
        await session.commit()
        print("Registration complete for Shravan.")

if __name__ == "__main__":
    asyncio.run(register_shravan_direct())
