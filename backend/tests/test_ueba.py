import pytest
from agents.ueba import UEBAAgent
from agents.master import master_agent

# Unit Test for UEBA Agent
class TestUEBAAgent:
    @pytest.fixture
    def agent(self):
        return UEBAAgent()

    def test_allowed_transition(self, agent):
        assert agent.check_transition("data_analysis", "diagnosis") is True
        assert agent.check_transition("diagnosis", "customer_engagement") is True

    def test_blocked_transition(self, agent):
        assert agent.check_transition("data_analysis", "rca") is False
        assert agent.check_transition("customer", "manufacturing") is False

    def test_case_insensitivity(self, agent):
        assert agent.check_transition("Data_Analysis", "Diagnosis") is True

# Integration Test (Mocking via Graph execution)
@pytest.mark.asyncio
async def test_ueba_integration_flow():
    # Execute a flow that should pass all UEBA checks
    state = {
        "vehicle_id": "SECURE_TEST_01",
        "current_data": {"battery_temperature": 75, "vibration_level": 2},
        "history": [],
        "anomaly_detected": True, # Should trigger diagnosis
        "anomaly_reason": "Test Anomaly",
        "messages": []
    }
    
    # If UEBA blocks, the graph would stop early or raise error
    # Here we expect it to reach CustomerEngagement (generate message)
    final_state = await master_agent.ainvoke(state)
    
    assert len(final_state["messages"]) > 0
    assert "diagnosis" in final_state
    
    # Check console logs for "[UEBA LOG]" (Manual Verify)
