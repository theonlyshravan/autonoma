# Autonoma - Product Requirements Document

## A. Problem Statement & Why Autonoma Exists

### The Automotive Predictive Maintenance Problem

Modern automotive OEMs face critical challenges in their aftersales operations:

**Failure Detection Gaps**: Vehicles generate massive amounts of telemetry data, but most OEMs lack systems to autonomously interpret this data to predict failures before they occur. Customers experience unexpected breakdowns, leading to safety concerns and poor brand perception.

**Service Scheduling Inefficiencies**: Service centers operate reactively rather than proactively. Without predictive insights, scheduling is uneven—centers are either overwhelmed or underutilized. Customers face long wait times and inconvenient appointments.

**Manufacturing Feedback Loop Failure**: Critical insights from field failures rarely reach manufacturing teams in a structured way. Root Cause Analysis (RCA) and Corrective and Preventive Action (CAPA) data remains siloed in service logs, preventing design improvements and recurring defect prevention.

### How Autonoma Solves It

**Autonoma** is an autonomous predictive maintenance and service intelligence system that closes these gaps through an agentic AI architecture. It:

- **Predicts failures** by continuously analyzing real-time vehicle sensor data
- **Autonomously schedules** service appointments by coordinating with customers and service centers
- **Feeds manufacturing insights** back to design teams through automated RCA/CAPA analysis
- **Ensures security** through User and Entity Behavior Analytics (UEBA) monitoring of all autonomous actions

## B. Overview of the Solution

### System Architecture

Autonoma employs a **Master-Worker Agent Architecture** where a central orchestrator (Master Agent) coordinates multiple specialized Worker Agents to handle end-to-end predictive maintenance workflows.

**Core Components**:

1. **Data Streaming Layer**: Simulates real-time vehicle telemetry by replaying CSV datasets row-by-row
2. **Agent Orchestration Layer**: LangGraph-based workflow managing agent state and transitions
3. **Database Layer**: PostgreSQL storing users, vehicles, events, diagnoses, and insights
4. **Frontend Layer**: Role-based Next.js dashboards for customers, service centers, and manufacturers
5. **Security Layer**: UEBA monitoring all agent actions and blocking unauthorized flows

**Agent Hierarchy**:

- **Master Agent**: Central orchestrator managing state, routing tasks, and enforcing UEBA rules
- **Data Analysis Agent**: Monitors telemetry streams, detects anomalies, calculates Remaining Useful Life (RUL)
- **Diagnosis Agent**: Maps anomalies to root causes using pattern matching
- **Customer Engagement Agent**: Generates human-friendly messages and manages approval workflows
- **Scheduling Agent**: Coordinates service center availability with customer preferences
- **RCA/CAPA Agent**: Aggregates failure patterns and generates manufacturing insights
- **UEBA Agent**: Security monitor that validates all inter-agent transitions

### Dataset-Driven Real-Time Simulation

The prototype uses actual vehicle datasets extracted to `/dataset/`:
- `EV_Predictive_Maintenance_Dataset_15min.csv` (Electric Vehicle telemetry)
- `OBD-II Driving Data - Classified.csv` (Internal Combustion Engine telemetry)
- `Data_Driver1.csv`, `Data_Driver2.csv`, `Data_Driver3.csv` (Driving behavior data)

A **Stream Engine** reads these CSVs and emits rows at 1-2 second intervals, simulating live IoT sensor feeds from active vehicles.

### Role-Based Dashboards

Three distinct user experiences:

1. **Customer Dashboard**: View vehicle health, receive AI-generated alerts, approve service bookings
2. **Service Center Dashboard**: Monitor appointment queue, view diagnostic details
3. **Manufacturing Dashboard**: Analyze recurring defect patterns, view RCA insights

## C. Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Backend** | FastAPI (Python) | Async support, clean APIs, ML integration |
| **Agent Framework** | LangGraph | Deterministic state management for agent orchestration |
| **Database** | PostgreSQL / Supabase | Relational integrity, production-grade, easy auth |
| **Frontend** | Next.js (React, TypeScript) | Premium UI, SSR, routing, TypeScript safety |
| **Real-time** | WebSockets | Bi-directional streaming for live telemetry |
| **ML/Analytics** | Scikit-learn, Pandas | Anomaly detection, RUL prediction |
| **Charts** | Recharts | React-native charting for real-time graphs |
| **Styling** | TailwindCSS | Utility-first, rapid premium UI development |

## D. Functional Requirements

### End-to-End Flow

**1. Data Streaming**
- Stream Engine loads CSV from `/dataset/`
- Emits sensor readings (RPM, temperature, vibration, battery SoC, etc.) every 1-2 seconds
- Pushes data to Data Analysis Agent via internal queue

