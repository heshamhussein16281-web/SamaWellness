-- Migration: Add Clinical Intake Fields to Clients Table
-- Date: 2026-06-14
-- Purpose: Store gender, language, primary concern, and client preferences
--          collected during the initial intake process
--
-- These fields were being collected in the intake form but not persisted.
-- This migration adds them to the clients table to ensure no data loss.

-- ============================================================================
-- 1. ADD COLUMNS TO CLIENTS TABLE
-- ============================================================================

-- Gender field: Optional, stores client's gender preference
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gender VARCHAR(50);

-- Language field: Optional, stores client's preferred language for sessions
ALTER TABLE clients ADD COLUMN IF NOT EXISTS language VARCHAR(255);

-- Concern field: Primary reason for seeking therapy
-- This field was marked as REQUIRED in the intake form but never saved
ALTER TABLE clients ADD COLUMN IF NOT EXISTS concern TEXT;

-- Preferences field: Optional, stores client's session preferences
-- (e.g., therapist gender, time preferences, session modality)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferences TEXT;

-- ============================================================================
-- 2. CREATE INDEXES FOR NEW COLUMNS
-- ============================================================================

-- Index on gender for filtering/reporting
CREATE INDEX IF NOT EXISTS idx_clients_gender ON clients(gender);

-- Index on language for filtering clients by language
CREATE INDEX IF NOT EXISTS idx_clients_language ON clients(language);

-- ============================================================================
-- 3. UPDATE COMMENTS (Optional but helpful for documentation)
-- ============================================================================

-- Note: These columns are populated during the intake process
-- and can be updated/modified through the client profile management
-- endpoints at any point in the client lifecycle.

COMMENT ON COLUMN clients.gender IS 'Client gender preference (male, female, other, prefer_not_to_say)';
COMMENT ON COLUMN clients.language IS 'Client preferred language for therapy sessions';
COMMENT ON COLUMN clients.concern IS 'Primary reason for seeking therapy (required during intake)';
COMMENT ON COLUMN clients.preferences IS 'Client session preferences and special requests';
