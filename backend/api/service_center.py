from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import random
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import ServiceBooking, Vehicle, User, BookingStatus

router = APIRouter()

class BookingRequest(BaseModel):
    vin: str
    slot: str
    service_type: str = "General Checkup"
    date: str # YYYY-MM-DD

class BookingResponse(BaseModel):
    booking_id: str
    status: str
    message: str

class BookingSchema(BaseModel):
    id: str
    vin: str
    owner: str = "Unknown"
    time: str
    date: str
    issue: str = "Scheduled Service"
    severity: str = "Medium"
    status: str = "PENDING"
    purchase_date: str = "2023-05-15"

@router.get("/slots", response_model=List[str])
async def get_available_slots(date: str, db: AsyncSession = Depends(get_db)):
    """
    Get available slots for a specific date (YYYY-MM-DD).
    """
    # 1. Base slots
    all_slots = ["09:30 AM", "11:00 AM", "01:00 PM", "02:30 PM", "04:00 PM"]
    
    # 2. Find booked slots from DB
    # Filter bookings where the date part of appointment_time matches the requested date
    # and status is CONFIRMED.
    stmt = select(ServiceBooking).where(
        ServiceBooking.status == BookingStatus.CONFIRMED
    )
    result = await db.execute(stmt)
    bookings = result.scalars().all()

    booked_times = []
    for b in bookings:
        if b.appointment_time:
             # Check if date matches
             if b.appointment_time.strftime("%Y-%m-%d") == date:
                 # Add time to booked_times in "%I:%M %p" format
                 booked_times.append(b.appointment_time.strftime("%I:%M %p"))

    # 3. Filter available slots
    available_slots = [slot for slot in all_slots if slot not in booked_times]
    
    return available_slots

@router.post("/book", response_model=BookingResponse)
async def book_slot(request: BookingRequest, db: AsyncSession = Depends(get_db)):
    # Find Vehicle
    result = await db.execute(select(Vehicle).where(Vehicle.vin == request.vin))
    vehicle = result.scalars().first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    import uuid
    
    # Combine date and slot to create appointment_time
    # request.date is YYYY-MM-DD, request.slot is HH:MM AM/PM
    try:
        dt_str = f"{request.date} {request.slot}"
        appointment_time = datetime.strptime(dt_str, "%Y-%m-%d %I:%M %p")
    except ValueError:
        # Fallback if format is wrong, though frontend should send correct format
        appointment_time = datetime.now()

    new_booking = ServiceBooking(
        id=uuid.uuid4(),
        vehicle_id=vehicle.id,
        service_center_id="SC-WEB",
        appointment_time=appointment_time,
        status=BookingStatus.CONFIRMED,
        customer_notes=request.service_type
    )
    db.add(new_booking)
    await db.commit()
    
    return BookingResponse(
        booking_id=str(new_booking.id),
        status="Confirmed",
        message=f"Appointment booked for {request.date} at {request.slot}."
    )

@router.get("/bookings", response_model=List[BookingSchema])
async def get_all_bookings(db: AsyncSession = Depends(get_db)):
    # Eager load vehicle and owner
    stmt = select(ServiceBooking).options(
        selectinload(ServiceBooking.vehicle).selectinload(Vehicle.owner)
    )
    result = await db.execute(stmt)
    bookings = result.scalars().all()
    
    output = []
    for b in bookings:
        # Format time/date from b.appointment_time
        # Use placeholders if None
        dt = b.appointment_time if b.appointment_time else datetime.now()
        
        owner_name = b.vehicle.owner.full_name if b.vehicle and b.vehicle.owner else "Unknown"
        vin = b.vehicle.vin if b.vehicle else "Unknown"
        
        output.append(BookingSchema(
            id=str(b.id),
            vin=vin,
            owner=owner_name,
            time=dt.strftime("%I:%M %p"),
            date=dt.strftime("%Y-%m-%d"),
            issue=b.customer_notes or "Service Check",
            severity="Medium", # DB doesn't store booking severity yet, modify model or infer
            status=b.status.value,
            purchase_date=str(b.vehicle.year) if b.vehicle else "2024" # Mocking purchase date with year
        ))
    return output

import uuid

@router.get("/booking/{booking_id}", response_model=BookingSchema)
async def get_booking_by_id(booking_id: str, db: AsyncSession = Depends(get_db)):
    try:
        bid = uuid.UUID(booking_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
        
    stmt = select(ServiceBooking).where(ServiceBooking.id == bid).options(
        selectinload(ServiceBooking.vehicle).selectinload(Vehicle.owner)
    )
    result = await db.execute(stmt)
    b = result.scalars().first()
    
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    dt = b.appointment_time if b.appointment_time else datetime.now()
    owner_name = b.vehicle.owner.full_name if b.vehicle and b.vehicle.owner else "Unknown"
    vin = b.vehicle.vin if b.vehicle else "Unknown"

    return BookingSchema(
        id=str(b.id),
        vin=vin,
        owner=owner_name,
        time=dt.strftime("%I:%M %p"),
        date=dt.strftime("%Y-%m-%d"),
        issue=b.customer_notes or "Service Check",
        severity="Medium",
        status=b.status.value,
        purchase_date=str(b.vehicle.year) if b.vehicle else "2024"
    )
