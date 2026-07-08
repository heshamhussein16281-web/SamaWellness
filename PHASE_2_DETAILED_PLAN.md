# Phase 2: Payment Schema Deprecation & Migration

**Status:** Ready to proceed (upon team approval)  
**Date Created:** 2026-07-08  
**Estimated Duration:** 4-6 business days  
**Risk Level:** MEDIUM (requires database migration and code changes across 11 files)

---

## Executive Summary

Phase 1 created comprehensive documentation and marked deprecated fields without breaking changes. Phase 2 will:

1. **Data Migration** - Copy legacy field data to new fields
2. **Code Refactoring** - Remove 11 file references to deprecated fields
3. **Testing** - Comprehensive payment flow validation
4. **Verification** - Ensure no breaking changes in production

**Prerequisites Met:** ✅ Documentation complete, ✅ Booking error fixed, ✅ Test data utilities ready

---

## Phase 2 Deliverables

### 1. Data Migration (Database)

**File:** Create new migration file `/supabase/migrations/20260708_migrate_deprecated_payment_fields.sql`

**Tasks:**
```sql
-- Task 1: Migrate payment_verified → payment_verified_1
-- Copy all existing payment_verified values to payment_verified_1 for clients that don't already have it
UPDATE clients 
SET payment_verified_1 = payment_verified
WHERE payment_verified_1 IS NULL OR payment_verified_1 = false;

-- Task 2: Migrate payment_date → payment_date_1
-- Copy clients.payment_date (legacy) to payment_date_1 (current)
-- Handle NULL values gracefully
UPDATE clients
SET payment_date_1 = payment_date
WHERE payment_date_1 IS NULL AND payment_date IS NOT NULL;

-- Task 3: Add DEPRECATED comment to old columns (if not already done)
-- Mark payment_verified as deprecated
-- Mark payment_date as deprecated

-- Task 4: Verify data consistency
-- Count records where payment_verified_1 = true and payment_date_1 IS NULL
-- These indicate incomplete migrations that need investigation
```

**Validation checks:**
- Before migration: Record counts of `payment_verified = true` vs `payment_verified_1 = true`
- After migration: Counts should match (within rounding)
- After migration: No clients with `payment_date` but no `payment_date_1` (for non-null dates)

---

### 2. Code Refactoring (Remove Deprecated Field Usage)

**Files to Update:** 11 files using `payment_verified` field

**File 1-3: Payment Modal Components**
- `/app/dashboard/clinical/clients/PaymentVerificationModal.tsx` - Already has deprecation comment
- Update logging/debugging to reference new fields
- Change: Any references to deprecated fields in comments/logs

**File 4-7: Client Dashboard/List Pages**
- `/app/dashboard/clinical/clients/page.tsx` - Client list display
- `/app/dashboard/clinical/clients/ClientProfile.tsx` - Client detail view
- Update queries to select `payment_verified_1` instead of `payment_verified`
- Update display logic to use new fields

**File 8-11: API Routes**
- `/app/api/admin/clients/route.ts` - GET endpoint (fallback logic)
- `/app/api/admin/clients/[id]/route.ts` - PUT endpoint
- Replace queries that reference `payment_verified` with `payment_verified_1`
- Update response objects to return new field names

---

### 3. Test Suite Creation

**File:** Create `/tests/payment-flows.test.ts`

**Test Cases:** (Jest/Vitest format)

```typescript
describe('Payment Field Migration Tests', () => {
  
  // Test 1: One-time client payment flow
  describe('One-time Client Payment', () => {
    test('Assessment payment (Tier 1) verification creates payment_history record', async () => {
      // Setup: Create new one-time client in 'intake' status
      // Action: Verify payment_1 (2000 EGP)
      // Assert: 
      //   - payment_verified_1 = true
      //   - payment_amount_1 = 2000
      //   - payment_date_1 = today
      //   - total_amount_paid = 2000
      //   - status = 'assessment_pending'
      //   - payment_history record created
    });

    test('Additional payment (Tier 2) required when therapist rate > 2000', async () => {
      // Setup: One-time client with therapist_rate = 3500
      // Action: 
      //   - Verify payment_1 (2000 EGP)
      //   - Assign therapist (rate 3500)
      //   - Verify payment_2 (1500 EGP - difference)
      // Assert:
      //   - payment_verified_2 = true
      //   - payment_amount_2 = 1500
      //   - total_amount_paid = 3500
      //   - status = 'ready_for_booking'
    });

    test('No additional payment when therapist rate = 2000', async () => {
      // Setup: Therapist with exactly 2000 EGP rate
      // Action: Verify payment_1 (2000 EGP)
      // Assert:
      //   - payment_verified_2 remains false
      //   - Can proceed directly to booking
      //   - total_amount_paid = 2000
    });
  });

  // Test 2: Recurring client payment flow
  describe('Recurring Client Payment', () => {
    test('First booking resets payment_1 fields', async () => {
      // Setup: Recurring client (status = 'recurring_client')
      // Action: Book first session
      // Assert:
      //   - payment_verified_1 = false (reset)
      //   - payment_amount_1 = null
      //   - payment_date_1 = null
      //   - status = 'booking_scheduled'
    });

    test('Session payment verification increments total_amount_paid', async () => {
      // Setup: Recurring client with booking scheduled
      // Initial state: total_amount_paid = 0
      // Action: Verify session payment (2000 EGP)
      // Assert:
      //   - session_payment_received = true
      //   - session_payment_amount = 2000
      //   - total_amount_paid = 2000 (incremented)
      //   - bookings.payment_status = 'paid'
      //   - payment_history record created
    });

    test('Multiple session payments accumulate correctly', async () => {
      // Setup: Recurring client with 2 bookings
      // Action: 
      //   - Verify payment for session 1 (2000 EGP)
      //   - Complete session 1
      //   - Book session 2
      //   - Verify payment for session 2 (2000 EGP)
      // Assert:
      //   - total_amount_paid = 4000 (accumulated, not reset)
      //   - 2 payment_history records created
    });
  });

  // Test 3: Status transitions
  describe('Status Transitions Based on Payment', () => {
    test('Assessment payment triggers intake → assessment_pending', async () => {
      // Verify status change happens correctly
    });

    test('Additional payment triggers assessment_pending → ready_for_booking', async () => {
      // Verify tier 2 payment status transition
    });

    test('Recurring client booking preserves booking_scheduled status', async () => {
      // Verify recurring clients don't auto-transition on payment
    });
  });

  // Test 4: Payment history audit trail
  describe('Payment History Records', () => {
    test('Every payment creates audit trail entry', async () => {
      // Verify payment_history table populated correctly
    });

    test('Payment history contains correct payment_type classification', async () => {
      // Check payment_type field: 'assessment' | 'remaining' | 'session'
    });
  });

  // Test 5: Data consistency checks
  describe('Data Consistency', () => {
    test('total_amount_paid matches sum of individual payments', async () => {
      // Verify calculation accuracy
    });

    test('No clients with null payment_date_1 when payment_verified_1 = true', async () => {
      // Prevent orphaned payment records
    });

    test('Deprecated fields not used in active code paths', async () => {
      // Grep for payment_verified (non-deprecated usage)
      // Should return 0 results after refactoring
    });
  });
});
```

