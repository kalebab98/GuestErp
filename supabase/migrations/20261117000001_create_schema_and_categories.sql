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

