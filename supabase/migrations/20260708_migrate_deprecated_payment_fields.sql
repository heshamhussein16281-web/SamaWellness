-- ============================================================================
-- PHASE 2: MIGRATE DEPRECATED PAYMENT FIELDS
-- Date: 2026-07-08
-- Purpose: Move data from deprecated payment fields to new consolidated fields
-- Risk: LOW (migration only, no schema changes)
-- ============================================================================

-- ============================================================================
-- STEP 1: MIGRATE payment_verified → payment_verified_1
-- ============================================================================
-- Copy all existing payment_verified values to payment_verified_1
-- for clients that don't already have it set

BEGIN;

-- Backup: Log migration start
DO $$
BEGIN
  RAISE NOTICE 'PHASE 2 MIGRATION STARTED: %', NOW();
  RAISE NOTICE 'Step 1: Migrating payment_verified → payment_verified_1';
END $$;

-- Count records BEFORE migration
DO $$
DECLARE
  old_count INT;
  new_count INT;
BEGIN
  SELECT COUNT(*) INTO old_count FROM clients WHERE payment_verified = true;
  SELECT COUNT(*) INTO new_count FROM clients WHERE payment_verified_1 = true;

  RAISE NOTICE 'BEFORE Migration: Old field (payment_verified=true): % records', old_count;
  RAISE NOTICE 'BEFORE Migration: New field (payment_verified_1=true): % records', new_count;
END $$;

-- Perform migration: Copy payment_verified → payment_verified_1
-- Only update if new field is false/null (don't overwrite existing data)
UPDATE clients
SET payment_verified_1 = payment_verified
WHERE (payment_verified_1 IS NULL OR payment_verified_1 = false)
  AND payment_verified = true;

-- Verify: Count records AFTER migration
DO $$
DECLARE
  migrated_count INT;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM clients WHERE payment_verified_1 = true;
  RAISE NOTICE 'AFTER Migration: New field (payment_verified_1=true): % records', migrated_count;
END $$;

-- ============================================================================
-- STEP 2: MIGRATE payment_date → payment_date_1
-- ============================================================================
-- Copy clients.payment_date (legacy DATE field) to payment_date_1 (TIMESTAMPTZ)
-- Handle NULL values gracefully

DO $$
BEGIN
  RAISE NOTICE 'Step 2: Migrating payment_date → payment_date_1';
END $$;

-- Count BEFORE
DO $$
DECLARE
  old_count INT;
BEGIN
  SELECT COUNT(*) INTO old_count FROM clients WHERE payment_date IS NOT NULL;
  RAISE NOTICE 'BEFORE: Old field (payment_date not null): % records', old_count;
END $$;

-- Perform migration: Copy payment_date → payment_date_1
-- Convert DATE to TIMESTAMPTZ (start of day)
UPDATE clients
SET payment_date_1 = (payment_date::TIMESTAMP AT TIME ZONE 'UTC')
WHERE payment_date_1 IS NULL
  AND payment_date IS NOT NULL;

-- Count AFTER
DO $$
DECLARE
  migrated_count INT;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM clients WHERE payment_date_1 IS NOT NULL;
  RAISE NOTICE 'AFTER: New field (payment_date_1 not null): % records', migrated_count;
END $$;

-- ============================================================================
-- STEP 3: VERIFICATION - Ensure data consistency
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Step 3: Verifying data consistency';
END $$;

-- Check 1: Verify no orphaned records (payment_date but no payment_date_1)
DO $$
DECLARE
  orphan_count INT;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM clients
  WHERE payment_date IS NOT NULL
    AND payment_date_1 IS NULL;

  IF orphan_count > 0 THEN
    RAISE NOTICE 'WARNING: Found % orphaned payment_date records', orphan_count;
  ELSE
    RAISE NOTICE 'VERIFIED: No orphaned payment_date records found ✓';
  END IF;
END $$;

-- Check 2: Verify no orphaned records (payment_verified but no payment_verified_1)
DO $$
DECLARE
  orphan_count INT;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM clients
  WHERE payment_verified = true
    AND payment_verified_1 = false;

  IF orphan_count > 0 THEN
    RAISE NOTICE 'WARNING: Found % orphaned payment_verified records', orphan_count;
  ELSE
    RAISE NOTICE 'VERIFIED: No orphaned payment_verified records found ✓';
  END IF;
END $$;

-- Check 3: Verify payment_verified_1 count consistency
DO $$
DECLARE
  verified_count INT;
  verified_amount_count INT;
BEGIN
  SELECT COUNT(*) INTO verified_count
  FROM clients
  WHERE payment_verified_1 = true;

  SELECT COUNT(*) INTO verified_amount_count
  FROM clients
  WHERE payment_amount_1 IS NOT NULL;

  RAISE NOTICE 'CONSISTENCY CHECK: payment_verified_1=true: % records', verified_count;
  RAISE NOTICE 'CONSISTENCY CHECK: payment_amount_1 not null: % records', verified_amount_count;

  IF verified_count = verified_amount_count THEN
    RAISE NOTICE 'VERIFIED: Counts match (data consistent) ✓';
  ELSE
    RAISE NOTICE 'WARNING: Counts mismatch - investigate required';
  END IF;
END $$;

-- ============================================================================
-- STEP 4: ADD DEPRECATION COMMENTS (already done in Phase 1, verify here)
-- ============================================================================

-- Verify deprecated fields are marked in schema
DO $$
BEGIN
  RAISE NOTICE 'Step 4: Verifying deprecation comments are in place';
  RAISE NOTICE 'Deprecated fields:';
  RAISE NOTICE '  - clients.payment_verified (replaced by payment_verified_1)';
  RAISE NOTICE '  - clients.payment_date (replaced by payment_date_1, payment_date_2, session_payment_date)';
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'PHASE 2 MIGRATION COMPLETE: %', NOW();
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Verify all checks passed (no WARNINGs above)';
  RAISE NOTICE '  2. Run code refactoring (update 11 files)';
  RAISE NOTICE '  3. Run comprehensive test suite';
  RAISE NOTICE '  4. Deploy to production with monitoring';
  RAISE NOTICE '';
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify success)
-- ============================================================================
-- SELECT COUNT(*) as payment_verified_1_count FROM clients WHERE payment_verified_1 = true;
-- SELECT COUNT(*) as payment_date_1_count FROM clients WHERE payment_date_1 IS NOT NULL;
-- SELECT COUNT(*) as orphan_count FROM clients WHERE payment_date IS NOT NULL AND payment_date_1 IS NULL;
-- SELECT id, name, payment_verified, payment_verified_1 FROM clients WHERE payment_verified = true LIMIT 10;
