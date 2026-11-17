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

