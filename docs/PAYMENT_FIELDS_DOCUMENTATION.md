# Payment Fields Documentation

> **Last Updated:** 2026-07-08
> **Status:** Active with deprecation plan
> **Owner:** Engineering Team

## Overview

This document defines all payment-related fields in the `clients` and `bookings` tables, explains their usage, and provides guidance for developers.

---

## Field Inventory

### ✅ ACTIVE FIELDS (Safe to Use)

#### Payment 1 (First Payment / Assessment)
Used when clients book their first session. Minimum payment of 2000 EGP.

| Field | Type | Purpose | Status |
|-------|------|---------|--------|
| `payment_verified_1` | BOOLEAN | Whether first session payment has been verified | ✅ Active |
| `payment_amount_1` | DECIMAL(10,2) | Amount paid for first session (tier 1) | ✅ Active |
| `payment_date_1` | TIMESTAMPTZ | ISO 8601 date when first payment was made | ✅ Active |

**Usage:**
- Set when user verifies payment in `PaymentVerificationModal.tsx`
- Reset to `false` and `null` when recurring client books new session
- Creates payment_history record when verified

**Conditional Logic:**
```typescript
// Indicates first payment is complete
if (payment_verified_1 === true && payment_amount_1 !== null) {
  // Client can proceed to therapist selection or booking
}

// Reset for recurring clients
if (is_recurring && status === 'booking_scheduled') {
  payment_verified_1 = false;
  payment_amount_1 = null;
  payment_date_1 = null;
}
```

---

#### Payment 2 (Additional Payment / Therapist Fee Difference)
Used only if therapist's hourly rate exceeds 2000 EGP (tier 1 minimum).

| Field | Type | Purpose | Status |
|-------|------|---------|--------|
| `payment_verified_2` | BOOLEAN | Whether additional payment has been verified | ✅ Active |
| `payment_amount_2` | DECIMAL(10,2) | Amount = therapist_rate - 2000 | ✅ Active |
| `payment_date_2` | TIMESTAMPTZ | ISO 8601 date when additional payment was made | ✅ Active |

**Usage:**
- Only present if therapist rate > 2000 EGP
- Amount calculated as: `therapist_hourly_rate - 2000`
- Triggers status transition to `ready_for_booking` when verified
- Creates payment_history record when verified

**Conditional Logic:**
```typescript
// Only applicable if therapist rate exceeds tier 1
const needsAdditionalPayment = therapist_hourly_rate > 2000;
const payment_amount_2 = therapist_hourly_rate - 2000;

if (payment_verified_2 === true && payment_amount_2 !== null) {
  // Client can proceed to booking
  status = 'ready_for_booking';
}
```

---

#### Session Payment (Recurring Clients)
Used for recurring clients to track payment for each booked session.

| Field | Type | Purpose | Status |
|-------|------|---------|--------|
| `session_payment_received` | BOOLEAN | Whether session payment has been received | ✅ Active |
| `session_payment_date` | TEXT | ISO 8601 date when session payment was received | ✅ Active |
| `session_payment_amount` | BIGINT | Amount paid for the session (typically therapist hourly rate) | ✅ Active |

**Usage:**
- Only used for recurring clients with status = `booking_scheduled`
- Verified via `PaymentVerificationModal.tsx` with `paymentType === 'session'`
- Updates `total_amount_paid` cumulatively when session payment verified
- Not reset between sessions (historical record)

**Conditional Logic:**
```typescript
// Only for recurring clients who have booked a session
if (is_recurring && status === 'booking_scheduled' && booking_id) {
  const paymentType = 'session';
  
  if (session_payment_received === true) {
    // Increment total_amount_paid by session_payment_amount
    total_amount_paid += session_payment_amount;
  }
}
```

---

#### Summary Fields

| Field | Type | Purpose | Status |
|-------|------|---------|--------|
| `total_payment_due` | DECIMAL(10,2) | Total amount client owes (therapist hourly rate at booking time) | ✅ Active |
| `total_amount_paid` | DECIMAL(10,2) | Cumulative amount client has paid (used for audit trail) | ✅ Active |

