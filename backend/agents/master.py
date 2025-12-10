from langgraph.graph import StateGraph, END
from typing import Literal

from .state import VehicleState
from .data_agent import DataAnalysisAgent
from .workers import DiagnosisAgent, CustomerEngagementAgent, SchedulingAgent, RCAAgent
from .ueba import UEBAAgent
from .feedback import FeedbackAgent

# Instantiate Agents
data_agent = DataAnalysisAgent()
diagnosis_agent = DiagnosisAgent()
customer_agent = CustomerEngagementAgent()
scheduling_agent = SchedulingAgent()
rca_agent = RCAAgent()
ueba_agent = UEBAAgent()
feedback_agent = FeedbackAgent()

# Node Functions
async def data_analysis_node(state: VehicleState):
    print(f"--- Data Analysis [VIN: {state.get('vehicle_id')}] ---")
    updates = data_agent.analyze(state["current_data"])
    return updates

async def diagnosis_node(state: VehicleState):
    print("--- Diagnosis ---")
    result = diagnosis_agent.diagnose(state["anomaly_reason"], state["current_data"])
    return result

async def customer_node(state: VehicleState):
    print("--- Customer Engagement (Gemini) ---")
    severity = state.get("severity", "Medium")
    
    response_data = await customer_agent.generate_message(
        diagnosis=state.get("diagnosis", "Unknown Issue"), 
        severity=severity, 
        conversation_history=state.get("messages", [])
    )
    
    new_messages = state.get("messages", []) + [{"sender": "ai", "content": response_data["content"]}]
    
    return {
        "messages": new_messages,
        "show_booking_ui": response_data["show_booking"],
        "booking_intent": response_data.get("booking_intent")
    }

async def scheduling_node(state: VehicleState):
    print("--- Scheduling ---")
    
    # CASE 1: Booking Intent (Confirmation)
    intent = state.get("booking_intent")
    if intent:
        booking_id = await scheduling_agent.book_appointment(
            slot=intent["time"], 
            date=intent["date"], 
            vehicle_id=state.get("vehicle_id", "Unknown")
        )
        # Add confirmation message
        success_msg = f"Booking Confirmed! ID: {booking_id}. See you on {intent['date']} at {intent['time']}."
        new_messages = state.get("messages", []) + [{"sender": "ai", "content": success_msg}]
        return {
            "booking_id": booking_id,
            "booking_intent": None, # Clear intent
            "messages": new_messages
        }

    # CASE 2: Show Booking UI Request
    if state.get("show_booking_ui"):
        # Fetch slots for tomorrow (mock)
        import datetime
        tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
        slots = await scheduling_agent.get_available_slots(tomorrow)
        return {"available_slots": slots}

    # Legacy: Auto-book if Critical (Optional fallback)
    if state.get("severity") in ["Critical", "High"] and not state.get("show_booking_ui"):
        pass
        
    return {}

async def rca_node(state: VehicleState):
    print("--- RCA ---")
    if state.get("severity") == "Critical":
        insight = rca_agent.analyze_failure(state.get("history", []))
        print(f"RCA Insight Generated: {insight}")
    return {}

# Edge Logic
def route_after_analysis(state: VehicleState) -> Literal["diagnosis", "end"]:
    target = "diagnosis" if state["anomaly_detected"] else "end"
    if not ueba_agent.check_transition("data_analysis", target):
        return "end"
    return target

# Graph Construction
workflow = StateGraph(VehicleState)

workflow.add_node("data_analysis", data_analysis_node)
workflow.add_node("diagnosis", diagnosis_node)
workflow.add_node("customer_engagement", customer_node)
workflow.add_node("scheduling", scheduling_node)
workflow.add_node("rca", rca_node)

workflow.set_entry_point("data_analysis")

workflow.add_conditional_edges("data_analysis", route_after_analysis, {"diagnosis": "diagnosis", "end": END})

def route_diagnosis(state: VehicleState):
    if ueba_agent.check_transition("diagnosis", "customer_engagement"):
        return "customer_engagement"
    return END

def route_customer(state: VehicleState):
    # If booking requested, go to scheduling
    if state.get("show_booking_ui") or state.get("booking_intent"):
        if ueba_agent.check_transition("customer_engagement", "scheduling"):
            return "scheduling"
    return END

def route_scheduling(state: VehicleState):
    # After scheduling (fetching slots), we return to user (END of backend process, frontend takes over)
    # sending slots to frontend
    return END

def route_rca(state: VehicleState):
    return END

workflow.add_conditional_edges("diagnosis", route_diagnosis)
workflow.add_conditional_edges("customer_engagement", route_customer)
workflow.add_conditional_edges("scheduling", route_scheduling)
workflow.add_conditional_edges("rca", route_rca)

master_agent = workflow.compile()