**2. Data Analysis Agent**
- Receives telemetry row
- Applies threshold-based anomaly detection (e.g., battery_temp > 45°C)
- Calculates Remaining Useful Life using degradation models
- Sets `anomaly_detected` flag and routes to Master Agent

**3. Master Agent Orchestration**
- Receives state from Data Analysis Agent
- **UEBA Check**: Validates transition is allowed
- Routes to Diagnosis Agent if anomaly detected
- Maintains global vehicle state and conversation history

**4. Diagnosis Agent**
- Maps anomaly patterns to root causes
- Example: "High Battery Temp + Low Voltage" → "Thermal Runaway Risk"
- Assigns severity level (Low, Medium, High, Critical)
- Returns diagnosis to Master Agent

**5. Customer Engagement Agent**
- Generates user-friendly message from technical diagnosis
- Example: "URGENT: Battery thermal management failure detected. Immediate service recommended."
- Presents via chat interface
- Requests user approval for service booking

**6. Scheduling Agent**
- Queries `service_bookings` table for available slots
- Presents options to customer via chat
- Upon approval, writes booking record with CONFIRMED status

**7. RCA/CAPA Agent**
- Aggregates failure patterns from `diagnoses` table
- Identifies recurring issues (e.g., "Batch B-2025 battery thermal failures")
- Writes actionable insights to `manufacturing_insights` table
- Visible in Manufacturing Dashboard

**8. UEBA Monitoring**
- Intercepts all agent state transitions
- Validates against allowed flows (e.g., Data → Diagnosis allowed, Customer → Manufacturing blocked)
- Logs all attempts to `ueba_logs` table
- Raises security exception if unauthorized action detected

### Role-Based Dashboard Access

**Customer**:
- View own vehicle telemetry (real-time charts)
- Receive AI alerts via chat interface
- Approve/decline service bookings
- View service history

**Service Center**:
- View all pending appointments
- Access vehicle diagnostic details
- Update booking status (PENDING → CONFIRMED → COMPLETED)

**Manufacturer**:
- View aggregated failure trends
- Access RCA/CAPA insights
- Filter by component, batch, time range
- Export reports

## E. Database Requirements

### Schema Design

**users**
```sql
CREATE TYPE user_role AS ENUM ('customer', 'service', 'manufacturer');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**vehicles**
```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vin TEXT UNIQUE NOT NULL,
    model TEXT NOT NULL,
    year INT,
    vehicle_type TEXT CHECK (vehicle_type IN ('EV', 'ICE')),
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**telemetry_logs** (Optional - for replay/audit)
```sql
CREATE TABLE telemetry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id),
    timestamp TIMESTAMPTZ DEFAULT now(),
    sensor_data JSONB NOT NULL
);
```

**anomaly_events**
```sql
CREATE TABLE anomaly_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id),
    detected_at TIMESTAMPTZ DEFAULT now(),
    anomaly_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    sensor_snapshot JSONB,
    rul_prediction FLOAT
);
```

**diagnoses**
```sql
CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anomaly_event_id UUID REFERENCES anomaly_events(id),
    diagnosis_text TEXT NOT NULL,
    confidence_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**service_bookings**
```sql
CREATE TABLE service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id),
    service_center_id TEXT,
    appointment_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    customer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**manufacturing_insights**
```sql
CREATE TABLE manufacturing_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_name TEXT NOT NULL,
    failure_pattern TEXT NOT NULL,
    affected_batch TEXT,
    recommendation TEXT,
    confidence_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**ueba_logs**
```sql
CREATE TABLE ueba_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    source_node TEXT,
    target_node TEXT,
    status TEXT CHECK (status IN ('ALLOWED', 'BLOCKED')),
    timestamp TIMESTAMPTZ DEFAULT now()
);
```

## F. Frontend Requirements

### Design Aesthetic

**Premium Automotive Interface** - Bold, distinctive, non-generic:
- **Color Palette**: Deep carbon blacks (#0a0a0a), electric blues (#0ea5e9), neon cyan accents (#06b6d4)
- **Typography**: Inter or Outfit for clean, modern readability
- **Layout**: Glassmorphism cards with subtle backdrop blur
- **Animations**: Smooth micro-interactions, pulsing connection indicators
- **Data Viz**: High-contrast line charts with gradient fills

### Customer Dashboard (`/dashboard/customer`)

**Components**:
- `VehicleHealthPanel`: Current status, RUL indicator, active alerts
- `TelemetryChart`: Real-time line graphs for Speed, RPM, Battery Temp, Vibration
- `ChatInterface`: Conversational UI with AI agent
- `ServiceHistory`: Past appointments and resolutions

**Behavior**:
- WebSocket connection to `ws://api/ws/telemetry`
- Auto-scroll chat when agent message arrives
- "Approve Service" action button embedded in chat

