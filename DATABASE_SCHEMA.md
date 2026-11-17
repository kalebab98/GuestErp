# GuestCare - Database Schema Documentation

PostgreSQL Schema: `guestcare`

---

## 1. Schema Diagram & Relationships

```
[categories] ──< [requests] ──< [assignments]
                      │
                      ├──< [comments] ──< [attachments]
                      │
                      ├──< [status_history] (Immutable)
                      │
[portal_sessions] ───+ (links via reservation_ref)
                      │
[feedback] ──────────┼ (links via reservation_ref) ──< [feedback_actions]
                      │
[guest_health] ──────+ (calculated per reservation_ref)
                      │
[notifications] ─────+ (queue for transactional alerts)
                      │
[audit_logs] ────────+ (system-wide activity log)
```

---

## 2. Table Specifications

### 2.1 `guestcare.categories`
Stores available service categories.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_schema_uuid()`
- `code`: `VARCHAR(50) UNIQUE NOT NULL` ('maintenance', 'housekeeping', 'guest_services', 'internet_tech', 'comfort', 'noise', 'other')
- `name`: `VARCHAR(100) NOT NULL`
- `description`: `TEXT`
- `default_department`: `VARCHAR(50) NOT NULL` ('maintenance', 'housekeeping', 'reception', 'management')
- `default_priority`: `VARCHAR(20) DEFAULT 'medium'` ('low', 'medium', 'high', 'urgent')
- `sla_minutes`: `INTEGER DEFAULT 60`
- `icon_name`: `VARCHAR(50)`
- `display_order`: `INTEGER DEFAULT 0`
- `is_active`: `BOOLEAN DEFAULT true`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

### 2.2 `guestcare.portal_sessions`
Active and historical guest QR sessions.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `reservation_ref`: `VARCHAR(100) NOT NULL`
- `apartment_ref`: `VARCHAR(100) NOT NULL`
- `guest_name`: `VARCHAR(255) NOT NULL`
- `token_hash`: `VARCHAR(64) UNIQUE NOT NULL` (SHA-256 hash of random token)
- `check_in_date`: `TIMESTAMPTZ NOT NULL`
- `check_out_date`: `TIMESTAMPTZ NOT NULL`
- `expires_at`: `TIMESTAMPTZ NOT NULL`
- `revoked_at`: `TIMESTAMPTZ`
- `last_active_at`: `TIMESTAMPTZ DEFAULT now()`
- `ip_address`: `VARCHAR(45)`
- `user_agent`: `TEXT`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

### 2.3 `guestcare.requests`
Core ticket records.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `ticket_number`: `VARCHAR(30) UNIQUE NOT NULL` (e.g. `GC-20261117-0001`)
- `reservation_ref`: `VARCHAR(100) NOT NULL`
- `apartment_ref`: `VARCHAR(100) NOT NULL`
- `guest_name`: `VARCHAR(255) NOT NULL`
- `category_id`: `UUID NOT NULL REFERENCES guestcare.categories(id)`
- `title`: `VARCHAR(255) NOT NULL`
- `description`: `TEXT NOT NULL`
- `priority`: `VARCHAR(20) NOT NULL DEFAULT 'medium'` ('low', 'medium', 'high', 'urgent')
- `status`: `VARCHAR(30) NOT NULL DEFAULT 'new'` ('new', 'acknowledged', 'assigned', 'in_progress', 'waiting', 'resolved', 'reopened', 'closed', 'cancelled')
- `assigned_department`: `VARCHAR(50) NOT NULL`
- `assigned_staff_id`: `UUID REFERENCES auth.users(id)`
- `assigned_staff_name`: `VARCHAR(255)`
- `resolution_notes`: `TEXT`
- `resolved_at`: `TIMESTAMPTZ`
- `closed_at`: `TIMESTAMPTZ`
- `guest_confirmed_at`: `TIMESTAMPTZ`
- `guest_satisfaction`: `VARCHAR(20)` ('satisfied', 'unsatisfied')
- `reopen_count`: `INTEGER DEFAULT 0`
- `reopen_reason`: `TEXT`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ DEFAULT now()`

### 2.4 `guestcare.assignments`
Assignment history for staff and departments.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `request_id`: `UUID NOT NULL REFERENCES guestcare.requests(id) ON DELETE CASCADE`
- `department`: `VARCHAR(50) NOT NULL`
- `staff_id`: `UUID REFERENCES auth.users(id)`
- `staff_name`: `VARCHAR(255)`
- `assigned_by`: `UUID REFERENCES auth.users(id)`
- `notes`: `TEXT`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

### 2.5 `guestcare.comments`
Conversation thread on a request (guest messages, staff updates, internal staff notes).
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `request_id`: `UUID NOT NULL REFERENCES guestcare.requests(id) ON DELETE CASCADE`
- `author_type`: `VARCHAR(20) NOT NULL` ('guest', 'staff', 'system')
- `author_id`: `UUID` (NULL if guest)
- `author_name`: `VARCHAR(255) NOT NULL`
- `content`: `TEXT NOT NULL`
- `is_internal`: `BOOLEAN DEFAULT false` (hidden from guest portal)
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

