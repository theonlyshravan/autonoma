from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import Vehicle, User, AnomalyEvent
from api.auth import get_current_user

router = APIRouter(tags=["vehicles"])

@router.get("/my-status")
async def get_my_vehicle_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch User's Vehicle
    result = await db.execute(select(Vehicle).where(Vehicle.owner_id == current_user.id).options(selectinload(Vehicle.anomalies)))
    vehicle = result.scalars().first()
    
    if not vehicle:
        return {"vehicle": None, "anomaly": None}

    # Get latest anomaly
    # anomalies are eager loaded, but just in case
    latest_anomaly = None
    if vehicle.anomalies:
        # Sort by date
        sorted_anomalies = sorted(vehicle.anomalies, key=lambda x: x.detected_at, reverse=True)
        latest_anomaly = sorted_anomalies[0]
        
    return {
        "user": {
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone_number": current_user.phone_number
        },
        "vehicle": {
            "vin": vehicle.vin,
            "model": vehicle.model,
            "year": vehicle.year
        },
        "anomaly": {
            "type": latest_anomaly.anomaly_type,
            "severity": latest_anomaly.severity.value,
            "description": f"Sensors indicate {latest_anomaly.anomaly_type}" 
            # Note: storing detailed msg in diagnosis or inferring
        } if latest_anomaly else None
    }

