import pytest
from agents.master import master_agent
from agents.state import VehicleState

@pytest.mark.asyncio
async def test_agent_flow_normal():
    # Normal Data
    initial_state = {
        "vehicle_id": "TEST_VIN_001",
        "current_data": {"battery_temperature": 25, "vibration_level": 1},
        "history": [],
        "anomaly_detected": False,
        "anomaly_reason": None,
        "messages": []
    }
    
    final_state = await master_agent.ainvoke(initial_state)
    
    assert final_state["anomaly_detected"] is False
    assert "diagnosis" not in final_state or final_state["diagnosis"] is None
    # Assuming end node returns

@pytest.mark.asyncio
async def test_agent_flow_anomaly_critical():
    # Critical Anomaly Data
    initial_state = {
        "vehicle_id": "TEST_VIN_002",
        "current_data": {"battery_temperature": 75, "vibration_level": 2},
        "history": [],
        "anomaly_detected": False, # Will be set by data_agent
        "anomaly_reason": None,
        "messages": []
    }
    
    final_state = await master_agent.ainvoke(initial_state)
    
    assert final_state["anomaly_detected"] is True
    assert final_state["severity"] == "Critical"
    assert "Thermal Runaway" in final_state["diagnosis"]
    
    # Check if message was generated
    assert len(final_state["messages"]) > 0
    assert "WARNING" in final_state["messages"][0]["content"]
    
    # Check if scheduling happened
    assert "booking_id" in final_state
    assert final_state["booking_id"].startswith("BK-")
