# Phase 2 Execution Checklist

**Status:** IN PROGRESS  
**Date Started:** 2026-07-08  
**Expected Completion:** 2026-07-12 (4-6 business days)

---

## Step 1: Data Migration ✅ IN PROGRESS

### Migration File Created
- ✅ `/supabase/migrations/20260708_migrate_deprecated_payment_fields.sql`
  - Migrates `payment_verified` → `payment_verified_1`
  - Migrates `payment_date` → `payment_date_1`
  - Includes verification queries
  - Zero risk (no schema changes)

### Status: Ready for Deployment
- [ ] Run on staging database first
- [ ] Verify all checks pass
- [ ] Backup production database
- [ ] Run on production database
- [ ] Verify data consistency

---

## Step 2: Code Refactoring ⏳ IN PROGRESS

### Files to Update (11 Total)

#### Component Files (3)

**File 1: PaymentVerificationModal.tsx**
- [x] Already uses new fields (payment_verified_1, payment_amount_1, etc.)
- [x] No changes needed
- Status: ✅ VERIFIED COMPLIANT

**File 2: ClientProfile.tsx** (Display client payment status)
- [ ] Update queries to select `payment_verified_1` instead of `payment_verified`
- [ ] Update display logic to use new field names
- [ ] Remove any references to old field names

**File 3: page.tsx** (Clients list)
- [ ] Update queries to select payment fields
- [ ] Update display/filter logic
- [ ] Remove deprecated field references

#### API Routes (4)

**File 4: /api/admin/clients/route.ts** (GET endpoint)
- [ ] Update SELECT query: remove `payment_verified`, `payment_date`
- [ ] Update SELECT query: include `payment_verified_1`, `payment_date_1`
- [ ] Update response format (if needed)
- [ ] Add comments explaining field usage

**File 5: /api/admin/clients/[id]/route.ts** (PUT endpoint)
- [ ] Remove support for old field names (lines 118-120)
- [ ] Only accept new field names: `payment_verified_1`, `payment_date_1`, etc.
- [ ] Update logging to use new names
- [ ] Add deprecation notice in comments

**File 6: /api/admin/bookings/route.ts**
- [ ] Update when resetting payment_1 fields for recurring clients
- [ ] Update payment_history creation logic
- [ ] Ensure correct field names in all updates

**File 7: /api/admin/clients/[id]/payments/route.ts** (Payments endpoint)
- [ ] Update query to use new field names
- [ ] Update response format if needed

#### Supporting Files (4)

**File 8: Test utilities - create-fresh-recurring/route.ts**
- [ ] Update test data creation to use new field names
- [ ] Verify test client creation works

**File 9: Test utilities - migrate-columns/route.ts** (if exists)
- [ ] Verify migration is using new field names

**File 10: Migration files**
- [ ] Verify all active migrations reference correct field names
- [ ] Update any hardcoded field references

**File 11: Documentation/Comments**
- [ ] Update comments in all files
- [ ] Remove references to deprecated fields
- [ ] Add guidance for new developers

---

## Step 3: Testing ⏳ PENDING

### Automated Tests (Run these)
- [ ] Unit tests for payment verification
- [ ] Integration tests for payment flow
- [ ] API endpoint tests
- [ ] Database migration verification

### Test Scenarios
- [ ] Test 1: One-time client payment (Tier 1)
- [ ] Test 2: One-time client payment (Tier 2 if needed)
- [ ] Test 3: Recurring client booking + payment
- [ ] Test 4: Multiple session payments accumulate
- [ ] Test 5: Payment history created correctly
- [ ] Test 6: Status transitions work
- [ ] Test 7: Edge cases (therapist rate = 2000, etc.)

### Manual Testing
- [ ] Dev server starts without errors
- [ ] Can create test client
- [ ] Can book session
- [ ] Can verify payment
- [ ] Database shows correct state
- [ ] No console errors

### Regression Testing
- [ ] Existing clients still load
- [ ] Payment lists show correct data
- [ ] Client filtering/sorting works
- [ ] No performance regression

---

## Step 4: Deployment Verification ⏳ PENDING

### Pre-Production Checks
- [ ] Build succeeds: `npm run build`
- [ ] TypeScript errors: Zero
- [ ] Code review: 2+ approvals
- [ ] Staging deployment: Successful
- [ ] All tests: Passing
- [ ] No breaking changes: Confirmed

### Production Deployment
- [ ] Database migration run
- [ ] Code deployed with monitoring
- [ ] Smoke tests pass
- [ ] Payment system working
- [ ] No error spikes

### Post-Deployment
- [ ] Monitor for 24 hours
- [ ] Check payment metrics
- [ ] Verify no client impact
- [ ] Archive this checklist

---

## Files That Are Already COMPLIANT ✅

These files are already using new field names correctly:

1. **PaymentVerificationModal.tsx** - Uses payment_verified_1, payment_amount_1, session_payment_received
2. **bookings/route.ts** - Uses payment_verified_1 for reset logic
3. **Migration files** - Already reference new field names in comments

---

## Files Requiring Changes ⏳

Based on grep analysis:

**Use old field name `payment_verified`:**
- Line 119 in /api/admin/clients/[id]/route.ts (backwards compatibility, needs removal)

**Use old field name `payment_date`:**
- Line 120 in /api/admin/clients/[id]/route.ts (backwards compatibility, needs removal)

**Use new field names (already correct):**
- PaymentVerificationModal.tsx ✅
- /api/admin/bookings/route.ts ✅
- Migration files ✅

---

## Estimated Effort

| Task | Duration | Status |
|------|----------|--------|
| Migration file creation | ✅ Complete | Done |
| Code refactoring (11 files) | ⏳ 4-6 hours | In Progress |
| Testing (automated + manual) | ⏳ 4-6 hours | Pending |
| Deployment + verification | ⏳ 2-4 hours | Pending |
| **Total** | **12-20 hours** | **In Progress** |

---

## Quality Gates (All Must Pass)

- [ ] Build succeeds with zero errors
- [ ] TypeScript compilation: Clean
- [ ] All tests: Passing (100%)
- [ ] No deprecated fields in active code
- [ ] Data migration: 100% accuracy
- [ ] No performance regression (< 5%)
- [ ] Code review: 2+ approvals
- [ ] Staging deployment: Successful
- [ ] Smoke tests: All passing
- [ ] Rollback plan: Verified

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Data loss | Backup before migration |
| Code breaks | Comprehensive test suite |
| Performance drop | Performance testing |
| Customer impact | Monitoring + rollback ready |

---

## Rollback Procedure

If Phase 2 fails at any point:

1. **Immediate (< 1 hour):**
   - Revert code to previous version
   - Restore database from backup
   - System fully operational

2. **Investigation (< 4 hours):**
   - Analyze what failed
   - Fix root cause
   - Test thoroughly

3. **Re-deployment (< 6 hours):**
   - Deploy fixed version
   - Monitor closely
   - Verify success

---

## Sign-Off Requirements

Before proceeding to production:

- [ ] Backend Lead: Code review approved
- [ ] QA Lead: All tests passing
- [ ] Product Manager: Business impact OK
- [ ] Tech Lead: Deployment green light

---

**Document Created:** 2026-07-08  
**Last Updated:** 2026-07-08  
**Status:** IN PROGRESS

Next: Begin code refactoring (Step 2)
