from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any
from agents.master import master_agent
from agents.state import VehicleState

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: List[dict]
    vin: str = "EV-8823-X"

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        # Mock Context (In real app, fetch from DB/State)
        # We need to simulate the "Battery Overheating" context for the agent to behave correctly
        initial_state: VehicleState = {
            "vehicle_id": req.vin,
            "current_data": {"battery_temperature": 65}, # Trigger Critical/High
            "history": [],
            "anomaly_detected": True,
            "anomaly_reason": "battery temperature rises",
            "diagnosis": "Battery Cell #4 Overheating", # Pre-populated for chat context
            "severity": "Critical",
            "messages": req.history + [{"sender": "user", "content": req.message}],
            "show_booking_ui": False,
            "available_slots": []
        }
        
        # Invoke Master Agent
        final_state = await master_agent.ainvoke(initial_state)
        
        # Extract response
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
        # Return fallback to keep UI alive
        return {
            "response": "I'm encountering some interference. Please try again.",
            "show_booking_ui": False,
            "available_slots": []
        }
