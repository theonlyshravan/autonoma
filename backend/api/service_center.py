from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import random
from datetime import datetime, timedelta

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

# Mock Data Storage
available_slots = ["09:30 AM", "11:00 AM", "01:00 PM", "02:30 PM", "04:00 PM"]
bookings_db: List[BookingSchema] = [
    BookingSchema(
        id="SC-99001", vin="VIN-TESLA-X1", owner="Elon Smith", 
        time="09:30 AM", date="2025-12-10", 
        issue="Autopilot Calibration", severity="Medium", status="CONFIRMED",
        purchase_date="2024-02-20"
    ),
    BookingSchema(
        id="SC-99002", vin="VIN-RIVIAN-R1", owner="Sarah Connor", 
        time="02:30 PM", date="2025-12-12", 
        issue="Suspension Noise", severity="High", status="PENDING",
        purchase_date="2023-11-10"
    )
]

@router.get("/slots", response_model=List[str])
async def get_available_slots(date: str):
    """
    Get available slots for a specific date (YYYY-MM-DD).
    Filters out slots that are already booked in the DB.
    """
    print(f"DEBUG: Fetching slots for date: {date}")
    # 1. Base slots (could be dynamic)
    all_slots = ["09:30 AM", "11:00 AM", "01:00 PM", "02:30 PM", "04:00 PM"]
    
    # 2. Find booked slots for this date
    booked_times = {b.time for b in bookings_db if b.date == date}
    print(f"DEBUG: Booked times for {date}: {booked_times}")
    
    # 3. Filter
    available = [s for s in all_slots if s not in booked_times]
    print(f"DEBUG: Available slots: {available}")
    
    return available

@router.post("/book", response_model=BookingResponse)
async def book_slot(request: BookingRequest):
    """
    Confirm a booking.
    """
    booking_id = f"SC-{random.randint(10000, 99999)}"
    
    # Store in Mock DB
    new_booking = BookingSchema(
        id=booking_id,
        vin=request.vin,
        owner="Auth User", # Mock
        time=request.slot,
        date=request.date,
        issue="Battery Checkup", # Mock context
        severity="High",
        status="CONFIRMED",
        purchase_date="2023-08-01" # Mock purchase date
    )
    bookings_db.append(new_booking)
    
    return BookingResponse(
        booking_id=booking_id,
        status="Confirmed",
        message=f"Appointment booked for {request.date} at {request.slot}."
    )

@router.get("/bookings", response_model=List[BookingSchema])
async def get_all_bookings():
    return bookings_db

@router.get("/booking/{booking_id}", response_model=BookingSchema)
async def get_booking_by_id(booking_id: str):
    """
    Get a specific booking by ID.
    """
    booking = next((b for b in bookings_db if b.id == booking_id), None)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
