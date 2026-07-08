# Phase 2 Test Suite

**Date:** 2026-07-08  
**Status:** Ready for execution  
**Duration:** ~2 hours (automated 30min + manual 90min)

---

## Test Categories

### 1. Automated Tests (API Level)

#### Test 1.1: Verify new field names accepted by PUT endpoint
```bash
# Test: API accepts new field names only

ENDPOINT: PUT /api/admin/clients/{id}
METHOD: PUT
BODY:
{
  "payment_verified_1": true,
  "payment_amount_1": 2000,
  "payment_date_1": "2026-07-08T12:00:00Z",
  "payment_verified_2": false,
  "payment_amount_2": null,
  "payment_date_2": null,
  "total_payment_due": 2000,
  "total_amount_paid": 2000,
  "session_payment_received": false,
  "session_payment_date": null,
  "session_payment_amount": null
}

EXPECTED: 200 OK, successful update
```

#### Test 1.2: Verify old field names rejected by PUT endpoint
```bash
# Test: API rejects deprecated field names

ENDPOINT: PUT /api/admin/clients/{id}
METHOD: PUT
BODY:
{
  "payment_verified": true,      # OLD - should be rejected
  "payment_date": "2026-07-08"   # OLD - should be rejected
}

EXPECTED: Should not update these fields (silently ignored or error)
VERIFY: Database shows payment_verified_1 not updated
```

#### Test 1.3: Verify GET clients endpoint returns new field names
```bash
# Test: List endpoint returns correct payment fields

ENDPOINT: GET /api/admin/clients?page=1&limit=10
METHOD: GET

VERIFY IN RESPONSE:
- payment_verified_1 (boolean)
- payment_amount_1 (number | null)
- payment_verified_2 (boolean)
- payment_amount_2 (number | null)
- total_payment_due (number | null)
- total_amount_paid (number | null)
- session_payment_received (boolean)

NOT PRESENT IN RESPONSE:
- payment_verified (old field)
- payment_date (old field)

EXPECTED: 200 OK with correct field structure
```

#### Test 1.4: Verify profile endpoint uses new field names
```bash
# Test: Single client profile returns new fields

ENDPOINT: GET /api/admin/clients/{id}/profile
METHOD: GET

VERIFY: Response includes payment fields from consolidated schema
EXPECTED: 200 OK
```

---

### 2. Data Migration Tests

#### Test 2.1: Run migration script and verify data integrity
```sql
-- Execute the migration

-- Before:
SELECT COUNT(*) as payment_verified_count FROM clients 
  WHERE payment_verified = true;

SELECT COUNT(*) as payment_date_count FROM clients 
  WHERE payment_date IS NOT NULL;

-- Run migration: /supabase/migrations/20260708_migrate_deprecated_payment_fields.sql

-- After:
SELECT COUNT(*) as payment_verified_1_count FROM clients 
  WHERE payment_verified_1 = true;

SELECT COUNT(*) as payment_date_1_count FROM clients 
  WHERE payment_date_1 IS NOT NULL;

-- Verify counts match:
-- payment_verified_count ≈ payment_verified_1_count (allow small variance)
-- payment_date_count ≈ payment_date_1_count (allow small variance)

-- Verify no orphaned records:
SELECT COUNT(*) as orphans FROM clients 
  WHERE payment_date IS NOT NULL AND payment_date_1 IS NULL;
-- Expected: 0 orphans
```

#### Test 2.2: Verify backward compatibility during transition
```sql
-- Verify both old and new fields co-exist during transition period

SELECT id, 
  payment_verified, payment_verified_1,
  payment_date, payment_date_1
FROM clients 
WHERE payment_verified_1 IS NOT NULL
LIMIT 5;

-- Expected: Old fields have data, new fields have data
-- This allows rollback if needed
```

---

### 3. End-to-End Flow Tests (Manual)

#### Test 3.1: Complete booking + payment verification flow

**Prerequisites:**
- Test recurring client exists (ID 90 or similar)
- Test therapist assigned (pre-assigned)
- Dev server running on http://localhost:3004

**Steps:**
1. Navigate to: http://localhost:3004/dashboard/clinical/clients
2. Find test recurring client
3. Click "Book Session" button
4. Verify BookingCalendarModal renders (PHASE 1 FIX)
5. Fill booking form:
   - Select future date
   - Select time slot
   - Select room
6. Click "Confirm Booking"
7. Verify success message
8. Database check:
   ```sql
   SELECT id, booking_status, payment_status FROM bookings 
   WHERE client_id = 90 
   ORDER BY created_at DESC LIMIT 1;
   ```
   Expected: booking_status = 'confirmed', payment_status = 'unpaid'

**Expected Result:** ✅ Booking created successfully

---

#### Test 3.2: Payment verification with new field names

**Prerequisites:**
- Test booking exists from Test 3.1
- Booking is in 'confirmed' status
- Payment is 'unpaid'

**Steps:**
1. In client profile, scroll to "Bookings" tab
2. Find the booking created in Test 3.1
3. Verify booking shows amount (calculated from therapist rate × duration)
4. Click "Verify Payment" or payment action button
5. Verify PaymentVerificationModal renders
6. Select payment date
7. Click "Confirm Payment"
8. Verify success message "Payment Verified ✅"

**Database Verification:**
```sql
-- Check payment_history table
SELECT * FROM payment_history 
WHERE client_id = 90 
ORDER BY created_at DESC LIMIT 1;

-- Should show:
-- amount: 2000 (EGP)
-- payment_type: 'session' or 'assessment'
-- verified: true
-- verified_at: just now

-- Check clients table
SELECT id, 
  payment_verified_1, payment_amount_1, payment_date_1,
  total_amount_paid, session_payment_received
FROM clients WHERE id = 90;

-- Should show new field names updated (not old fields)
```