### Service Center Dashboard (`/dashboard/service`)

**Components**:
- `AppointmentQueue`: Table of PENDING/CONFIRMED bookings
- `VehicleDiagnostics`: Detailed view of selected vehicle's anomaly history
- `UpdateBookingStatus`: Action buttons to move appointments through workflow

### Manufacturing Dashboard (`/dashboard/manufacturing`)

**Components**:
- `InsightsOverview`: Cards showing top recurring failures
- `ComponentTrendChart`: Heatmap or bar chart of failure rates by part
- `RCADetailView`: Drill-down into specific defect patterns
- `ExportButton`: Download CSV of insights

### Role-Based Routing

Middleware checks JWT role claim:
- `customer` → `/dashboard/customer`
- `service` → `/dashboard/service`
- `manufacturer` → `/dashboard/manufacturing`

Unauthorized access → Redirect to `/login` or show 403 page.

## G. Backend Requirements

### FastAPI Architecture

**Project Structure**:
```
backend/
├── main.py                 # FastAPI app entry point
├── api/
│   ├── auth.py             # Login endpoints
│   ├── telemetry.py        # WebSocket endpoint
│   ├── vehicles.py         # Vehicle CRUD
│   └── insights.py         # Manufacturing insights
├── agents/
│   ├── master.py           # LangGraph orchestrator
│   ├── data_agent.py       # Anomaly detection
│   ├── workers.py          # Diagnosis, Customer, Scheduling, RCA
│   └── ueba.py             # Security monitoring
├── simulation/
│   └── stream_engine.py    # CSV streaming logic
├── database.py             # ORM and queries
└── schemas.py              # Pydantic models
```

### Stream Engine

**Class**: `StreamEngine`
- Load CSV into Pandas DataFrame
- Async generator `stream_data()` yields one row per interval
- Loop infinitely for continuous demo
- Configurable delay (default 2 seconds)

### Agent Orchestration (LangGraph)

**State Definition**:
```python
class VehicleState(TypedDict):
    vehicle_id: str
    current_data: dict
    history: List[dict]
    anomaly_detected: bool
    anomaly_reason: str
    diagnosis: str
    severity: str
    rul: float
    messages: List[dict]
    booking_id: Optional[str]
```

**Graph Nodes**:
- `data_analysis_node`: Anomaly detection logic
- `diagnosis_node`: Root cause mapping
- `customer_node`: Message generation
- `scheduling_node`: Booking creation
- `rca_node`: Insight aggregation

**Conditional Edges**:
- If `anomaly_detected == True` → `diagnosis_node`
- Else → `END`

### UEBA Layer

**Rules**:
```python
ALLOWED_TRANSITIONS = {
    "data_analysis": ["diagnosis", "END"],
    "diagnosis": ["customer_engagement"],
    "customer_engagement": ["scheduling", "END"],
    "scheduling": ["rca", "END"],
    "rca": ["END"]
}
```

Intercept before every transition, log to `ueba_logs`, raise exception if blocked.

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | None | Issue JWT |
| WS | `/ws/telemetry` | Token | Stream vehicle data |
| GET | `/api/vehicles/{vin}/history` | Customer | Get anomaly history |
| GET | `/api/bookings` | Service | List appointments |
| POST | `/api/bookings` | Customer | Create booking |
| GET | `/api/insights` | Manufacturer | Manufacturing insights |

## H. Authentication Requirements

### Flow

1. **Login**: User submits email/password to `/api/auth/login`
2. **Validation**: Backend checks `users` table for matching `password_hash`
3. **Token Issuance**: Generate JWT with payload `{sub: user_id, role: "customer", exp: timestamp}`
4. **Storage**: Frontend stores token in `localStorage` or secure cookie
5. **Authorization**: Every API request includes `Authorization: Bearer <token>` header
6. **Middleware**: Backend validates JWT on protected routes, extracts role
7. **Role Check**: Verify user's role matches endpoint requirements (e.g., `/api/insights` requires `manufacturer`)

### Mock Credentials (Demo)

| Email | Password | Role |
|-------|----------|------|
| user@demo.com | pass123 | customer |
| service@ey.com | ey_secure | service |
| admin@oem.com | admin_pass | manufacturer |

### Session Handling

- JWT expiry: 24 hours
- Refresh token: Optional (not required for prototype)
- Logout: Frontend deletes token, backend optionally blacklists

## I. Data Strategy

### Dataset Integration

Datasets are **already extracted** in `/Autonoma/dataset/` directory:

**Primary Dataset**: `EV_Predictive_Maintenance_Dataset_15min.csv`
- Contains: Battery SoC, SoH, Temperature, Motor RPM, Vibration, Tire Pressure
- ~93MB, thousands of records
- Represents 15-minute aggregated telemetry from EV fleet

