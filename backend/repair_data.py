import asyncio
import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from models import User, Vehicle, AnomalyEvent, AnomalySeverity, UserRole
from security import get_password_hash

from database import DATABASE_URL

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

async def delete_shravan():
    async with async_session() as session:
        print(f"Deleting user: {TARGET_USER['email']}...")
        result = await session.execute(select(User).where(User.email == TARGET_USER['email']))
        user = result.scalars().first()
        if user:
            # Delete vehicle first? Cascade?
            # Manually delete vehicle and anomaly to be safe
            v_res = await session.execute(select(Vehicle).where(Vehicle.owner_id == user.id))
            vehicle = v_res.scalars().first()
            if vehicle:
                await session.execute(select(AnomalyEvent).where(AnomalyEvent.vehicle_id == vehicle.id)) # Just fetch
                # SQLAlchemy relies on session.delete(obj)
                # But let's just delete the user, usually cascade or we ignore.
                # Actually, easier to just use raw SQL or session.delete
                
                # Delete Anomalies
                # Delete Vehicle
                await session.delete(vehicle)
            
            await session.delete(user)
            await session.commit()
            print("Deleted Shravan.")
        else:
            print("User not found to delete.")

if __name__ == "__main__":
    asyncio.run(delete_shravan())
