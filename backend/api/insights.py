from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/api/insights", tags=["insights"])

@router.get("/")
async def get_manufacturing_insights():
    return [
        {
            "id": "INS-001",
            "component": "HV Battery Cooling Pump",
            "pattern": "Thermal runaway correlations in Batch B-2025",
            "affected_batch": "B-2025",
            "recommendation": "Recall and replace seals in Batch B-2025 units.",
            "confidence": 0.95,
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "INS-002",
            "component": "Motor Mount Standard",
            "pattern": "High vibration resonance at 6000 RPM",
            "affected_batch": "Gen3-Mounts",
            "recommendation": "Update dampening firmware or stiffen mounts.",
            "confidence": 0.88,
            "created_at": datetime.now().isoformat()
        }
    ]
