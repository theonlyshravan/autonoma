from typing import TypedDict, List, Dict, Any, Optional

class VehicleState(TypedDict):
    vehicle_id: str
    current_data: Dict[str, Any]
    history: List[Dict[str, Any]]
    anomaly_detected: bool
    anomaly_reason: Optional[str]
    diagnosis: Optional[str]
    severity: Optional[str]
    rul: Optional[float]
    messages: List[Dict[str, str]]
    booking_id: Optional[str]
    error: Optional[str]
