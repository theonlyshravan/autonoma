from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import Vehicle, AnomalyEvent
from agents.master import master_agent
from agents.state import VehicleState

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: List[dict]
    vin: str = "EV-8823-X"

import logging
import sys

@router.post("/chat")
async def chat_endpoint(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Fetch Vehicle & Anomalies from DB based on VIN (or hardcode check if req.vin is mock)
        # Ideally, we should trust req.vin, or better, infer from Auth if we had it here.
        query = (
            select(Vehicle)
            .where(Vehicle.vin == req.vin)
            .options(selectinload(Vehicle.anomalies))
        )
        result = await db.execute(query)
        vehicle = result.scalars().first()

        anomaly_detected = False
        anomaly_reason = None
        current_data = {}
        severity = "Low"
        diagnosis = "All systems nominal."

        if vehicle and vehicle.anomalies:
             # Sort finding newest
             anomalies = sorted(vehicle.anomalies, key=lambda x: x.detected_at, reverse=True)
             if anomalies:
                 latest = anomalies[0]
                 # If we have a recent anomaly (assuming all in DB are active for this demo)
                 anomaly_detected = True
                 anomaly_reason = f"{latest.anomaly_type} ({latest.severity})"
                 severity = latest.severity.value if hasattr(latest.severity, 'value') else str(latest.severity)
                 # Use the snapshot from the anomaly event as 'current_data' context
                 diagnosis = f"Detected {latest.anomaly_type}. {latest.sensor_snapshot}"
                 current_data = latest.sensor_snapshot or {}

        # 2. Build Real State
        initial_state: VehicleState = {
            "vehicle_id": req.vin,
            "current_data": current_data, 
            "history": [],
            "anomaly_detected": anomaly_detected,
            "anomaly_reason": anomaly_reason,
            "diagnosis": diagnosis, 
            "severity": severity,
            "messages": req.history + [{"sender": "user", "content": req.message}],
            "show_booking_ui": False,
            "available_slots": []
        }
        
        # 3. Invoke Master Agent
        final_state = await master_agent.ainvoke(initial_state)
        
        # 4. Extract response
        last_message = ""
        full_messages = final_state.get("messages", [])
        if full_messages:
            last_message_obj = full_messages[-1]
            if last_message_obj["sender"] != "user":
                last_message = last_message_obj["content"]
        
        return {
            "response": last_message,
            "show_booking_ui": final_state.get("show_booking_ui", False),
            "available_slots": final_state.get("available_slots", [])
        }
        
    except Exception as e:
        print(f"Chat Error: {e}")
        return {
            "response": "I'm having trouble connecting to the vehicle telemetry. Please try again.",
            "show_booking_ui": False,
            "available_slots": []
        }
