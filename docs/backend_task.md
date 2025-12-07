# Backend Implementation Tasks

> **Reference**: See `MAIN_PRD.md` Section G for complete requirements.

## Overview

Build a FastAPI-based agentic orchestration engine using LangGraph for deterministic agent workflows, with dataset streaming, UEBA security monitoring, and database integration.

## 1. Project Setup

### 1.1 Initialize FastAPI Project
- [ ] Create `backend/` directory
- [ ] Create `requirements.txt` with dependencies:
  - fastapi
  - uvicorn
  - websockets
  - pandas
  - numpy
  - scikit-learn
  - langgraph
  - langchain
  - langchain_openai (or langchain_anthropic)
  - asyncpg (or SQLAlchemy with async)
  - python-jose (JWT)
  - passlib (password hashing)
  - python-dotenv
  - pytest
- [ ] Create `main.py` with FastAPI app initialization
- [ ] Setup CORS middleware for frontend access

### 1.2 Folder Structure
```
backend/
├── main.py
├── api/
│   ├── auth.py
│   ├── telemetry.py
│   ├── vehicles.py
│   └── insights.py
├── agents/
│   ├── state.py
│   ├── master.py
│   ├── data_agent.py
│   ├── workers.py
│   └── ueba.py
├── simulation/
│   └── stream_engine.py
├── database.py
├── schemas.py
└── config.py
```

## 2. Database Integration

### 2.1 Database Connection
- [ ] Create `database.py` with async connection pool
- [ ] Use `asyncpg` or `SQLAlchemy` async
- [ ] Load DB URL from environment variable
- [ ] Create `get_db()` dependency for FastAPI

### 2.2 Schema Models (Pydantic)
- [ ] Create `schemas.py` with Pydantic models:
  - `UserCreate`, `UserResponse`
  - `VehicleCreate`, `VehicleResponse`
  - `AnomalyEvent`
  - `Diagnosis`
  - `ServiceBooking`
  - `ManufacturingInsight`
  - `UEBALog`

### 2.3 Database Queries
- [ ] Implement functions in `database.py`:
  - `get_user_by_email(email: str)`
  - `create_anomaly_event(vehicle_id, anomaly_type, severity, snapshot)`
  - `create_diagnosis(anomaly_event_id, diagnosis_text, confidence)`
  - `create_booking(vehicle_id, slot_time, status)`
  - `get_bookings(status: Optional[str])`
  - `create_manufacturing_insight(component, pattern, batch, recommendation)`
  - `log_ueba_action(agent_name, action_type, status)`

## 3. Stream Engine

### 3.1 StreamEngine Class
- [ ] Create `simulation/stream_engine.py`
- [ ] Class `StreamEngine`:
  - `__init__(file_path: str, delay_seconds: float = 2.0)`
  - `load_data()`: Load CSV into Pandas DataFrame
  - `async stream_data()`: Async generator yielding rows as dicts
  - `stop()`: Method to halt streaming

### 3.2 CSV Row Processing
- [ ] Handle missing values (fill with 0 or mean)
- [ ] Convert timestamp to ISO format string
- [ ] Ensure numeric types are JSON-serializable (convert numpy types)

### 3.3 Looping Logic
- [ ] When DataFrame end is reached, reset index to 0
- [ ] Continue streaming indefinitely for demo

## 4. Agent System (LangGraph)

### 4.1 Agent State Definition
- [ ] Create `agents/state.py`
- [ ] Define `VehicleState` TypedDict:
  ```python
  class VehicleState(TypedDict):
      vehicle_id: str
      current_data: Dict[str, Any]
      history: List[Dict[str, Any]]
      anomaly_detected: bool
      anomaly_reason: Optional[str]
      diagnosis: Optional[str]
      severity: str
      rul: float
      messages: List[Dict[str, str]]
      booking_id: Optional[str]
      error: Optional[str]
  ```

### 4.2 Data Analysis Agent
- [ ] Create `agents/data_agent.py`
- [ ] Class `DataAnalysisAgent`:
  - `analyze(vehicle_data: dict) -> dict`:
    - Check thresholds (e.g., `battery_temp > 45`, `vibration > 2.0`)
    - Set `anomaly_detected`, `anomaly_reason`
    - Calculate RUL (simple formula or mock value)

### 4.3 Worker Agents
- [ ] Create `agents/workers.py` with classes:
  - `DiagnosisAgent`:
    - `diagnose(anomaly_reason: str) -> dict`
    - Map anomaly to diagnosis (use dict lookup)
    - Return `diagnosis_text` and `severity`
  - `CustomerEngagementAgent`:
    - `generate_message(diagnosis: str, severity: str) -> str`
    - Create user-friendly text
  - `SchedulingAgent`:
    - `check_availability() -> List[str]` (mock slots)
    - `book_appointment(slot, vehicle_id) -> dict`
  - `RCAAgent`:
    - `analyze_failure(history) -> dict`
    - Generate manufacturing insight

