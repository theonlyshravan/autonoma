import asyncio
import uuid
import random
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, selectinload
from models import User, Vehicle, AnomalyEvent, AnomalySeverity
from database import DATABASE_URL

engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

ANOMALY_TYPES = [
    ("Battery Overheating", AnomalySeverity.Critical, {"temp": 85, "voltage": 380}),
    ("Motor Tech Malfunction", AnomalySeverity.High, {"rpm": 0, "current": 12}),
    ("Inverter Low Efficiency", AnomalySeverity.Medium, {"efficiency": 0.75}),
    ("Touchscreen Glitch", AnomalySeverity.Low, {"response_time": 500})
]

async def seed_anomalies():
    async with async_session() as session:
        print("Scanning for healthy vehicles...")
        
        # Get all vehicles
        result = await session.execute(select(Vehicle).options(selectinload(Vehicle.anomalies), selectinload(Vehicle.owner)))
        vehicles = result.scalars().all()
        
        for v in vehicles:
            if not v.anomalies:
                print(f"Vehicle {v.vin} (Owner: {v.owner.full_name}) is HEALTHY. Infecting...")
                
                name, sev, snap = random.choice(ANOMALY_TYPES)
                
                # Make Amit specific if possible to match "Battery" narrative? Random is fine as long as not Brake Failure.
                if v.owner.email == "amit@demo.com":
                    name = "Battery Overheating"
                    sev = AnomalySeverity.Critical
                
                anomaly = AnomalyEvent(
                    id=uuid.uuid4(),
                    vehicle_id=v.id,
                    anomaly_type=name,
                    severity=sev,
                    rul_prediction=float(random.randint(10, 100)),
                    sensor_snapshot=snap
                )
                session.add(anomaly)
            else:
                 print(f"Vehicle {v.vin} (Owner: {v.owner.full_name}) already has {len(v.anomalies)} anomalies. Skipping.")
        
        await session.commit()
        print("Infection complete.")

if __name__ == "__main__":
    asyncio.run(seed_anomalies())
