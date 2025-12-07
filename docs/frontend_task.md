# Frontend Implementation Tasks

> **Reference**: See `MAIN_PRD.md` Section F for complete requirements.

## Overview

Build a premium, role-based Next.js dashboard system that provides real-time vehicle telemetry visualization, AI-powered chat interactions, and operational views for customers, service centers, and manufacturers.

## 1. Project Setup

### 1.1 Initialize Next.js Application
- [ ] Create Next.js app with TypeScript template
- [ ] Configure TailwindCSS with custom theme
- [ ] Install dependencies: `recharts`, `lucide-react`, `date-fns`
- [ ] Setup folder structure: `/components`, `/hooks`, `/contexts`, `/app`

### 1.2 Define Design System
- [ ] Create `tailwind.config.js` with custom colors:
  - Carbon black: `#0a0a0a`
  - Electric blue: `#0ea5e9`
  - Neon cyan: `#06b6d4`
  - Accent purple: `#8b5cf6`
- [ ] Configure fonts: Inter or Outfit from Google Fonts
- [ ] Create reusable CSS utilities for glassmorphism effects

## 2. Authentication & Routing

### 2.1 Auth Hook
- [ ] Create `useAuth` hook in `/hooks/useAuth.ts`
  - State: `token`, `user`, `role`, `isAuthenticated`
  - Methods: `login(email, password)`, `logout()`, `getToken()`
  - Storage: Save JWT to `localStorage`

### 2.2 Login Page
- [ ] Create `/app/login/page.tsx`
- [ ] Form with email/password inputs
- [ ] "Login" button calling `/api/auth/login`
- [ ] Error handling for invalid credentials
- [ ] Redirect to appropriate dashboard on success

### 2.3 Route Protection Middleware
- [ ] Create `AuthGuard` component
- [ ] Check for valid token on mount
- [ ] Decode JWT to extract role
- [ ] Redirect to `/login` if unauthenticated
- [ ] Redirect to correct dashboard based on role

### 2.4 Role-Based Dashboard Routing
- [ ] `/dashboard/customer` → Customer view (role: customer)
- [ ] `/dashboard/service` → Service center view (role: service)
- [ ] `/dashboard/manufacturing` → Manufacturing view (role: manufacturer)
- [ ] 403 page for unauthorized role access

## 3. Live Telemetry System

### 3.1 WebSocket Hook
- [ ] Create `useTelemetry` hook in `/hooks/useTelemetry.ts`
  - Connect to `ws://localhost:8000/ws/telemetry`
  - State: `telemetryData` (array of last 50 points), `isConnected`, `currentAlert`
  - Parse incoming messages (type: `telemetry` or `alert`)
  - Handle connection/disconnection events

### 3.2 Telemetry Chart Component
- [ ] Create `/components/TelemetryChart.tsx`
  - Props: `data`, `dataKey`, `color`, `title`, `unit`
  - Use Recharts `LineChart` with `Line`, `XAxis`, `YAxis`, `Tooltip`
  - Dark theme styling
  - Display current value in large font at bottom
  - Disable animation for real-time performance

### 3.3 Status Panel Component
- [ ] Create `/components/StatusPanel.tsx`
  - Connection status indicator (green pulse = online)
  - Vehicle health card (Optimal / Attention Required)
  - Active agent indicator
  - RUL (Remaining Useful Life) percentage display

## 4. Customer Dashboard

### 4.1 Page Layout
- [ ] Create `/app/dashboard/customer/page.tsx`
- [ ] Grid layout: Telemetry (left 2 cols), Chat (right 1 col), Insights (bottom)

### 4.2 Telemetry Section
- [ ] Render multiple `TelemetryChart` instances:
  - Speed (blue)
  - RPM (green)
  - Battery Temperature (red)
  - Battery SoC (purple)
  - Vibration (orange)
  - Current (pink)
- [ ] Auto-scroll container with custom scrollbar styling

### 4.3 Chat Interface Component
- [ ] Create `/components/ChatInterface.tsx`
  - Message list with auto-scroll to bottom
  - Message bubbles: User (right, blue), Agent (left, gray)
  - Input field with send button
  - Display timestamps
  - **Action Cards**: Render "Approve Service" button when agent requests booking
  - Optional: Text-to-Speech toggle using browser `speechSynthesis` API

