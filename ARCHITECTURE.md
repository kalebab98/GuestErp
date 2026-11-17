# GuestCare - System Architecture

## 1. High-Level Architecture Overview

GuestCare is designed as an event-driven, mobile-first hospitality application engineered to identify and resolve guest issues during their active stay.

```
                      +---------------------------------------+
                      |          Apartment PMS                |
                      |  (External Source of Truth)           |
                      +-------------------+-------------------+
                                          |
                                          | PMS Adapter (REST/Webhook/Mock)
                                          v
+--------------------------+    +------------------------------------+
|  Guest Portal (Mobile)   |    |    GuestCare Staff Dashboard       |
|  - QR Cryptographic Auth |    |    - Reception / Ops / Maintenance |
|  - Service & Issue Form  |    |    - Request Lifecycle & Dispatch  |
|  - Realtime Ticket Track |    |    - Health Analytics & Overdue SLA|
+------------+-------------+    +-----------------+------------------+
             |                                    |
             +-----------------+------------------+
                               |
                               v
               +-------------------------------+
               |    Supabase / PostgreSQL      |
               |    Schema: `guestcare`        |
               |                               |
               |  - portal_sessions (hashed)   |
               |  - requests & status_history  |
               |  - guest_health rule engine   |
               |  - notification queue & retry |
               |  - audit_logs & RLS policies  |
               +-------------------------------+
```

## 2. Core Architectural Principles

1. **PMS as External Source of Truth**:
   - The application does not duplicate or manage rooms, reservations, or master guest profiles.
   - It references `reservation_ref` and `apartment_ref` via a decoupled adapter contract (`IPMSAdapter`).
2. **Stateless QR Session Verification**:
   - Guests scan a room-specific QR code containing a secure one-time or session token.
   - Only the SHA-256 hash of the token is stored in `guestcare.portal_sessions`.
   - Access is checked against the active reservation dates and stay status.
3. **Immutable Audit Trails**:
   - Status changes in `guestcare.requests` automatically record an immutable row in `guestcare.status_history`.
   - All critical actions generate an entry in `guestcare.audit_logs`.
4. **Resilient Notification Queue**:
   - Notifications are written to `guestcare.notifications` with status `pending` and processed via idempotent dispatch workers.
5. **Rule-Based Deterministic Health Calculation**:
   - No opaque AI or probabilistic heuristics for guest health.
   - Explicit thresholds calculate whether a guest experience is `Good`, `Improving`, `At Risk`, or `Critical`.

---

## 3. Subsystem Breakdown

### 3.1 Guest Mobile Portal
- Path: `/portal?token=<token>` or `/portal/request`
- Designed specifically for smartphone viewports (360px - 480px width) with desktop preview capability.
- Instant submission for:
  - Maintenance (plumbing, HVAC, appliances, electrical)
  - Housekeeping (cleaning, towels, amenities, trash)
  - Guest Services (extra keys, luggage assistance, local tips)
  - Internet & Tech (Wi-Fi, smart TV, Chromecast)
  - Comfort & Apartment conditions (temperature, noise, odors)
  - Private Feedback & Direct Reception Call
- Photo upload directly to Supabase Storage with size and MIME validation.
- Live status timeline with 2-way resolution confirmation:
  - When staff marks "Resolved", the guest sees an interactive prompt: "Has this been resolved to your satisfaction?".
  - If guest clicks "Yes", status moves to `Closed`.
  - If guest clicks "No", status re-opens immediately to `Reopened`, priority bumps, and the team is re-notified.

### 3.2 Staff Management Dashboard
- Path: `/staff`
- Role-based views:
  - **Reception / Front Desk**: All requests, Guest health board, Quick check-in QR generation.
  - **Maintenance**: Technical tickets, equipment notes, maintenance SLA timers.
  - **Housekeeping**: Linen, supplies, apartment cleaning tickets.
  - **Management**: KPI dashboards, average response/resolution times, reopened rates, apartment incident heatmaps.
- Interactive filtering by status, priority, department, apartment, and date range.
- Internal comment thread with staff-only vs. guest-visible messaging.

### 3.3 Database Tier (Schema: `guestcare`)
- Encapsulated within its own PostgreSQL schema `guestcare`.
- Strict foreign keys, CHECK constraints, and automated triggers.
- Row Level Security (RLS) ensuring strict tenant isolation.
