-- Migration 05: Seed Categories and Default Settings
-- Project: GuestCare
-- Note: Operational categories and operational settings seeded. 
-- Any mock demonstration reservations are strictly marked with DEMO prefixes.

-- Insert default service categories
INSERT INTO guestcare.categories (code, name, description, default_department, default_priority, sla_minutes, icon_name, display_order)
VALUES
    ('maintenance', 'Maintenance & Repairs', 'Plumbing, electricity, heating/AC, kitchen appliances, and fixtures', 'maintenance', 'high', 45, 'wrench', 1),
    ('housekeeping', 'Housekeeping & Supplies', 'Fresh towels, bed linen change, room cleaning, toiletries, trash removal', 'housekeeping', 'medium', 30, 'sparkles', 2),
    ('comfort', 'Comfort & Apartment Conditions', 'Room temperature, bed/pillow requests, kitchenware, lighting, odors', 'reception', 'medium', 60, 'bed', 3),
    ('internet_tech', 'Internet & Technology', 'Wi-Fi connection issues, Smart TV, streaming devices, keycard problems', 'reception', 'medium', 45, 'wifi', 4),
    ('guest_services', 'Guest Services', 'Luggage assistance, extra keys, late checkout request, local transportation', 'reception', 'low', 60, 'bell', 5),
    ('noise', 'Noise & Disturbances', 'Neighbor disturbance, building noise, corridor or street noise', 'reception', 'urgent', 15, 'volume-x', 6),
    ('other', 'Other Inquiries / Complaints', 'General feedback, accounting/invoicing, special assistance', 'reception', 'medium', 60, 'help-circle', 7)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    default_department = EXCLUDED.default_department,
    default_priority = EXCLUDED.default_priority,
    sla_minutes = EXCLUDED.sla_minutes,
    icon_name = EXCLUDED.icon_name,
    display_order = EXCLUDED.display_order;

-- Insert default application settings
INSERT INTO guestcare.settings (key, value, description)
VALUES
    ('sla_urgent_minutes', '15'::jsonb, 'SLA target for urgent requests in minutes'),
    ('sla_high_minutes', '45'::jsonb, 'SLA target for high priority requests in minutes'),
    ('sla_medium_minutes', '120'::jsonb, 'SLA target for medium priority requests in minutes'),
    ('sla_low_minutes', '240'::jsonb, 'SLA target for low priority requests in minutes'),
    ('token_grace_period_hours', '2'::jsonb, 'Hours after checkout before guest portal token expires'),
    ('reception_phone', '"+1 (555) 019-2834"'::jsonb, 'Direct reception phone number shown to guests'),
    ('reception_whatsapp', '"+15550192834"'::jsonb, 'Direct WhatsApp contact link')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;
