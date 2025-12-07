from langgraph.graph import StateGraph, END
from typing import Literal

from .state import VehicleState
from .data_agent import DataAnalysisAgent
from .workers import DiagnosisAgent, CustomerEngagementAgent, SchedulingAgent, RCAAgent
from .ueba import UEBAAgent

# Instantiate Agents
data_agent = DataAnalysisAgent()
diagnosis_agent = DiagnosisAgent()
customer_agent = CustomerEngagementAgent()
scheduling_agent = SchedulingAgent()
rca_agent = RCAAgent()
ueba_agent = UEBAAgent()

# Node Functions
async def data_analysis_node(state: VehicleState):
    print(f"--- Data Analysis [VIN: {state.get('vehicle_id')}] ---")
    # In real app, might fetch history from DB here
    updates = data_agent.analyze(state["current_data"])
    return updates

async def diagnosis_node(state: VehicleState):
    print("--- Diagnosis ---")
    result = diagnosis_agent.diagnose(state["anomaly_reason"], state["current_data"])
    # diagnosis_agent returns severity, we merge it
    return result

async def customer_node(state: VehicleState):
    print("--- Customer Engagement ---")
    # Ensure severity is present
    severity = state.get("severity", "Medium")
    msg = customer_agent.generate_message(state["diagnosis"], severity)
    new_messages = state.get("messages", []) + [{"sender": "ai", "content": msg}]
    return {"messages": new_messages}

async def scheduling_node(state: VehicleState):
    print("--- Scheduling ---")
    # For demo, if Critical/High, we propose slots
    if state.get("severity") in ["Critical", "High"]:
        slots = scheduling_agent.check_availability()
        # Mock auto-book first slot
        booking_id = scheduling_agent.book_appointment(slots[0], state["vehicle_id"])
        msg = f"Automatic Appointment Scheduled: {slots[0]} (ID: {booking_id})"
        new_messages = state.get("messages", []) + [{"sender": "system", "content": msg}]
        return {"booking_id": booking_id, "messages": new_messages}
    return {}

async def rca_node(state: VehicleState):
    print("--- RCA ---")
    # Only run RCA if Critical
    if state.get("severity") == "Critical":
        insight = rca_agent.analyze_failure(state.get("history", []))
        # Log to DB (Mock)
        print(f"RCA Insight Generated: {insight}")
    return {}

# Edge Logic
def route_after_analysis(state: VehicleState) -> Literal["diagnosis", "end"]:
    # UEBA Security Check
    source = "data_analysis"
    target = "diagnosis" if state["anomaly_detected"] else "end"
    
    if not ueba_agent.check_transition(source, target):
        print(f"!!! SECURITY ALERT: UEBA Blocked {source} -> {target}")
        return "end" # Fail safe
        
    return target

# Graph Construction
workflow = StateGraph(VehicleState)

workflow.add_node("data_analysis", data_analysis_node)
workflow.add_node("diagnosis", diagnosis_node)
workflow.add_node("customer_engagement", customer_node)
workflow.add_node("scheduling", scheduling_node)
workflow.add_node("rca", rca_node)

workflow.set_entry_point("data_analysis")

workflow.add_conditional_edges(
    "data_analysis",
    route_after_analysis,
    {
        "diagnosis": "diagnosis",
        "end": END
    }
)
# Helper for UEBA-secured transition
def secure_edge(source: str, target: str):
    def route(state: VehicleState) -> Literal[target, "end"]:
        # Logic to determine if we should proceed (normally always yes for linear steps)
        # But UEBA must validte
        if ueba_agent.check_transition(source, target):
            return target
        print(f"!!! SECURITY ALERT: UEBA Blocked {source} -> {target}")
        return "end"
    return route

# Modified Graph Construction for Security
# Since LangGraph add_edge is unconditional, we must use add_conditional_edges for every step 
# if we want dynamic security checks that can "halt" the process (route to END).

# Diagnosis -> Customer
def route_diagnosis(state: VehicleState):
    if ueba_agent.check_transition("diagnosis", "customer_engagement"):
        return "customer_engagement"
    return END

# Customer -> Scheduling
def route_customer(state: VehicleState):
    if ueba_agent.check_transition("customer_engagement", "scheduling"):
        return "scheduling"
    return END

# Scheduling -> RCA
def route_scheduling(state: VehicleState):
    if ueba_agent.check_transition("scheduling", "rca"):
        return "rca"
    return END
    
# RCA -> END
def route_rca(state: VehicleState):
    # RCA always goes to end, just check if allowed
    if ueba_agent.check_transition("rca", "end"):
        return END
    return END

workflow.add_conditional_edges("diagnosis", route_diagnosis)
workflow.add_conditional_edges("customer_engagement", route_customer)
workflow.add_conditional_edges("scheduling", route_scheduling)
workflow.add_conditional_edges("rca", route_rca)

master_agent = workflow.compile()
