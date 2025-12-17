import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, selectinload
from models import User, Vehicle, AnomalyEvent
from database import DATABASE_URL

engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

TARGET_EMAIL = "shravankumarsatpathy@gmail.com"

async def diagnose():
    async with async_session() as session:
        print(f"Diagnosing user: {TARGET_EMAIL}")
        
        # Peer into User
        result = await session.execute(select(User).where(User.email == TARGET_EMAIL))
        user = result.scalars().first()
        
        if not user:
            print("ERROR: User NOT found in DB!")
            return

        print(f"User FOUND: ID={user.id}, Name={user.full_name}, Phone={user.phone_number}")
        
        # Peer into Vehicle
        v_res = await session.execute(select(Vehicle).where(Vehicle.owner_id == user.id).options(selectinload(Vehicle.anomalies)))
        vehicle = v_res.scalars().first()
        
        if not vehicle:
            print(f"ERROR: No Vehicle found for Owner ID={user.id}")
            # Check if ANY vehicle has this VIN?
            vin_res = await session.execute(select(Vehicle).where(Vehicle.vin == "OD 06 AP 5653"))
            orphan = vin_res.scalars().first()
            if orphan:
                 print(f"WARN: Vehicle exists with VIN but OwnerID={orphan.owner_id} (Expected {user.id})")
            return

        print(f"Vehicle FOUND: ID={vehicle.id}, VIN={vehicle.vin}, Model={vehicle.model}, Year={vehicle.year}")
        print(f"Vehicle Owner ID matches User ID: {vehicle.owner_id == user.id}")
        
        # Peer into Anomalies
        if vehicle.anomalies:
            print(f"Anomalies Found: {len(vehicle.anomalies)}")
            for a in vehicle.anomalies:
                print(f" - {a.anomaly_type} (Severity: {a.severity}) detected at {a.detected_at}")
        else:
            print("ERROR: Vehicle has NO anomalies.")

if __name__ == "__main__":
    asyncio.run(diagnose())