**Expected Result:** ✅ Payment verified with new field names

---

#### Test 3.3: Verify recurring client session reset

**Prerequisites:**
- Test 3.2 completed (payment verified)

**Steps:**
1. Complete the session (mark as completed)
2. Verify client status changes
3. Verify payment fields reset for next session
4. Try to book another session

**Database Verification:**
```sql
SELECT id, status, is_recurring, 
  payment_verified_1, payment_verified_2,
  total_sessions_completed
FROM clients WHERE id = 90;

-- After completion:
-- status should change based on is_recurring
-- total_sessions_completed should increment
-- payment fields should be ready for next cycle
```

**Expected Result:** ✅ Recurring client can book next session

---

#### Test 3.4: Test multiple payment tiers (if therapist rate > 2000)

**Prerequisites:**
- Therapist with hourly_rate > 2000 EGP
- Test one-time client (non-recurring)

**Steps:**
1. Create new test client (one-time)
2. Assign therapist with high rate
3. Book session
4. Check payment calculation

**Database Verification:**
```sql
SELECT therapist_id, hourly_rate FROM therapists 
WHERE hourly_rate > 2000 LIMIT 1;

-- Use this therapist to create test client
-- Book session with high-rate therapist
-- Verify payment_verified_2 needed

SELECT id, payment_amount_1, payment_verified_2, payment_amount_2
FROM clients WHERE [test_client];
```

**Expected Result:** ✅ Two-tier payment system works correctly

---

### 4. Regression Tests

#### Test 4.1: Existing clients still load and display correctly
```bash
# Test: No breaking changes to existing functionality

ENDPOINT: GET /api/admin/clients?page=1
VERIFY:
- Page loads without errors
- Clients list displays
- Sorting/filtering works
- Client profile loads
- No console errors

EXPECTED: All existing features work unchanged
```

#### Test 4.2: Payment history visible in client profile
```bash
# Test: Payment history tab still works

ENDPOINT: Client profile → Payments tab
VERIFY:
- Payment history displays
- Dates formatted correctly
- Amounts correct
- No missing records

EXPECTED: Payment history complete and accurate
```

#### Test 4.3: Therapist rate changes don't break payment logic
```bash
# Test: Update therapist rate, verify new bookings use new rate

1. Create test client
2. Assign therapist with rate X
3. Book session (calculates payment based on rate X)
4. Change therapist rate to Y
5. Create new test client
6. Assign same therapist
7. Book session (should calculate based on new rate Y)

VERIFY: Each booking uses correct rate for its time
```

#### Test 4.4: Session list and history unchanged
```bash
# Test: Sessions/history queries still work

ENDPOINTS:
- GET /api/admin/clients/{id}/sessions
- GET /api/admin/clients/{id}/status-history
- GET /api/admin/bookings

VERIFY: All return correct data, no schema changes
```

---

## Checklist: Running Tests

### Pre-Test Setup
- [ ] Backup production database (if testing production)
- [ ] Start dev server: `npm run dev`
- [ ] Verify dev server ready: http://localhost:3004/dashboard/clinical/clients
- [ ] Clear browser cache
- [ ] Have SQL client ready for database queries

### Automated Tests
- [ ] Test 1.1: API accepts new field names ✓/✗
- [ ] Test 1.2: API rejects old field names ✓/✗
- [ ] Test 1.3: GET clients returns new fields ✓/✗
- [ ] Test 1.4: Profile endpoint uses new fields ✓/✗

### Data Migration Tests
- [ ] Test 2.1: Migration runs, data integrity verified ✓/✗
- [ ] Test 2.2: Both old and new fields co-exist ✓/✗

### End-to-End Tests
- [ ] Test 3.1: Booking flow complete ✓/✗
- [ ] Test 3.2: Payment verification with new fields ✓/✗
- [ ] Test 3.3: Recurring client session reset ✓/✗
- [ ] Test 3.4: Multiple payment tiers work ✓/✗

### Regression Tests
- [ ] Test 4.1: Existing clients load correctly ✓/✗
- [ ] Test 4.2: Payment history displays ✓/✗
- [ ] Test 4.3: Therapist rate changes work ✓/✗
- [ ] Test 4.4: Session/history queries work ✓/✗

### Post-Test
- [ ] All tests passed (16/16)
- [ ] No console errors
- [ ] No database issues
- [ ] Ready for code review
- [ ] Ready for staging deployment

---

## Success Criteria

✅ **All tests must pass for Phase 2 approval**

| Test | Required | Status |
|------|----------|--------|
| API accepts new fields | YES | ⏳ |
| API rejects old fields | YES | ⏳ |
| Migration data integrity | YES | ⏳ |
| Booking flow end-to-end | YES | ⏳ |
| Payment verification flow | YES | ⏳ |
| No regression in existing features | YES | ⏳ |
| Database state correct | YES | ⏳ |
| Zero console errors | YES | ⏳ |

---

## Test Execution Notes

- Run tests in staging environment if possible
- If issues found, refer to PHASE_2_EXECUTION_CHECKLIST.md for remediation
- Document any failures with screenshots and console logs
- All tests should complete in ~2 hours total
- If any test fails, stop and investigate before proceeding
- Rollback procedure available in PHASE_2_DETAILED_PLAN.md

---

**Test Suite Created:** 2026-07-08  
**Status:** Ready for execution  
**Next Step:** Execute tests and verify all pass before staging deployment
