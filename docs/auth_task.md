# Authentication & Security Implementation Tasks

> **Reference**: See `MAIN_PRD.md` Section H for complete auth requirements.

## Overview

Implement a secure Role-Based Access Control (RBAC) system using JWT to protect both Frontend Views and Backend API endpoints, ensuring strictly authorized access for Customers, Service Centers, and Manufacturers.

## 1. Authentication System

### 1.1 Backend Dependencies
- [ ] Install libraries: `python-jose` (JWT), `passlib[bcrypt]` (Hashing)
- [ ] Configure `.env`:
  - `JWT_SECRET_KEY`
  - `JWT_ALGORITHM=HS256`
  - `ACCESS_TOKEN_EXPIRE_MINUTES=1440` (24 hours)

### 1.2 User Model & Hashing
- [ ] In `schemas.py`: Define `Token`, `TokenData`, `UserLogin`
- [ ] In `database.py`:
  - `get_user(email)`
  - `verify_password(plain, hashed)`
  - `get_password_hash(password)`

### 1.3 JWT Logic
- [ ] Create `security.py`:
  - `create_access_token(data: dict, expires_delta)`
  - `decode_access_token(token: str)`

### 1.4 Login Endpoint
- [ ] Create `api/auth.py`
  - `POST /login`:
    - Accept email/password
    - Verify user in DB
    - Generate JWT with payload `{"sub": user_id, "role": user_role}`
    - Return `{"access_token": "...", "token_type": "bearer"}`

## 2. Authorization (Backend Guard)

### 2.1 Dependency Injection
- [ ] Create `get_current_user(token: str = Depends(oauth2_scheme))`
  - Decodes token
  - Validates expiry
  - Fetches user from DB (optional, or trust token)
  - Returns `User` object (with role)

### 2.2 Role Verifiers
- [ ] Create `get_current_active_customer`
  - assert `user.role == 'customer'`
- [ ] Create `get_current_active_service`
  - assert `user.role == 'service'`
- [ ] Create `get_current_active_manufacturer`
  - assert `user.role == 'manufacturer'`

### 2.3 Protect API Endpoints
- [ ] `/api/vehicles/{vin}` → `Depends(get_current_active_customer)` - *Restrict to owner?*
- [ ] `/api/bookings` (GET) → `Depends(get_current_active_service)`
- [ ] `/api/insights` → `Depends(get_current_active_manufacturer)`

## 3. Frontend Authentication

### 3.1 Auth Provider
- [ ] Create `AuthProvider` context
  - Load token from `localStorage` on mount
  - Decode token to get user info
  - Provide `user`, `login`, `logout` to app

### 3.2 Login Form
- [ ] Build UI
- [ ] `handleSubmit`:
  - `POST /api/auth/login`
  - On success: Save token, `router.push('/dashboard/...')` based on role

### 3.3 Protected Routes (Guard)
- [ ] Create HOC or Layout Wrapper `RequireAuth`
- [ ] Check if `user` exists
- [ ] Check if `user.role` matches allowed roles for the page
- [ ] If fail, `router.push('/login')`

## 4. Security & UEBA Integration

### 4.1 UEBA Monitoring
- [ ] In `agents/ueba.py`:
  - Monitor Agent-to-Agent calls
  - Logic: "Did the `CustomerEngagementAgent` try to modify `manufacturing_insights`?"
  - If yes → Block & Log

### 4.2 Audit Logging
- [ ] Ensure all Login events are logged (optional)
- [ ] Ensure all "Blocked" actions are saved to `ueba_logs` table

## 5. Testing Tasks

### 5.1 Unit Tests
- [ ] **Password Hashing**: Verify `hash(password) != password` and `verify(password, hash) == True`
- [ ] **JWT Generation**: Create token, decode it, verify payload matches

### 5.2 Integration Tests
- [ ] **Login Flow**:
  - `POST /login` with valid creds → 200 OK + Token
  - `POST /login` with bad creds → 401 Unauthorized
- [ ] **Role Protection**:
  - Access Manufacturer endpoint with Customer token → 403 Forbidden
  - Access Customer endpoint with Customer token → 200 OK

### 5.3 Frontend Tests
- [ ] **Redirection**: Verify visiting `/dashboard` without token redirects to `/login`
- [ ] **Role View**: Verify Customer cannot see "Manufacturing Insights" nav link
