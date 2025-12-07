from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio
import os
from simulation.stream_engine import StreamEngine
from agents.master import master_agent

router = APIRouter(tags=["telemetry"])

@router.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected to telemetry stream")
    
    # Check .env for path
    dataset_path = os.getenv("DATASET_PATH", "../dataset/EV_Predictive_Maintenance_Dataset_15min.csv")
    
    # Initialize Stream Engine
    try:
        engine = StreamEngine(file_path=dataset_path, delay_seconds=2.0)
    except FileNotFoundError as e:
        await websocket.close(code=1000, reason=str(e))
        return

    try:
        async for row in engine.stream_data():
            # 1. Send Raw Telemetry to Frontend
            await websocket.send_json({"type": "telemetry", "data": row})
            
            # 2. Invoke Agent System
            # Prepare state
            initial_state = {
                "vehicle_id": "SIM_VEHICLE_001",
                "current_data": row,
                "history": [], # In real app, fetch last N rows
                "anomaly_detected": False,
                "anomaly_reason": None,
                "messages": []
            }
            
            # Run Graph
            result = await master_agent.ainvoke(initial_state)
            
            # 3. Check for Alerts/Diagnosis
            if result.get("anomaly_detected"):
                alert_payload = {
                    "type": "alert",
                    "data": {
                        "reason": result.get("anomaly_reason"),
                        "severity": result.get("severity"),
                        "diagnosis": result.get("diagnosis"),
                        "rul": result.get("rul")
                    }
                }
                await websocket.send_json(alert_payload)
                
                # If there's a new AI message, send it
                if result.get("messages"):
                    last_msg = result["messages"][-1]
                    await websocket.send_json({"type": "chat", "data": last_msg})

    except WebSocketDisconnect:
        print("Client disconnected")
        engine.stop()
    except Exception as e:
        print(f"Error in telemetry stream: {e}")
        engine.stop()
        await websocket.close()
