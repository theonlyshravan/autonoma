# Database Implementation Tasks

> **Reference**: See `MAIN_PRD.md` Section E for complete schema requirements.

## Overview

Establish PostgreSQL (or Supabase) as the system of record with proper schema design, relationships, migrations, seed data, and ORM integration.

## 1. Database Setup

### 1.1 Choose Database Provider
- [ ] **Option A**: Local PostgreSQL instance
  - Install PostgreSQL locally
  - Create database: `CREATE DATABASE autonoma;`
- [ ] **Option B**: Supabase (Recommended for prototype)
  - Create Supabase project
  - Get connection string from dashboard
  - Enable Row Level Security (optional for prototype)

### 1.2 Connection Configuration
- [ ] Store database URL in `.env` file
- [ ] Format: `postgresql://user:password@host:port/database`
- [ ] Test connection using `psql` or Supabase SQL editor

## 2. Schema Creation

### 2.1 Create Custom Types
- [ ] Create `user_role` enum:
  ```sql
  CREATE TYPE user_role AS ENUM ('customer', 'service', 'manufacturer');
  ```

### 2.2 Create Core Tables

**users**
- [ ] Execute SQL:
  ```sql
  CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role user_role NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] Create index on email: `CREATE INDEX idx_users_email ON users(email);`

**vehicles**
- [ ] Execute SQL:
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
- [ ] Create index on VIN: `CREATE INDEX idx_vehicles_vin ON vehicles(vin);`
- [ ] Create index on owner: `CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);`

### 2.3 Create Event Tables

**anomaly_events**
- [ ] Execute SQL:
  ```sql
  CREATE TABLE anomaly_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
      detected_at TIMESTAMPTZ DEFAULT now(),
      anomaly_type TEXT NOT NULL,
      severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
      sensor_snapshot JSONB,
      rul_prediction FLOAT
  );
  ```
- [ ] Create index: `CREATE INDEX idx_anomaly_vehicle ON anomaly_events(vehicle_id, detected_at DESC);`

**diagnoses**
- [ ] Execute SQL:
  ```sql
  CREATE TABLE diagnoses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      anomaly_event_id UUID REFERENCES anomaly_events(id) ON DELETE CASCADE,
      diagnosis_text TEXT NOT NULL,
      confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
      created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

### 2.4 Create Operational Tables