### 4.4 Master Agent & LangGraph
- [ ] Create `agents/master.py`
- [ ] Define Node Functions:
  - `data_analysis_node(state: VehicleState) -> dict`
  - `diagnosis_node(state: VehicleState) -> dict`
  - `customer_engagement_node(state: VehicleState) -> dict`
  - `scheduling_node(state: VehicleState) -> dict`
  - `rca_node(state: VehicleState) -> dict`
- [ ] Define Routing Functions:
  - `route_after_analysis(state) -> Literal["diagnosis", "end"]`
  - Check `state["anomaly_detected"]`
- [ ] Build StateGraph:
  - Add nodes
  - Set entry point to `data_analysis`
  - Add conditional edges
  - Compile graph

## 5. UEBA Security Layer

### 5.1 UEBA Agent
- [ ] Create `agents/ueba.py`
- [ ] Class `UEBAAgent`:
  - Define `ALLOWED_TRANSITIONS` dict
  - `check_transition(source: str, target: str) -> bool`
  - `log_attempt(source, target, status, db)`

### 5.2 Integration with Master
- [ ] In routing functions, call `ueba.check_transition()` before returning next node
- [ ] If blocked, set `state["error"]` and return "end"
- [ ] Log all attempts to `ueba_logs` table

## 6. API Endpoints

### 6.1 Authentication
- [ ] Create `api/auth.py`
- [ ] Route: `POST /api/auth/login`
  - Validate email/password against DB
  - Hash password check using `passlib`
  - Generate JWT using `python-jose`
  - Return `{"access_token": token, "user": {...}}`

### 6.2 Telemetry WebSocket
- [ ] Create `api/telemetry.py`
- [ ] Route: `WS /ws/telemetry`
  - Accept WebSocket connection
  - Initialize `StreamEngine` with primary dataset
  - Loop:
    - Get next row from stream
    - Send as JSON: `{"type": "telemetry", "data": row}`
    - Run Agent Graph with row as input
    - If anomaly detected, send alert: `{"type": "alert", "data": {...}}`
  - Handle disconnection

### 6.3 Vehicle History
- [ ] Create `api/vehicles.py`
- [ ] Route: `GET /api/vehicles/{vin}/history`
  - Fetch vehicle by VIN
  - Fetch anomaly events for vehicle
  - Join with diagnoses
  - Return list of events

### 6.4 Bookings
- [ ] Route: `GET /api/bookings`
  - Query param: `status` (optional)
  - Fetch bookings, optionally filtered
- [ ] Route: `POST /api/bookings`
  - Body: `{vehicle_id, slot_time, notes}`
  - Call `SchedulingAgent.book_appointment()`
  - Return booking ID

### 6.5 Manufacturing Insights
- [ ] Create `api/insights.py`
- [ ] Route: `GET /api/insights`
  - Fetch from `manufacturing_insights` table
  - Return list ordered by created_at DESC

## 7. Main Application

### 7.1 FastAPI App Init
- [ ] In `main.py`:
  - Create FastAPI instance
  - Add CORS middleware
  - Include routers: auth, telemetry, vehicles, insights
  - Health check endpoint: `GET /api/health`

### 7.2 Startup/Shutdown Events
- [ ] `@app.on_event("startup")`: Initialize DB connection pool
- [ ] `@app.on_event("shutdown")`: Close DB connections

## 8. Testing Tasks

### 8.1 Unit Tests
- [ ] Test `DataAnalysisAgent.analyze()`:
  - Input with `battery_temp=50` → Assert `anomaly_detected=True`
  - Input with normal values → Assert `anomaly_detected=False`
- [ ] Test `DiagnosisAgent.diagnose()`:
  - Input "High Battery Temp" → Assert correct diagnosis
- [ ] Test `UEBAAgent.check_transition()`:
  - Valid transition → Assert True
  - Invalid transition → Assert False

### 8.2 Integration Tests
- [ ] Test `/api/auth/login`:
  - Valid credentials → Assert 200, token present
  - Invalid credentials → Assert 401
- [ ] Test Agent Graph execution:
  - Mock state with anomaly → Assert final state has diagnosis
- [ ] Test WebSocket:
  - Connect, receive messages, assert telemetry type

### 8.3 Database Tests
- [ ] Test `create_anomaly_event()`:
  - Insert record → Query back → Assert fields match
- [ ] Test foreign key constraint:
  - Try creating booking with non-existent vehicle_id → Assert error

## Configuration

### Environment Variables (.env)
```
DATABASE_URL=postgresql://user:pass@localhost/autonoma
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
DATASET_PATH=../dataset/EV_Predictive_Maintenance_Dataset_15min.csv
```

### Run Commands
- Development: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- Tests: `pytest -v`
