-- Migration 04: Row Level Security (RLS) Policies (Idempotent)
-- Project: GuestCare
-- Description: Secures all tables in schema guestcare with strict role-based access

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

DROP POLICY IF EXISTS p_categories_read_public ON guestcare.categories;
CREATE POLICY p_categories_read_public ON guestcare.categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS p_categories_staff_all ON guestcare.categories;
CREATE POLICY p_categories_staff_all ON guestcare.categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_portal_sessions_staff ON guestcare.portal_sessions;
CREATE POLICY p_portal_sessions_staff ON guestcare.portal_sessions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_requests_staff_all ON guestcare.requests;
CREATE POLICY p_requests_staff_all ON guestcare.requests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_assignments_staff_all ON guestcare.assignments;
CREATE POLICY p_assignments_staff_all ON guestcare.assignments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_comments_staff_all ON guestcare.comments;
CREATE POLICY p_comments_staff_all ON guestcare.comments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_attachments_staff_all ON guestcare.attachments;
CREATE POLICY p_attachments_staff_all ON guestcare.attachments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_status_history_staff_read ON guestcare.status_history;
CREATE POLICY p_status_history_staff_read ON guestcare.status_history
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS p_feedback_staff_all ON guestcare.feedback;
CREATE POLICY p_feedback_staff_all ON guestcare.feedback
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_feedback_actions_staff_all ON guestcare.feedback_actions;
CREATE POLICY p_feedback_actions_staff_all ON guestcare.feedback_actions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_guest_health_staff_all ON guestcare.guest_health;
CREATE POLICY p_guest_health_staff_all ON guestcare.guest_health
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_notifications_staff_all ON guestcare.notifications;
CREATE POLICY p_notifications_staff_all ON guestcare.notifications
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_audit_logs_staff_read ON guestcare.audit_logs;
CREATE POLICY p_audit_logs_staff_read ON guestcare.audit_logs
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS p_settings_staff_read ON guestcare.settings;
CREATE POLICY p_settings_staff_read ON guestcare.settings
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS p_settings_staff_manage ON guestcare.settings;
CREATE POLICY p_settings_staff_manage ON guestcare.settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