**service_bookings**
- [ ] Execute SQL:
  ```sql
  CREATE TABLE service_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
      service_center_id TEXT,
      appointment_time TIMESTAMPTZ NOT NULL,
      status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
      customer_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] Create index: `CREATE INDEX idx_bookings_status ON service_bookings(status, appointment_time);`

**manufacturing_insights**
- [ ] Execute SQL:
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
- [ ] Execute SQL:
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
- [ ] Create index: `CREATE INDEX idx_ueba_timestamp ON ueba_logs(timestamp DESC);`

## 3. Migration Management

### 3.1 Create Migration System
- [ ] **Option A**: Use Alembic (SQLAlchemy)
  - Install: `pip install alembic`
  - Initialize: `alembic init migrations`
  - Create migration: `alembic revision --autogenerate -m "initial schema"`
  - Apply: `alembic upgrade head`
- [ ] **Option B**: Manual SQL scripts
  - Create `migrations/001_initial_schema.sql` with all CREATE TABLE statements
  - Run: `psql $DATABASE_URL < migrations/001_initial_schema.sql`

### 3.2 Rollback Plan
- [ ] Create `migrations/001_down.sql` with DROP TABLE statements (reverse order)
- [ ] Test rollback: `psql $DATABASE_URL < migrations/001_down.sql`

## 4. Seed Data

### 4.1 Create Test Users
- [ ] Insert 3 users with hashed passwords:
  ```sql
  -- Use passlib to hash passwords in Python first, then insert
  INSERT INTO users (email, password_hash, role) VALUES
  ('user@demo.com', '$2b$12$...', 'customer'),
  ('service@ey.com', '$2b$12$...', 'service'),
  ('admin@oem.com', '$2b$12$...', 'manufacturer');
  ```

### 4.2 Create Test Vehicle
- [ ] Insert 1 vehicle linked to customer:
  ```sql
  INSERT INTO vehicles (owner_id, vin, model, year, vehicle_type)
  SELECT id, 'VIN123456789', 'Tesla Model 3', 2023, 'EV'
  FROM users WHERE email = 'user@demo.com';
  ```

### 4.3 Create Sample Historical Data
- [ ] Insert 5 past anomaly events
- [ ] Insert linked diagnoses
- [ ] Insert 3 past service bookings (status: COMPLETED)
- [ ] Insert 2 manufacturing insights

### 4.4 Seed Script
- [ ] Create `seed.py`:
  - Hash passwords using `passlib`
  - Insert all seed data using database functions
  - Run: `python seed.py`

## 5. ORM Models (Optional but Recommended)

### 5.1 SQLAlchemy Models
- [ ] Create `models.py` with SQLAlchemy declarative models:
  - `User`
  - `Vehicle`
  - `AnomalyEvent`
  - `Diagnosis`
  - `ServiceBooking`
  - `ManufacturingInsight`
  - `UEBALog`
- [ ] Define relationships:
  - `User.vehicles = relationship("Vehicle", back_populates="owner")`
  - `Vehicle.anomalies = relationship("AnomalyEvent")`
  - `AnomalyEvent.diagnosis = relationship("Diagnosis")`

### 5.2 Async Session Factory
- [ ] Create async engine: `create_async_engine(DATABASE_URL)`
- [ ] Create session maker: `async_sessionmaker(engine)`
- [ ] Dependency: `async def get_db() -> AsyncSession`

## 6. Query Helpers

### 6.1 User Queries
- [ ] `get_user_by_email(email: str) -> User | None`
- [ ] `verify_password(plain, hashed) -> bool`

### 6.2 Vehicle Queries
- [ ] `get_vehicle_by_vin(vin: str) -> Vehicle | None`
- [ ] `get_vehicles_by_owner(user_id: UUID) -> List[Vehicle]`

### 6.3 Event Queries
- [ ] `create_anomaly_event(vehicle_id, type, severity, snapshot, rul) -> UUID`
- [ ] `get_anomalies_by_vehicle(vehicle_id: UUID, limit: int) -> List[AnomalyEvent]`
- [ ] `create_diagnosis(anomaly_id, text, confidence) -> UUID`

### 6.4 Booking Queries
- [ ] `create_booking(vehicle_id, slot, notes) -> ServiceBooking`
- [ ] `get_bookings_by_status(status: str) -> List[ServiceBooking]`
- [ ] `update_booking_status(booking_id, new_status)`

### 6.5 Insight Queries
- [ ] `create_insight(component, pattern, batch, recommendation) -> UUID`
- [ ] `get_recent_insights(limit: int) -> List[ManufacturingInsight]`

### 6.6 UEBA Queries
- [ ] `log_ueba(agent, action, source, target, status)`
- [ ] `get_blocked_attempts(limit: int) -> List[UEBALog]`

## 7. Testing Tasks

### 7.1 Schema Validation
- [ ] Run all CREATE TABLE scripts without errors
- [ ] Verify all tables exist: `\dt` in psql
- [ ] Verify indexes created: `\di`

### 7.2 Constraint Tests
- [ ] Test UNIQUE constraint on users.email
  - Insert duplicate email → Expect error
- [ ] Test FOREIGN KEY constraint
  - Insert vehicle with fake owner_id → Expect error
- [ ] Test CHECK constraint
  - Insert user with invalid role → Expect error

### 7.3 Data Integrity Tests
- [ ] Insert vehicle, then delete owner
  - Expect CASCADE delete of vehicle (if ON DELETE CASCADE)
- [ ] Insert anomaly with NULL vehicle_id
  - Expect error (NOT NULL constraint)

### 7.4 Query Tests
- [ ] Fetch pending bookings:
  ```sql
  SELECT * FROM service_bookings WHERE status = 'PENDING';
  ```
- [ ] Join anomalies with diagnoses:
  ```sql
  SELECT a.*, d.diagnosis_text
  FROM anomaly_events a
  LEFT JOIN diagnoses d ON d.anomaly_event_id = a.id
  WHERE a.vehicle_id = ?;
  ```
- [ ] Aggregate failures by component:
  ```sql
  SELECT component_name, COUNT(*) as failure_count
  FROM manufacturing_insights
  GROUP BY component_name
  ORDER BY failure_count DESC;
  ```
