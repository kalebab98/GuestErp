-- Migration 01: Create Schema and Categories
-- Project: GuestCare
-- Description: Sets up the dedicated guestcare schema and service categories

CREATE SCHEMA IF NOT EXISTS guestcare;

-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: guestcare.categories
CREATE TABLE IF NOT EXISTS guestcare.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_department VARCHAR(50) NOT NULL CHECK (default_department IN ('maintenance', 'housekeeping', 'reception', 'management')),
    default_priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (default_priority IN ('low', 'medium', 'high', 'urgent')),
    sla_minutes INTEGER NOT NULL DEFAULT 60 CHECK (sla_minutes > 0),
    icon_name VARCHAR(50) NOT NULL DEFAULT 'wrench',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for category code lookup and ordering
CREATE INDEX IF NOT EXISTS idx_categories_active_order ON guestcare.categories(is_active, display_order);

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

-- Migration 03: Functions and Triggers
-- Project: GuestCare
-- Description: Ticket number generation, status change audit trigger, guest health rule engine, notification queue helper

-- Sequence for daily ticket counter
CREATE SEQUENCE IF NOT EXISTS guestcare.ticket_seq START WITH 1;

-- Function: Generate unique ticket number (GC-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION guestcare.generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    today_str VARCHAR(8);
    seq_val BIGINT;
    generated_ticket VARCHAR(30);
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        today_str := to_char(now() AT TIME ZONE 'UTC', 'YYYYMMDD');
        seq_val := nextval('guestcare.ticket_seq');
        generated_ticket := 'GC-' || today_str || '-' || lpad((seq_val % 10000)::text, 4, '0');
        NEW.ticket_number := generated_ticket;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_requests_ticket_number ON guestcare.requests;
CREATE TRIGGER trg_requests_ticket_number
BEFORE INSERT ON guestcare.requests
FOR EACH ROW
EXECUTE FUNCTION guestcare.generate_ticket_number();

-- Function: Automatically record status changes into status_history
CREATE OR REPLACE FUNCTION guestcare.handle_request_status_change()
RETURNS TRIGGER AS $$
DECLARE
    actor_type_val VARCHAR(20) := 'system';
    actor_name_val VARCHAR(255) := 'GuestCare System';
    actor_id_val UUID := NULL;
BEGIN
    -- Determine actor
    IF auth.role() = 'authenticated' THEN
        actor_type_val := 'staff';
        actor_id_val := auth.uid();
        actor_name_val := coalesce(NEW.assigned_staff_name, 'Staff Member');
    ELSIF current_setting('guestcare.current_actor_type', true) = 'guest' THEN
        actor_type_val := 'guest';
        actor_name_val := NEW.guest_name;
    END IF;

    -- Only record if status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- If reopening, increment count
        IF NEW.status = 'reopened' THEN
            NEW.reopen_count := OLD.reopen_count + 1;
        END IF;

        -- Update timestamps for resolved / closed
        IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
            NEW.resolved_at := coalesce(NEW.resolved_at, now());
        ELSIF NEW.status = 'closed' AND OLD.status != 'closed' THEN
            NEW.closed_at := coalesce(NEW.closed_at, now());
        END IF;

        NEW.updated_at := now();

        INSERT INTO guestcare.status_history (
            request_id,
            from_status,
            to_status,
            changed_by_type,
            changed_by_id,
            changed_by_name,
            change_reason,
            metadata
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            actor_type_val,
            actor_id_val,
            actor_name_val,
            NEW.resolution_notes,
            jsonb_build_object(
                'priority', NEW.priority,
                'reopen_count', NEW.reopen_count,
                'reopen_reason', NEW.reopen_reason
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_requests_status_change ON guestcare.requests;
CREATE TRIGGER trg_requests_status_change
BEFORE UPDATE ON guestcare.requests
FOR EACH ROW
EXECUTE FUNCTION guestcare.handle_request_status_change();

-- Function: Rule-based Guest Experience Health calculation
CREATE OR REPLACE FUNCTION guestcare.calculate_guest_health(p_res_ref VARCHAR(100))
RETURNS JSONB AS $$
DECLARE
    v_apt_ref VARCHAR(100);
    v_guest_name VARCHAR(255);
    v_score INTEGER := 100;
    v_status VARCHAR(20) := 'good';
    v_reasons JSONB := '[]'::jsonb;
    
    v_open_urgent_count INTEGER := 0;
    v_open_high_count INTEGER := 0;
    v_open_medium_count INTEGER := 0;
    v_reopened_count INTEGER := 0;
    v_unsatisfied_count INTEGER := 0;
    v_resolved_count INTEGER := 0;
    v_avg_feedback NUMERIC := NULL;
    v_low_feedback_count INTEGER := 0;
BEGIN
    -- Get apartment & guest info
    SELECT apartment_ref, guest_name 
    INTO v_apt_ref, v_guest_name
    FROM guestcare.requests 
    WHERE reservation_ref = p_res_ref 
    ORDER BY created_at DESC 
    LIMIT 1;

    IF v_apt_ref IS NULL THEN
        SELECT apartment_ref, guest_name 
        INTO v_apt_ref, v_guest_name
        FROM guestcare.portal_sessions 
        WHERE reservation_ref = p_res_ref 
        ORDER BY created_at DESC 
        LIMIT 1;
    END IF;

    IF v_apt_ref IS NULL THEN
        RETURN jsonb_build_object('error', 'Reservation not found');
    END IF;

    -- Aggregate ticket stats
    SELECT 
        count(*) FILTER (WHERE status IN ('new', 'acknowledged', 'assigned', 'in_progress', 'waiting') AND priority = 'urgent'),
        count(*) FILTER (WHERE status IN ('new', 'acknowledged', 'assigned', 'in_progress', 'waiting') AND priority = 'high'),
        count(*) FILTER (WHERE status IN ('new', 'acknowledged', 'assigned', 'in_progress', 'waiting') AND priority = 'medium'),
        coalesce(sum(reopen_count), 0),
        count(*) FILTER (WHERE guest_satisfaction = 'unsatisfied' OR status = 'reopened'),
        count(*) FILTER (WHERE status IN ('resolved', 'closed') AND (guest_satisfaction IS NULL OR guest_satisfaction = 'satisfied'))
    INTO 
        v_open_urgent_count,
        v_open_high_count,
        v_open_medium_count,
        v_reopened_count,
        v_unsatisfied_count,
        v_resolved_count
    FROM guestcare.requests
    WHERE reservation_ref = p_res_ref;

    -- Feedback stats
    SELECT 
        avg(overall_rating),
        count(*) FILTER (WHERE overall_rating <= 2)
    INTO 
        v_avg_feedback,
        v_low_feedback_count
    FROM guestcare.feedback
    WHERE reservation_ref = p_res_ref;

    -- Deterministic rule deductions:
    -- 1. Urgent open requests (-35 each)
    IF v_open_urgent_count > 0 THEN
        v_score := v_score - (v_open_urgent_count * 35);
        v_reasons := v_reasons || jsonb_build_array(v_open_urgent_count || ' unresolved urgent request(s)');
    END IF;

    -- 2. High priority open requests (-20 each)
    IF v_open_high_count > 0 THEN
        v_score := v_score - (v_open_high_count * 20);
        v_reasons := v_reasons || jsonb_build_array(v_open_high_count || ' unresolved high priority request(s)');
    END IF;

    -- 3. Reopened requests (-25 each)
    IF v_reopened_count > 0 THEN
        v_score := v_score - (v_reopened_count * 25);
        v_reasons := v_reasons || jsonb_build_array(v_reopened_count || ' request(s) reopened by guest');
    END IF;

    -- 4. Negative in-stay feedback (-30)
    IF v_low_feedback_count > 0 THEN
        v_score := v_score - (v_low_feedback_count * 30);
        v_reasons := v_reasons || jsonb_build_array('Low private rating submitted (' || round(coalesce(v_avg_feedback, 2), 1) || '/5)');
    END IF;

    -- 5. Open medium requests (-10 each)
    IF v_open_medium_count > 0 THEN
        v_score := v_score - (v_open_medium_count * 10);
        v_reasons := v_reasons || jsonb_build_array(v_open_medium_count || ' unresolved standard request(s)');
    END IF;

    -- 6. Positive recovery / resolution boost (+10 if issues were resolved)
    IF v_resolved_count > 0 AND v_open_urgent_count = 0 AND v_open_high_count = 0 THEN
        v_score := v_score + (v_resolved_count * 5);
        v_reasons := v_reasons || jsonb_build_array(v_resolved_count || ' request(s) resolved successfully');
    END IF;

    -- Normalize score between 0 and 100
    IF v_score > 100 THEN v_score := 100; END IF;
    IF v_score < 0 THEN v_score := 0; END IF;

    -- Determine status bucket
    IF v_score >= 80 THEN
        IF v_resolved_count > 0 AND (v_open_urgent_count + v_open_high_count = 0) THEN
            v_status := 'improving';
        ELSE
            v_status := 'good';
        END IF;
    ELSIF v_score >= 55 THEN
        v_status := 'at_risk';
    ELSE
        v_status := 'critical';
    END IF;

    -- If no reasons accumulated, state healthy
    IF jsonb_array_length(v_reasons) = 0 THEN
        v_reasons := jsonb_build_array('No complaints or open issues reported; stay running smoothly');
    END IF;

    -- Upsert into guestcare.guest_health
    INSERT INTO guestcare.guest_health (
        reservation_ref,
        apartment_ref,
        guest_name,
        status,
        score,
        reasons,
        last_calculated_at,
        updated_at
    ) VALUES (
        p_res_ref,
        v_apt_ref,
        v_guest_name,
        v_status,
        v_score,
        v_reasons,
        now(),
        now()
    )
    ON CONFLICT (reservation_ref) DO UPDATE SET
        status = EXCLUDED.status,
        score = EXCLUDED.score,
        reasons = EXCLUDED.reasons,
        last_calculated_at = now(),
        updated_at = now();

    RETURN jsonb_build_object(
        'reservation_ref', p_res_ref,
        'status', v_status,
        'score', v_score,
        'reasons', v_reasons
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger: Health recalculation on request change
CREATE OR REPLACE FUNCTION guestcare.trg_recalc_health_on_request()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM guestcare.calculate_guest_health(NEW.reservation_ref);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_requests_recalc_health ON guestcare.requests;
CREATE TRIGGER trg_requests_recalc_health
AFTER INSERT OR UPDATE ON guestcare.requests
FOR EACH ROW
EXECUTE FUNCTION guestcare.trg_recalc_health_on_request();

-- Migration 04: Row Level Security (RLS) Policies
-- Project: GuestCare
-- Description: Secures all tables in schema guestcare with strict role-based access and tenant isolation

-- Enable RLS on all tables
ALTER TABLE guestcare.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.feedback_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.guest_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestcare.settings ENABLE ROW LEVEL SECURITY;

-- 1. categories policies
-- Anyone (including guest portal) can read active categories
CREATE POLICY p_categories_read_public ON guestcare.categories
    FOR SELECT USING (is_active = true);

-- Staff can manage categories
CREATE POLICY p_categories_staff_all ON guestcare.categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. portal_sessions policies
-- Staff can view and revoke portal sessions
CREATE POLICY p_portal_sessions_staff ON guestcare.portal_sessions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. requests policies
-- Authenticated staff can view and manage all requests
CREATE POLICY p_requests_staff_all ON guestcare.requests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. assignments policies
CREATE POLICY p_assignments_staff_all ON guestcare.assignments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. comments policies
-- Staff can read and write all comments
CREATE POLICY p_comments_staff_all ON guestcare.comments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. attachments policies
CREATE POLICY p_attachments_staff_all ON guestcare.attachments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. status_history policies
-- Staff can view immutable history
CREATE POLICY p_status_history_staff_read ON guestcare.status_history
    FOR SELECT TO authenticated USING (true);

-- 8. feedback & feedback_actions policies
CREATE POLICY p_feedback_staff_all ON guestcare.feedback
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY p_feedback_actions_staff_all ON guestcare.feedback_actions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. guest_health policies
CREATE POLICY p_guest_health_staff_all ON guestcare.guest_health
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. notifications policies
CREATE POLICY p_notifications_staff_all ON guestcare.notifications
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11. audit_logs policies
CREATE POLICY p_audit_logs_staff_read ON guestcare.audit_logs
    FOR SELECT TO authenticated USING (true);

-- 12. settings policies
CREATE POLICY p_settings_staff_read ON guestcare.settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY p_settings_staff_manage ON guestcare.settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Migration 05: Seed Categories and Default Settings
-- Project: GuestCare (16 Apartments: 1A-8B + Ground Floor Medical Store)

-- Insert operational service categories (aligned with Guest Portal)
INSERT INTO guestcare.categories (code, name, description, default_department, default_priority, sla_minutes, icon_name, display_order)
VALUES
    ('maintenance', 'Maintenance & Repairs', 'Plumbing, hot water, electrical outlets, kitchen appliances, doors, and locks', 'maintenance', 'high', 30, 'Wrench', 1),
    ('housekeeping', 'Housekeeping & Supplies', 'Fresh towels, bed linen, apartment cleaning, toiletries, and trash removal', 'housekeeping', 'medium', 25, 'Sparkles', 2),
    ('laundry', 'Laundry & Ironing', 'Wash & fold pickup, shirt pressing, dry cleaning, and hangers', 'housekeeping', 'medium', 30, 'Shirt', 3),
    ('shop_delivery', 'Shop & Local Delivery', 'Coffee, tea, food, mobile cards, cigarettes, water, and daily items', 'reception', 'medium', 25, 'ShoppingBag', 4),
    ('comfort', 'Comfort & Essentials', 'Standing fans, extra blankets, pillows, iron & ironing board, and glassware', 'reception', 'medium', 35, 'BedDouble', 5),
    ('internet_tech', 'Wi-Fi & Tech', 'Wi-Fi connection help, Smart TV, remote batteries, HDMI cables, and adapters', 'reception', 'medium', 30, 'Wifi', 6),
    ('guest_services', 'Front Desk Services', 'Late check-out, luggage storage, extra apartment keys, and taxi/airport rides', 'reception', 'low', 20, 'Bell', 7),
    ('other', 'Other Requests', 'Invoicing, special requests, and general assistance from our team', 'reception', 'medium', 40, 'HelpCircle', 8)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    default_department = EXCLUDED.default_department,
    default_priority = EXCLUDED.default_priority,
    sla_minutes = EXCLUDED.sla_minutes,
    icon_name = EXCLUDED.icon_name,
    display_order = EXCLUDED.display_order;

-- Insert default application & building settings
INSERT INTO guestcare.settings (key, value, description)
VALUES
    ('sla_urgent_minutes', '15'::jsonb, 'SLA target for urgent requests in minutes'),
    ('sla_high_minutes', '45'::jsonb, 'SLA target for high priority requests in minutes'),
    ('sla_medium_minutes', '120'::jsonb, 'SLA target for medium priority requests in minutes'),
    ('sla_low_minutes', '240'::jsonb, 'SLA target for low priority requests in minutes'),
    ('token_grace_period_hours', '2'::jsonb, 'Hours after checkout before guest portal token expires'),
    ('front_desk_phone', '"+251 911 000 000"'::jsonb, 'Direct front desk phone number shown to guests'),
    ('front_desk_whatsapp', '"+251911000000"'::jsonb, 'Direct Front Desk WhatsApp contact'),
    ('wifi_config', '{"networkName":"GrandMarina-5G","password":"residenceguest"}'::jsonb, 'Guest Wi-Fi credentials shown on dashboard'),
    ('medical_store_info', '{"name":"Ground Floor Medical Store","phone":"+251 911 550 100","hours":"8:00 AM - 10:00 PM Daily"}'::jsonb, 'Ground floor building medical store details')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- Grant schema usage to Supabase API roles so REST API can access guestcare schema
GRANT USAGE ON SCHEMA guestcare TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA guestcare TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA guestcare TO authenticated;
GRANT SELECT ON guestcare.categories TO anon;
GRANT SELECT ON guestcare.settings TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA guestcare TO authenticated, service_role;