**Usage:**
- `total_payment_due`: Set when therapist assigned = `therapist.hourly_rate`
- `total_amount_paid`: Initially set to `payment_amount_1 + payment_amount_2`; incremented for each session payment
- Used in client profile display and financial reporting
- Critical for compliance/audit trail

---

### ⚠️ LEGACY FIELDS (Deprecated - Do Not Use)

#### `payment_verified` (on clients table)
**Status:** DEPRECATED  
**Reason:** Replaced by two-tier payment system (`payment_verified_1` and `payment_verified_2`)  
**Defined in:** `/supabase/migrations/add_payment_verification_to_clients.sql`  
**Refactoring Plan:** Phase 2 (see end of document)

```sql
-- DEPRECATED: Use payment_verified_1 instead
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false;
```

**Migration Strategy:**
- Copy existing data: `payment_verified_1 = payment_verified`
- Remove from active code paths
- Drop column in Phase 2 refactoring

---

#### `payment_date` (on clients table)
**Status:** LEGACY - Naming Collision  
**Reason:** Conflicting with `bookings.payment_date` and `payment_records.payment_date`  
**Defined in:** `/supabase/migrations/add_payment_verification_to_clients.sql`  
**Refactoring Plan:** Phase 2 (rename to avoid confusion)

```sql
-- DEPRECATED: Use payment_date_1 for first payment or booking.payment_date for session payments
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_date DATE;
```

**Migration Strategy:**
- Rename to `clients.legacy_payment_date` for clarity
- All active code should use `payment_date_1`, `payment_date_2`, `session_payment_date`, or `bookings.payment_date`
- Drop column in Phase 2 refactoring

---

## Data Flow Diagrams

### New Client (One-Time Booking)

```
1. Client submits intake form
   ↓
2. Sama verifies payment (payment_1)
   → payment_verified_1 = true
   → payment_amount_1 = 2000 (minimum)
   → payment_date_1 = now()
   → total_amount_paid = 2000
   → status = 'assessment_pending'
   ↓
3. Sama assigns therapist
   → total_payment_due = therapist.hourly_rate
   → If rate > 2000:
     - Create payment_2 request
     - status = 'assessment_pending' (waiting for payment_2)
   ↓
4. Client verifies additional payment (if needed)
   → payment_verified_2 = true
   → payment_amount_2 = (therapist.rate - 2000)
   → payment_date_2 = now()
   → total_amount_paid += payment_amount_2
   → status = 'ready_for_booking'
   ↓
5. Client books first session
   → status = 'booking_scheduled'
   → bookings.payment_status = 'pending'
```

### Recurring Client (Per-Session)

```
1. Recurring client books session
   → status = 'booking_scheduled'
   → bookings.payment_status = 'pending'
   → Reset payment_1 fields: false / null / null
   ↓
2. 24 hours before session (cron job)
   → Send payment deadline notification
   ↓
3. Client verifies session payment
   → session_payment_received = true
   → session_payment_amount = therapist.hourly_rate
   → session_payment_date = now()
   → total_amount_paid += session_payment_amount
   → bookings.payment_status = 'paid'
   ↓
4. Session occurs
   → bookings.booking_status = 'completed'
   ↓
5. Next session: repeat from step 1
```

---

## Payment History Table

All verified payments are recorded in the `payment_history` table (audit trail):

```sql
INSERT INTO payment_history (
  client_id,
  payment_type,  -- 'assessment' | 'remaining' | 'session'
  amount,
  verified,
  verified_date
) VALUES (
  $1,
  'assessment',
  payment_amount_1,
  true,
  payment_date_1
);
```

---

## File References

### Files Using These Fields

**Component Files:**
- `/app/dashboard/clinical/clients/page.tsx` - Reads all payment fields
- `/app/dashboard/clinical/clients/PaymentVerificationModal.tsx` - WRITES all payment types
- `/app/dashboard/clinical/clients/ClientProfile.tsx` - Displays total_amount_paid

