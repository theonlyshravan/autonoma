from fastapi import APIRouter
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])

# Mock Data
MOCK_BOOKINGS = [
    {"id": "BK-1001", "vin": "EV-8823-X", "owner": "Alice Doe", "time": "2025-10-25 10:00 AM", "status": "PENDING", "issue": "Battery Thermal Warning"},
    {"id": "BK-1002", "vin": "ICE-4040-Y", "owner": "Bob Smith", "time": "2025-10-25 02:00 PM", "status": "CONFIRMED", "issue": "Vibration / Mount Check"},
    {"id": "BK-1003", "vin": "EV-9900-Z", "owner": "Charlie Day", "time": "2025-10-26 09:00 AM", "status": "COMPLETED", "issue": "Routine Inspection"}
]

@router.get("/{vin}/history")
async def get_vehicle_history(vin: str):
    # Return mock anomaly history
    return [
        {
            "id": "e1",
            "timestamp": (datetime.now() - timedelta(minutes=15)).isoformat(),
            "anomaly_type": "Battery Temp High",
            "severity": "High",
            "diagnosis": "Coolant pump obstruction detected.",
            "confidence": 0.92
        },
        {
            "id": "e2",
            "timestamp": (datetime.now() - timedelta(hours=24)).isoformat(),
            "anomaly_type": "Vibration Spike",
            "severity": "Medium",
            "diagnosis": "Uneven road surface or minor tire imbalance.",
            "confidence": 0.75
        }
    ]

@router.get("/bookings/all")
async def get_all_bookings(status: str = None):
    if status:
        return [b for b in MOCK_BOOKINGS if b["status"] == status]
    return MOCK_BOOKINGS
