# Payment Schema Refactoring Plan

**Status:** Phase 1 Complete ✅  
**Date:** 2026-07-08  
**Next Review:** 2026-08-08

---

## What Was Done (Phase 1 - Complete)

### ✅ Created Comprehensive Documentation
- **File:** `/docs/PAYMENT_FIELDS_DOCUMENTATION.md`
- **Content:**
  - Complete inventory of all 13 payment-related fields
  - Usage patterns for each field
  - Data flow diagrams (new clients vs recurring clients)
  - Common tasks and code examples
  - Test checklist before any changes

### ✅ Added Deprecation Comments
1. **Legacy Migration File:** `/supabase/migrations/add_payment_verification_to_clients.sql`
   - Marked `payment_verified` as DEPRECATED
   - Marked `payment_date` as DEPRECATED
   - Added references to documentation

2. **Active Payment Fields Migration:** `/supabase/migrations/20260623_add_payment_fields.sql`
   - Enhanced all comments with payment flow details
   - Clarified tier 1 vs tier 2 vs session payments
   - Added links to documentation

3. **PaymentVerificationModal.tsx**
   - Added comprehensive header documentation
   - Explained three payment types and what fields each updates
   - Added links to payment fields documentation

---

## Payment Fields Summary

### Active Fields (Safe to Use) ✅

**Payment 1 (Assessment):**
- `payment_verified_1` - Used in 10 files
- `payment_amount_1` - Used in 10 files
- `payment_date_1` - Used in 6 files

**Payment 2 (Additional/Therapist Fee):**
- `payment_verified_2` - Used in 7 files
- `payment_amount_2` - Used in 8 files
- `payment_date_2` - Used in 4 files

**Session Payment (Recurring):**
- `session_payment_received` - Used in 8 files
- `session_payment_date` - Used in 5 files
- `session_payment_amount` - Used in 5 files

**Summary:**
- `total_payment_due` - Used in 7 files
- `total_amount_paid` - Used in 14 files (most critical)

### Deprecated Fields (Do Not Use) ⚠️

- `payment_verified` - Replaced by `payment_verified_1`
- `payment_date` (on clients table) - Replaced by `payment_date_1`, `payment_date_2`, `session_payment_date`

---

## Risk Assessment

**Phase 1 Changes:** ✅ ZERO RISK
- Only added documentation
- Only added comments to migrations
- No code logic changed
- No database schema changed
- No data migration performed

**Safe to Deploy:** Yes, these changes improve clarity without affecting functionality

---

## Next Steps (Phase 2 - Planned)

### Prerequisites
- [ ] Code review of documentation
- [ ] Team approval to proceed with deprecation
- [ ] Create comprehensive test suite for payment flows

### Execution
1. Create data migration: Copy `payment_verified` → `payment_verified_1`
2. Remove `payment_verified` references from 11 active files
3. Rename `clients.payment_date` → `clients.legacy_payment_date`
4. Run test suite to verify no breaking changes
5. Update code comments to remove legacy field references

### Estimated Timeline
- Review: 2-3 days
- Execution: 1-2 days
- Testing: 1 day
- **Total:** ~4-6 days

---

## Files Modified in Phase 1

1. `/docs/PAYMENT_FIELDS_DOCUMENTATION.md` (NEW)
   - Comprehensive reference guide for all payment fields
   - Data flow diagrams
   - Code examples
   - Testing checklist

2. `/supabase/migrations/add_payment_verification_to_clients.sql`
   - Added deprecation notice
   - Added references to documentation
   - No schema changes

3. `/supabase/migrations/20260623_add_payment_fields.sql`
   - Enhanced comments with payment flow details
   - No schema changes

4. `/app/dashboard/clinical/clients/PaymentVerificationModal.tsx`
   - Added documentation header
   - Explained three payment types
   - No code logic changes

5. `/PAYMENT_REFACTORING_PLAN.md` (NEW)
   - This file - tracking progress through refactoring phases

---

## Key Insights from Audit

### Field Usage Patterns

1. **Two-Tier Payment System (payment_1 and payment_2)**
   - Used exclusively for new clients' initial payments
   - Reset to false/null when recurring clients book new sessions
   - Triggers status transitions in client lifecycle

2. **Session Payments (session_payment_*)
   - Only for recurring clients
   - Cumulative (never reset)
   - Updates `total_amount_paid` after each verification

3. **Total Amount Paid (most critical)**
   - Used in 14 files across UI and backend
   - Audit trail for financial compliance
   - Incremented for session payments, not reset

### Data Consistency Needs

- ⚠️ `total_amount_paid` data type inconsistent across migrations (DECIMAL vs BIGINT)
- ⚠️ Session payment fields defined in code, not migrations
- ✅ Payment history table exists for audit trail

---

## Testing Before Phase 2

Create tests for these scenarios:

- [ ] One-time client: Payment 1 verification
- [ ] One-time client: Payment 2 verification (if therapist rate > 2000)
- [ ] Recurring client: First booking with payment reset
- [ ] Recurring client: Multiple session payments
- [ ] Status transitions based on payment state
- [ ] Payment history records created correctly
- [ ] Total amount paid accumulates correctly

---

## Success Criteria

Phase 1 is successful when:
- ✅ Documentation is clear and comprehensive
- ✅ All deprecated fields are clearly marked
- ✅ Team understands payment field usage
- ✅ Zero breaking changes introduced
- ✅ All references link to documentation

Phase 2 will be approved when:
- [ ] Phase 1 review complete and approved
- [ ] Full test suite in place
- [ ] Team consensus on refactoring timeline

---

## Questions or Issues?

If you find issues with the documentation or need clarification:
1. Check `/docs/PAYMENT_FIELDS_DOCUMENTATION.md` first
2. Review migration file comments
3. Check PaymentVerificationModal.tsx header
4. Ask the engineering team

---

**Document Version:** 1.0  
**Created:** 2026-07-08  
**Last Updated:** 2026-07-08  
**Author:** Engineering Team