### 2.6 `guestcare.attachments`
Uploaded photos or supporting documentation.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `request_id`: `UUID NOT NULL REFERENCES guestcare.requests(id) ON DELETE CASCADE`
- `comment_id`: `UUID REFERENCES guestcare.comments(id) ON DELETE SET NULL`
- `file_name`: `VARCHAR(255) NOT NULL`
- `file_path`: `VARCHAR(500) NOT NULL`
- `file_size`: `INTEGER NOT NULL`
- `mime_type`: `VARCHAR(100) NOT NULL`
- `uploaded_by`: `VARCHAR(50) NOT NULL` ('guest', 'staff')
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

### 2.7 `guestcare.status_history`
Immutable event log for all status transitions.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `request_id`: `UUID NOT NULL REFERENCES guestcare.requests(id) ON DELETE CASCADE`
- `from_status`: `VARCHAR(30)`
- `to_status`: `VARCHAR(30) NOT NULL`
- `changed_by_type`: `VARCHAR(20) NOT NULL` ('guest', 'staff', 'system')
- `changed_by_id`: `UUID`
- `changed_by_name`: `VARCHAR(255) NOT NULL`
- `change_reason`: `TEXT`
- `metadata`: `JSONB DEFAULT '{}'::jsonb`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

### 2.8 `guestcare.feedback`
In-stay guest satisfaction ratings and private remarks.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `reservation_ref`: `VARCHAR(100) NOT NULL`
- `apartment_ref`: `VARCHAR(100) NOT NULL`
- `guest_name`: `VARCHAR(255) NOT NULL`
- `overall_rating`: `INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5)`
- `cleanliness_rating`: `INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5)`
- `staff_rating`: `INTEGER CHECK (staff_rating BETWEEN 1 AND 5)`
- `comfort_rating`: `INTEGER CHECK (comfort_rating BETWEEN 1 AND 5)`
- `comments`: `TEXT`
- `is_anonymous`: `BOOLEAN DEFAULT false`
- `status`: `VARCHAR(20) DEFAULT 'new'` ('new', 'reviewed', 'actioned')
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

### 2.9 `guestcare.feedback_actions`
Actions taken by reception/management to follow up on feedback.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `feedback_id`: `UUID NOT NULL REFERENCES guestcare.feedback(id) ON DELETE CASCADE`
- `staff_id`: `UUID REFERENCES auth.users(id)`
- `staff_name`: `VARCHAR(255) NOT NULL`
- `action_type`: `VARCHAR(50) NOT NULL` ('contacted_guest', 'room_visit', 'sent_amenity', 'discount_issued', 'internal_escalation')
- `notes`: `TEXT NOT NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

### 2.10 `guestcare.guest_health`
Dynamic real-time health indicator calculated per reservation.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `reservation_ref`: `VARCHAR(100) UNIQUE NOT NULL`
- `apartment_ref`: `VARCHAR(100) NOT NULL`
- `guest_name`: `VARCHAR(255) NOT NULL`
- `status`: `VARCHAR(20) NOT NULL DEFAULT 'good'` ('good', 'improving', 'at_risk', 'critical')
- `score`: `INTEGER NOT NULL DEFAULT 100` (Range 0 - 100)
- `reasons`: `JSONB NOT NULL DEFAULT '[]'::jsonb` (Rule evaluation details)
- `last_calculated_at`: `TIMESTAMPTZ DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ DEFAULT now()`

### 2.11 `guestcare.notifications`
Transactional outbound alerts and in-app feeds.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `recipient_type`: `VARCHAR(20) NOT NULL` ('staff', 'guest', 'department')
- `recipient_id`: `VARCHAR(100)`
- `channel`: `VARCHAR(20) NOT NULL` ('in_app', 'email')
- `title`: `VARCHAR(255) NOT NULL`
- `message`: `TEXT NOT NULL`
- `reference_type`: `VARCHAR(50)` ('request', 'feedback', 'health', 'session')
- `reference_id`: `UUID`
- `status`: `VARCHAR(20) NOT NULL DEFAULT 'pending'` ('pending', 'sent', 'failed')
- `retry_count`: `INTEGER DEFAULT 0`
- `error_message`: `TEXT`
- `idempotency_key`: `VARCHAR(100) UNIQUE`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`
- `sent_at`: `TIMESTAMPTZ`

### 2.12 `guestcare.audit_logs`
System-wide audit trail for compliance and security.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `actor_type`: `VARCHAR(20) NOT NULL` ('staff', 'guest', 'system', 'pms')
- `actor_id`: `VARCHAR(100)`
- `action`: `VARCHAR(100) NOT NULL`
- `entity_type`: `VARCHAR(50) NOT NULL`
- `entity_id`: `VARCHAR(100) NOT NULL`
- `old_values`: `JSONB`
- `new_values`: `JSONB`
- `ip_address`: `VARCHAR(45)`
- `user_agent`: `TEXT`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

### 2.13 `guestcare.settings`
Application-wide operational configurations.
- `key`: `VARCHAR(100) PRIMARY KEY`
- `value`: `JSONB NOT NULL`
- `description`: `TEXT`
- `updated_at`: `TIMESTAMPTZ DEFAULT now()`
- `updated_by`: `UUID REFERENCES auth.users(id)`

---

## 3. Database Triggers & Automations

1. `trigger_request_ticket_number`: Auto-generates sequential ticket numbers (`GC-YYYYMMDD-XXXX`).
2. `trigger_request_status_history`: Inserts immutable transition audit records into `guestcare.status_history` on update of `status`.
3. `trigger_reopen_counter`: Increments `reopen_count` when status changes back to `reopened`.
4. `trigger_health_update_on_request`: Triggers guest health recalculation function when request status/priority changes.

