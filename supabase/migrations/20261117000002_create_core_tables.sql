-- Migration 02: Create Core Tables
-- Project: GuestCare
-- Description: Creates portal sessions, requests, assignments, comments, attachments, status history, feedback, health, notifications, audit logs, and settings

-- 1. Table: guestcare.portal_sessions
CREATE TABLE IF NOT EXISTS guestcare.portal_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_ref VARCHAR(100) NOT NULL,
    apartment_ref VARCHAR(100) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255),
    guest_phone VARCHAR(50),
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of secret QR token
    check_in_date TIMESTAMPTZ NOT NULL,
    check_out_date TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_sessions_token_hash ON guestcare.portal_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_res_ref ON guestcare.portal_sessions(reservation_ref);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_active ON guestcare.portal_sessions(expires_at, revoked_at);

-- 2. Table: guestcare.requests
CREATE TABLE IF NOT EXISTS guestcare.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    reservation_ref VARCHAR(100) NOT NULL,
    apartment_ref VARCHAR(100) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    category_id UUID NOT NULL REFERENCES guestcare.categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'assigned', 'in_progress', 'waiting', 'resolved', 'reopened', 'closed', 'cancelled')),
    assigned_department VARCHAR(50) NOT NULL CHECK (assigned_department IN ('maintenance', 'housekeeping', 'reception', 'management')),
    assigned_staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_staff_name VARCHAR(255),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    guest_confirmed_at TIMESTAMPTZ,
    guest_satisfaction VARCHAR(20) CHECK (guest_satisfaction IN ('satisfied', 'unsatisfied')),
    reopen_count INTEGER NOT NULL DEFAULT 0,
    reopen_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON guestcare.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON guestcare.requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_dept ON guestcare.requests(assigned_department);
CREATE INDEX IF NOT EXISTS idx_requests_res_ref ON guestcare.requests(reservation_ref);
CREATE INDEX IF NOT EXISTS idx_requests_apt_ref ON guestcare.requests(apartment_ref);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON guestcare.requests(created_at DESC);

-- 3. Table: guestcare.assignments
CREATE TABLE IF NOT EXISTS guestcare.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES guestcare.requests(id) ON DELETE CASCADE,
    department VARCHAR(50) NOT NULL,
    staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    staff_name VARCHAR(255),
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_request_id ON guestcare.assignments(request_id);

-- 4. Table: guestcare.comments
CREATE TABLE IF NOT EXISTS guestcare.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES guestcare.requests(id) ON DELETE CASCADE,
    author_type VARCHAR(20) NOT NULL CHECK (author_type IN ('guest', 'staff', 'system')),
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT false, -- If true, invisible to guest portal
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_request_id ON guestcare.comments(request_id, created_at);

-- 5. Table: guestcare.attachments
CREATE TABLE IF NOT EXISTS guestcare.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES guestcare.requests(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES guestcare.comments(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by VARCHAR(50) NOT NULL CHECK (uploaded_by IN ('guest', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_request_id ON guestcare.attachments(request_id);

-- 6. Table: guestcare.status_history (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS guestcare.status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES guestcare.requests(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by_type VARCHAR(20) NOT NULL CHECK (changed_by_type IN ('guest', 'staff', 'system')),
    changed_by_id UUID,
    changed_by_name VARCHAR(255) NOT NULL,
    change_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_history_request ON guestcare.status_history(request_id, created_at);

-- 7. Table: guestcare.feedback
CREATE TABLE IF NOT EXISTS guestcare.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_ref VARCHAR(100) NOT NULL,
    apartment_ref VARCHAR(100) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
    staff_rating INTEGER CHECK (staff_rating BETWEEN 1 AND 5),
    comfort_rating INTEGER CHECK (comfort_rating BETWEEN 1 AND 5),
    comments TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'actioned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_reservation ON guestcare.feedback(reservation_ref);
CREATE INDEX IF NOT EXISTS idx_feedback_apartment ON guestcare.feedback(apartment_ref);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON guestcare.feedback(overall_rating);

-- 8. Table: guestcare.feedback_actions
CREATE TABLE IF NOT EXISTS guestcare.feedback_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES guestcare.feedback(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    staff_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('contacted_guest', 'room_visit', 'sent_amenity', 'discount_issued', 'internal_escalation')),
    notes TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_actions_feedback ON guestcare.feedback_actions(feedback_id);

-- 9. Table: guestcare.guest_health
CREATE TABLE IF NOT EXISTS guestcare.guest_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_ref VARCHAR(100) UNIQUE NOT NULL,
    apartment_ref VARCHAR(100) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'good' CHECK (status IN ('good', 'improving', 'at_risk', 'critical')),
    score INTEGER NOT NULL DEFAULT 100 CHECK (score BETWEEN 0 AND 100),
    reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_health_status ON guestcare.guest_health(status);
CREATE INDEX IF NOT EXISTS idx_guest_health_apt ON guestcare.guest_health(apartment_ref);

-- 10. Table: guestcare.notifications (Queue & Idempotency)
CREATE TABLE IF NOT EXISTS guestcare.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('staff', 'guest', 'department')),
    recipient_id VARCHAR(100), -- user UUID, email address, or department code
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('in_app', 'email')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(50) CHECK (reference_type IN ('request', 'feedback', 'health', 'session')),
    reference_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    error_message TEXT,
    idempotency_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_pending ON guestcare.notifications(status, retry_count) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON guestcare.notifications(recipient_type, recipient_id, created_at DESC);

-- 11. Table: guestcare.audit_logs
CREATE TABLE IF NOT EXISTS guestcare.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('guest', 'staff', 'system', 'pms')),
    actor_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON guestcare.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON guestcare.audit_logs(created_at DESC);

-- 12. Table: guestcare.settings
CREATE TABLE IF NOT EXISTS guestcare.settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