---

### 4. Rollback Plan

**If issues arise during Phase 2:**

1. **Keep deprecated columns in database** - Don't drop columns immediately
2. **Maintain dual-write during testing period** - Write to both old and new fields
3. **Add fallback logic** - If new fields missing, read from deprecated fields
4. **Staged rollout:**
   - First deploy: Migration + dual writes (no code changes)
   - Monitor for 2-3 days
   - Second deploy: Remove reads of deprecated fields
   - Monitor for 2-3 days
   - Third deploy: Remove deprecated columns

---

## Phase 2 Timeline & Resource Allocation

### Day 1: Data Migration & Validation (1 day)
- Create migration script
- Test migration on staging database
- Verify data consistency
- **Deliverable:** Approved migration file, validation report

### Day 2-3: Code Refactoring (2 days)
- Update 11 files to use new field names
- Update API response formats
- Remove deprecated field references from logs/comments
- **Deliverable:** All files updated, ready for testing

### Day 4-5: Testing & QA (2 days)
- Run full test suite (automated)
- Manual testing of payment workflows
- Test edge cases (therapist rate = 2000, concurrent payments, etc.)
- Performance testing (no regression from schema changes)
- **Deliverable:** All tests passing, no regressions

### Day 6: Review & Deployment Prep (1 day)
- Code review
- Documentation updates
- Deployment checklist
- **Deliverable:** Ready for production deployment

**Estimated Total:** 4-6 business days

---

## Quality Gates (Go/No-Go Criteria)

**Must Pass Before Deployment:**
- ✅ All 7+ test cases pass (100%)
- ✅ No deprecated field references in active code
- ✅ Data migration validation: 100% record accuracy
- ✅ Build succeeds with no warnings
- ✅ No performance regression (query times < 5% increase)
- ✅ Code review approval (2+ reviewers)
- ✅ Staging deployment successful
- ✅ Smoke tests pass in staging

**Critical Checks:**
- Payment history accuracy (audit trail intact)
- Status transitions work correctly for all client types
- Recurring vs one-time client workflows both functional
- No financial data loss during migration

---

## Phase 2 Dependencies

**Must Complete Before Phase 2 Starts:**
- ✅ Phase 1 documentation review (complete)
- ✅ Booking error fix deployed & verified (in progress)
- ✅ Team approval obtained (waiting)
- ✅ Test data setup ready (complete)

---

## Post-Phase 2: Future Phases

### Phase 3 (Optional): Schema Cleanup
- Drop deprecated columns from database
- Consolidate payment records into normalized table
- Simplify schema (reduce column count from ~13 to ~7)
- Timeline: 2-3 weeks after Phase 2 (allow buffer for issues)

### Phase 4 (Long-term): Normalized Model
- Create new `payments` table with complete history
- Migrate all payment data to normalized structure
- Update API contracts
- Timeline: Future architectural review needed

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Data migration incomplete | Financial data loss | Backup before migration, dry-run on staging |
| Code changes introduce bugs | Payment flow broken | Comprehensive test suite, staged rollout |
| Performance degradation | API slowdown | Query performance testing during QA |
| Concurrent payment requests | Race conditions | Database constraints, transactional safety |
| Rollback needed in production | Service disruption | Keep deprecated fields, dual-write strategy |

---

## Sign-Off & Approval

**Requires approval from:**
- [ ] Backend Engineering Lead
- [ ] QA Lead  
- [ ] Product Manager
- [ ] Finance/Compliance (payment system changes)

**Phase 2 can proceed once:**
1. All prerequisites from Phase 1 confirmed complete
2. Team buy-in obtained (4+ person sign-off)
3. Testing infrastructure ready
4. Staging environment available for 4-6 days

---

## Next Actions

1. **Present Phase 2 plan to team** - Share this document
2. **Obtain written approval** - Confirm team commitment
3. **Schedule Phase 2 sprint** - Book resources
4. **Create Phase 2 branch** - `feature/payment-refactoring-phase2`
5. **Begin Day 1 work** - Data migration

**Status:** ⏳ Awaiting team approval to proceed

---

**Document Version:** 1.0  
**Created:** 2026-07-08  
**Last Updated:** 2026-07-08  
**Author:** Engineering Team