### 4.4 Service History
- [ ] Create `/components/ServiceHistory.tsx`
  - Fetch from `/api/bookings?vehicle_id={id}`
  - Display table: Date, Service Type, Status, Notes
  - Filter by status (All, Pending, Completed)

## 5. Service Center Dashboard

### 5.1 Page Layout
- [ ] Create `/app/dashboard/service/page.tsx`
- [ ] Two-column: Appointment Queue (left), Vehicle Details (right)

### 5.2 Appointment Queue Component
- [ ] Create `/components/AppointmentQueue.tsx`
  - Fetch from `/api/bookings?status=PENDING,CONFIRMED`
  - Table columns: Vehicle VIN, Owner, Time, Status, Actions
  - Row click → Load diagnostic details in right panel

### 5.3 Vehicle Diagnostics Panel
- [ ] Create `/components/VehicleDiagnostics.tsx`
  - Fetch `/api/vehicles/{vin}/history`
  - Display anomaly events with timestamps
  - Show linked diagnosis text and confidence score
  - "Update Status" buttons (Confirm, Complete, Cancel)

## 6. Manufacturing Dashboard

### 6.1 Page Layout
- [ ] Create `/app/dashboard/manufacturing/page.tsx`
- [ ] Three sections: Overview Cards, Trend Chart, Detail Table

### 6.2 Insights Overview
- [ ] Create `/components/InsightsOverview.tsx`
  - Fetch from `/api/insights`
  - Display top 3 recurring failures as cards
  - Card content: Component Name, Failure Count, Batch Info

### 6.3 Component Trend Chart
- [ ] Create `/components/ComponentTrendChart.tsx`
  - Use Recharts `BarChart` or `Heatmap`
  - X-axis: Component names
  - Y-axis: Failure count
  - Color scale: Green (low) → Red (high)

### 6.4 RCA Detail View
- [ ] Create `/components/RCADetailView.tsx`
  - Searchable/filterable table
  - Columns: Component, Pattern, Affected Batch, Recommendation, Confidence, Date
  - "Export CSV" button

## 7. Styling & UX Polish

### 7.1 Premium Glassmorphism Effects
- [ ] Apply `backdrop-blur-md` to all cards
- [ ] Border: `border border-gray-800`
- [ ] Background: `bg-gray-900/50` or `bg-gray-900/80`
- [ ] Subtle shadow: `shadow-2xl`

### 7.2 Micro-Animations
- [ ] Pulsing connection indicator (`animate-pulse`)
- [ ] Smooth fade-in for new messages (`transition-opacity duration-300`)
- [ ] Hover effects on cards (`hover:border-blue-500 transition-colors`)

### 7.3 Responsive Design
- [ ] Mobile breakpoints: `sm:`, `md:`, `lg:`
- [ ] Collapse sidebar on mobile
- [ ] Stack charts vertically on small screens

## 8. Testing Tasks

### 8.1 Component Unit Tests
- [ ] Test `TelemetryChart` renders with mock data
- [ ] Test `ChatInterface` appends messages correctly
- [ ] Test `AuthGuard` redirects unauthenticated users

### 8.2 Hook Tests
- [ ] Test `useAuth` stores token after successful login
- [ ] Test `useTelemetry` updates state on WebSocket message

### 8.3 Integration Tests
- [ ] Test login flow: Enter credentials → Redirect to dashboard
- [ ] Test WebSocket connection: Open page → Graphs update
- [ ] Test booking flow: Chat → Approve → Verify API call

### 8.4 E2E Tests (Playwright)
- [ ] Full user journey: Login → View telemetry → Receive alert → Book service
- [ ] Role switching: Login as different roles, verify correct dashboard

## Design Specification

**Typography**:
- Headings: `font-bold`, sizes from `text-3xl` to `text-sm`
- Body: `text-gray-300`, `text-sm` or `text-base`
- Accents: `text-blue-400`, `text-purple-400`, `text-cyan-400`

**Layout Grid**:
- Main container: `min-h-screen bg-black p-6`
- Dashboard grid: `grid grid-cols-1 lg:grid-cols-4 gap-6`

**Card Pattern**:
```jsx
<div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-2xl">
  {/* Content */}
</div>
```

**Button Pattern**:
```jsx
<button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors">
  Action
</button>
```
