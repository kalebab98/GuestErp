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