**API Routes:**
- `/app/api/admin/clients/[id]/route.ts` - Core PUT endpoint for all payment updates
- `/app/api/admin/clients/route.ts` - GET with fallback logic for missing columns
- `/app/api/admin/bookings/route.ts` - Resets payment_1 fields for recurring clients

**Database:**
- `/supabase/migrations/20260623_add_payment_fields.sql` - Main payment schema
- `/supabase/migrations/add_payment_verification_to_clients.sql` - Legacy fields
- `/supabase/migrations/20260611_phase4_clinical_scheduling.sql` - Booking payment fields

---

## Common Tasks

### ✅ Verify a Client's Payment

```typescript
// File: /app/api/admin/clients/[id]/route.ts
const updateResponse = await supabase
  .from('clients')
  .update({
    payment_verified_1: true,
    payment_amount_1: 2000,
    payment_date_1: new Date().toISOString(),
    total_amount_paid: 2000,
    status: 'assessment_pending'
  })
  .eq('id', clientId)
  .select();
```

### ✅ Get Client's Payment Status

```typescript
// File: /app/api/admin/clients/route.ts
const { data: clients } = await supabase
  .from('clients')
  .select(`
    id, name,
    payment_verified_1, payment_amount_1, payment_date_1,
    payment_verified_2, payment_amount_2, payment_date_2,
    total_payment_due, total_amount_paid
  `)
  .eq('id', clientId);
```

### ✅ Record Session Payment (Recurring Client)

```typescript
// File: /app/dashboard/clinical/clients/PaymentVerificationModal.tsx
if (paymentType === 'session') {
  await supabase
    .from('clients')
    .update({
      session_payment_received: true,
      session_payment_date: verificationDate.toISOString(),
      session_payment_amount: therapistRate,
      total_amount_paid: currentTotal + therapistRate
    })
    .eq('id', clientId);
}
```

---

## Refactoring Roadmap

### Phase 1 (Immediate - Documentation ✅)
- ✅ Create this documentation file
- ✅ Add comments to migration files
- ✅ Add comments to payment-handling code
- ✅ Mark deprecated fields

### Phase 2 (Next Sprint - Deprecation)
- [ ] Create data migration: Copy `payment_verified` → `payment_verified_1`
- [ ] Remove `payment_verified` from active code (11 files)
- [ ] Rename `clients.payment_date` → `clients.legacy_payment_date`
- [ ] Add unit tests for payment logic
- **Status:** Planned

### Phase 3 (Future - Schema Cleanup)
- [ ] Drop deprecated columns from database
- [ ] Consolidate all payment records in `payment_history` table
- [ ] Simplify clients table schema
- **Status:** TBD

### Phase 4 (Long Term - Normalized Model)
- [ ] Create new normalized `payments` table structure
- [ ] Migrate all payment data
- [ ] Update all code references
- **Status:** Architectural review needed

---

## Testing Checklist

Before making any changes to payment fields:

- [ ] Test one-time client payment flow (payment_1 + payment_2)
- [ ] Test recurring client first booking (reset payment_1 fields)
- [ ] Test recurring client session payment (session_payment_* fields)
- [ ] Test payment_history record creation
- [ ] Test status transitions based on payment state
- [ ] Test data migration (if doing Phase 2)

---

## Support & Questions

For questions about payment fields, contact:
- **Backend:** Engineering Team
- **Product:** Product Manager
- **Finance:** Finance Team (for reconciliation)

---

## Deprecation Notice

⚠️ **DO NOT USE:**
- `clients.payment_verified` - Use `payment_verified_1` instead
- `clients.payment_date` - Use `payment_date_1`, `payment_date_2`, or `session_payment_date` instead

---

**Document Version:** 1.0  
**Last Reviewed:** 2026-07-08  
**Next Review:** 2026-08-08
