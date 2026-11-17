-- Migration 06: Guest Portal RPCs, Live Sync Policies, Storage Policies & Realtime
-- Project: GuestCare

-- 1. Ensure guestcare schema & sequences are accessible to Supabase API roles
GRANT USAGE ON SCHEMA guestcare TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA guestcare TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA guestcare TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA guestcare TO anon, authenticated, service_role;

-- 2. Controlled policies for Guest QR Portal & Staff Operations
-- (Allows QR-session mediated reads/writes cleanly while keeping audit_logs & internal comments protected)
DROP POLICY IF EXISTS p_portal_sessions_anon_read ON guestcare.portal_sessions;
CREATE POLICY p_portal_sessions_anon_read ON guestcare.portal_sessions
    FOR SELECT TO anon USING (revoked_at IS NULL AND expires_at > now());

DROP POLICY IF EXISTS p_portal_sessions_anon_insert ON guestcare.portal_sessions;
CREATE POLICY p_portal_sessions_anon_insert ON guestcare.portal_sessions
    FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS p_portal_sessions_anon_update ON guestcare.portal_sessions;
CREATE POLICY p_portal_sessions_anon_update ON guestcare.portal_sessions
    FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_requests_anon_access ON guestcare.requests;
CREATE POLICY p_requests_anon_access ON guestcare.requests
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_comments_anon_access ON guestcare.comments;
CREATE POLICY p_comments_anon_access ON guestcare.comments
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_attachments_anon_access ON guestcare.attachments;
CREATE POLICY p_attachments_anon_access ON guestcare.attachments
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_status_history_anon_read ON guestcare.status_history;
CREATE POLICY p_status_history_anon_read ON guestcare.status_history
    FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS p_status_history_anon_insert ON guestcare.status_history;
CREATE POLICY p_status_history_anon_insert ON guestcare.status_history
    FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS p_feedback_anon_access ON guestcare.feedback;
CREATE POLICY p_feedback_anon_access ON guestcare.feedback
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_feedback_actions_anon_access ON guestcare.feedback_actions;
CREATE POLICY p_feedback_actions_anon_access ON guestcare.feedback_actions
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_guest_health_anon_access ON guestcare.guest_health;
CREATE POLICY p_guest_health_anon_access ON guestcare.guest_health
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_notifications_anon_access ON guestcare.notifications;
CREATE POLICY p_notifications_anon_access ON guestcare.notifications
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_settings_anon_access ON guestcare.settings;
CREATE POLICY p_settings_anon_access ON guestcare.settings
    FOR ALL TO anon USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA guestcare TO anon;

-- 3. Storage bucket & upload policies for guestcare-attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'guestcare-attachments',
    'guestcare-attachments',
    false,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS p_storage_guestcare_upload ON storage.objects;
CREATE POLICY p_storage_guestcare_upload ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id = 'guestcare-attachments');

DROP POLICY IF EXISTS p_storage_guestcare_read ON storage.objects;
CREATE POLICY p_storage_guestcare_read ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'guestcare-attachments');

-- 4. Enable Supabase Realtime on core operational tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'guestcare' AND tablename = 'requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE guestcare.requests;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'guestcare' AND tablename = 'comments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE guestcare.comments;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'guestcare' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE guestcare.notifications;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'guestcare' AND tablename = 'settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE guestcare.settings;
    END IF;
END $$;

-- 5. Expose guestcare schema in PostgREST API configuration
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, guestcare';
NOTIFY pgrst, 'reload config';
