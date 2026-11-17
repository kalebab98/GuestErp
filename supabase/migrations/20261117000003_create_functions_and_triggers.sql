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