**Secondary Dataset**: `OBD-II Driving Data - Classified.csv`
- Contains: RPM, Engine Load, Coolant Temp, Throttle Position, Fuel Trim
- ~74MB
- Represents OBD-II sensor data from ICE vehicles

**Simulation Approach**:
Each CSV row represents a "snapshot" of vehicle sensors at time T. By replaying rows sequentially with a time delay, we simulate a live vehicle transmitting data to the cloud in real-time.

**Example**:
```csv
timestamp,speed,rpm,battery_temp,vibration
2025-01-01 10:00:00,60,3000,35,0.5   # Normal
2025-01-01 10:00:15,62,3100,52,2.3   # Anomaly: High temp + vibration
```

When `battery_temp > 45`, Data Analysis Agent flags anomaly → triggers full agent workflow.

## J. Demo Expectations

### What Judges Should See

**1. Live Telemetry Visualization**
- Dashboard loads, graphs are empty or flat
- WebSocket connects
- Graphs begin updating in real-time with incoming sensor data
- Visual smoothness, no lag

**2. Anomaly Detection**
- System detects spike in battery temperature or vibration
- Alert badge appears on dashboard
- "Analyzing..." indicator shows agent is processing

**3. Diagnosis**
- Chat window opens automatically
- AI message appears: "URGENT: Battery thermal management failure detected"
- User sees severity level and RUL prediction

**4. Customer Chat Interaction**
- User types: "What should I do?"
- Agent responds: "Immediate service recommended. Would you like to schedule?"
- User clicks "Yes, schedule service"

**5. Service Booking**
- Agent presents available slots
- User confirms appointment
- Booking appears in Service Center dashboard

**6. Manufacturing Insights**
- Manufacturing dashboard shows new entry
- "Battery Thermal Runaway - Batch B-2025"
- Recommendation: "Review thermal paste application process"

**7. UEBA Security Alert**
- Trigger test: Attempt to force Customer Agent to write directly to Manufacturing DB
- System blocks action
- Alert: "SECURITY: Unauthorized transition blocked"
- Entry logged in UEBA logs table

## K. Testing Requirements

### Frontend Tests

**Unit Tests (Jest + React Testing Library)**:
- [ ] `TelemetryChart` renders with empty data
- [ ] `ChatInterface` displays messages correctly
- [ ] Role guard redirects unauthorized users

**Integration Tests**:
- [ ] WebSocket connection opens and updates state
- [ ] Sending chat message triggers API call
- [ ] Booking submission creates DB record

**E2E Tests (Playwright/Cypress)**:
- [ ] Login → Navigate to dashboard → See telemetry
- [ ] Receive alert → Open chat → Approve booking
- [ ] Multi-role: Login as each role, verify correct dashboard

### Backend Tests

**Unit Tests (Pytest)**:
- [ ] `DataAnalysisAgent.analyze()` detects anomaly when temp > 45
- [ ] LangGraph routing: anomaly=True → goes to diagnosis node
- [ ] UEBA blocks illegal transition (Customer → Manufacturing)
- [ ] Stream Engine yields valid dict with expected keys

**Integration Tests**:
- [ ] POST /api/auth/login returns JWT for valid credentials
- [ ] WebSocket receives data after connection
- [ ] End-to-end: Inject anomaly row → verify DB has anomaly_event

**Load Tests** (Optional):
- [ ] 100 concurrent WebSocket connections

### Database Tests

**Schema Tests**:
- [ ] All tables created successfully
- [ ] Foreign key constraints enforced
- [ ] Enum types validated

**Data Integrity Tests**:
- [ ] Cannot insert vehicle with non-existent owner_id
- [ ] Cannot insert booking with invalid status
- [ ] Timestamp fields auto-populate

**Query Tests**:
- [ ] Fetch pending bookings for service center
- [ ] Aggregate failure count by component
- [ ] Join anomaly_events with diagnoses

### Agent Tests

**Workflow Tests**:
- [ ] Data → Diagnosis → Customer (full path)
- [ ] Anomaly=False → END (short circuit)
- [ ] Scheduling creates record in service_bookings

**UEBA Tests**:
- [ ] Allowed transition logs as ALLOWED
- [ ] Blocked transition raises exception
- [ ] All attempts logged to ueba_logs

### Streaming Tests

**Stream Engine**:
- [ ] Generator yields rows at correct interval
- [ ] Loop restarts at end of CSV
- [ ] Stop mechanism works

**WebSocket**:
- [ ] Client receives JSON messages
- [ ] Connection closes gracefully
- [ ] Reconnection logic (if implemented)

---

**Document Status**: Complete  
**Next Steps**: Create task-specific files, await approval, begin implementation
