# Payment Verification for New Clients - Testing Guide

## Overview

This document outlines how to test the payment verification workflow for new clients. The workflow ensures that new clients must have payment confirmed (via Instapay) before a booking can be finalized.

---

## Database Changes Required

First, apply the migration to your Supabase database:

```bash
# Apply the migration
supabase migration up
```

Or manually run the SQL in `/supabase/migrations/add_payment_verification_fields.sql`:
- Adds `is_new_client` flag to `clients` table
- Adds hold tracking fields to `bookings` table
- Creates `pending_expiry` table for tracking holds awaiting confirmation

---

## API Endpoints Created

### 1. POST `/api/clinic/bookings` (Updated)

**For New Clients:**
```bash
curl -X POST http://localhost:3000/api/clinic/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_JWT_TOKEN" \
  -d '{
    "client_id": "uuid-of-new-client",
    "therapist_id": "uuid-of-therapist",
    "session_date": "2026-06-20",
    "duration_minutes": 60,
    "force_hold": true
  }'
```

**Response (Success):**
```json
{
  "data": {
    "id": "booking-uuid",
    "client_id": "client-uuid",
    "status": "H",
    "hold_created_at": "2026-06-10T14:30:00Z",
    "hold_expires_at": "2026-06-11T14:30:00Z"
  },
  "booking_status": "H"
}
```

**Response (No force_hold - Blocked):**
```json
{
  "error": "Payment verification required before booking. New client bookings must be held and confirmed."
}
```

---

### 2. GET `/api/clinic/bookings/check-expiry`

Get all bookings awaiting expiry confirmation.

```bash
curl -X GET http://localhost:3000/api/clinic/bookings/check-expiry \
  -H "Cookie: auth_token=YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "data": [
    {
      "pending_expiry_id": "expiry-uuid",
      "booking_id": "booking-uuid",
      "client_name": "Amira Hassan",
      "therapist_name": "Sama Eissa",
      "session_date": "2026-06-20",
      "hold_created_at": "2026-06-10T14:30:00Z",
      "hours_held": 2.5,
      "time_until_expiry_hours": 21.5,
      "needs_confirmation": false,
      "notification_sent": false,
      "status": "H"
    }
  ],
  "count": 1,
  "urgent_count": 0
}
```

---

### 3. POST `/api/clinic/bookings/check-expiry` (Mark as Notified)

Mark expiries as notified when modal is shown to reception.

```bash
curl -X POST http://localhost:3000/api/clinic/bookings/check-expiry \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_JWT_TOKEN" \
  -d '{
    "pending_expiry_ids": ["expiry-uuid-1", "expiry-uuid-2"]
  }'
```

---

### 4. POST `/api/clinic/bookings/confirm-expiry`

Receptionist confirms either payment or cancellation.

**Confirm Payment:**
```bash
curl -X POST http://localhost:3000/api/clinic/bookings/confirm-expiry \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_JWT_TOKEN" \
  -d '{
    "booking_id": "booking-uuid",
    "action": "payment_confirmed",
    "confirmed_by": "Fatima"
  }'
```

**Response:**
```json
{
  "success": true,
  "action": "payment_confirmed",
  "booking_id": "booking-uuid",
  "new_status": "BP",
  "message": "Booking confirmed as paid"
}
```

**Confirm Cancellation:**
```bash
curl -X POST http://localhost:3000/api/clinic/bookings/confirm-expiry \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_JWT_TOKEN" \
  -d '{
    "booking_id": "booking-uuid",
    "action": "cancel",
    "confirmed_by": "Fatima"
  }'
```

---

## Test Scenarios

### Scenario 1: New Client Books, Payment Confirmed Within 24h

**Steps:**
1. Register new client in clinic app (is_new_client = true)
2. Receptionist creates booking for client
   ```
   POST /api/clinic/bookings with force_hold=true
   ```
3. Booking status = "H" (Hold), expires in 24 hours
4. Client pays via Instapay
5. Receptionist receives payment notification
6. Receptionist clicks "PAYMENT CONFIRMED" in modal
   ```
   POST /api/clinic/bookings/confirm-expiry action=payment_confirmed
   ```
7. Booking status converts to "BP" (Paid)
8. Client's is_new_client flag becomes false (recurring client)

**Expected Result:** ✅ Booking confirmed, client marked as recurring

---

### Scenario 2: New Client Books, No Payment Within 24h

**Steps:**
1. Register new client (is_new_client = true)
2. Receptionist creates booking with force_hold=true
3. Booking status = "H", hold_expires_at = T+24h
4. 24 hours pass, no payment received
5. Receptionist sees modal: "BOOKING HOLD EXPIRING"
6. Receptionist clicks "CONFIRM CANCELLATION"
   ```
   POST /api/clinic/bookings/confirm-expiry action=cancel
   ```
7. Booking status = "cancelled"
8. Slot becomes available for other clients

**Expected Result:** ✅ Booking cancelled, slot released

---

### Scenario 3: Receptionist Forgets to Click Confirm

**Steps:**
1. Create hold booking for new client
2. Payment received at T+10h
3. No action taken by receptionist
4. At T+24h, check pending expiry
   ```
   GET /api/clinic/bookings/check-expiry
   ```
5. Response shows: `needs_confirmation: true, urgent_count: 1`
6. Dashboard alert appears: "URGENT: 1 booking pending expiry confirmation"
7. Receptionist clicks modal, confirms payment or cancellation

**Expected Result:** ✅ Dashboard ensures no bookings fall through the cracks

---

### Scenario 4: Recurring Client Books Without Payment

**Steps:**
1. Client who completed first booking (is_new_client = false)
2. Receptionist creates booking
   - No force_hold needed
   - Booking status = "B" (Unpaid, standard rule)
3. 24-hour deadline applies (existing rule)
4. Client pays within 24h
5. Booking converts to "BP"

**Expected Result:** ✅ Recurring clients follow standard 24h payment rule

---

## Manual Testing Checklist

### Pre-Flight Checks
- [ ] Migration applied to Supabase
- [ ] New columns visible in Supabase dashboard
- [ ] `pending_expiry` table created

### API Testing
- [ ] GET `/api/clinic/bookings/check-expiry` returns empty array initially
- [ ] POST `/api/clinic/bookings` with new client + force_hold creates "H" status
- [ ] Booking has `hold_created_at` and `hold_expires_at` timestamps
- [ ] Client has `is_new_client = true`
- [ ] POST `/api/clinic/bookings/confirm-expiry` with payment_confirmed converts H→BP
- [ ] Client's `is_new_client` becomes false after confirmation
- [ ] POST `/api/clinic/bookings/confirm-expiry` with cancel converts H→cancelled
- [ ] `pending_expiry` table record updated with resolved status

### UI Testing (In HTML Clinic App)
- [ ] Notification appears in reception dashboard when hold approaching expiry
- [ ] Modal appears at 24h with client details
- [ ] "PAYMENT CONFIRMED" button converts booking to BP
- [ ] "CONFIRM CANCELLATION" button cancels booking
- [ ] Modal closes after action
- [ ] Dashboard refreshes to show updated status

### Edge Cases
- [ ] Create hold, wait >24h, check modal still shows (not auto-cancelled yet)
- [ ] Multiple concurrent holds nearing expiry - all show in modal
- [ ] Payment comes in at T+23h 59m, confirm payment just in time
- [ ] Recurring client (is_new_client=false) can book without hold

---

## Troubleshooting

**Problem:** POST `/api/clinic/bookings` returns 403 even with force_hold=true

**Solution:** Verify client exists and is_new_client flag is set to true in Supabase:
```sql
SELECT id, name, is_new_client FROM clients WHERE id = 'client-uuid';
```

**Problem:** Modal doesn't appear at 24h expiry

**Solution:** 
1. Check `pending_expiry` table has records
2. Ensure GET `/api/clinic/bookings/check-expiry` returns data with `needs_confirmation: true`
3. Verify clinic app is calling the check-expiry endpoint on load

**Problem:** Booking status not updating after confirm-expiry

**Solution:**
1. Check JWT token is valid and not expired
2. Verify booking_id exists and status is "H"
3. Check supabase-service.ts has correct credentials

---

## Data Cleanup (For Testing)

Reset all hold bookings to test again:

```sql
-- Soft reset: mark as cancelled
UPDATE bookings SET status = 'cancelled' WHERE status = 'H';

-- Delete pending expiries
DELETE FROM pending_expiry;

-- Reset client flags
UPDATE clients SET is_new_client = true WHERE is_new_client = false;
```

---

## Timeline

- **T+0h:** Booking created with "H" status
- **T+23h:** Warning notification should appear (dashboard alert)
- **T+24h:** Modal appears, mandatory confirmation required
- **T+24h+:** If no action, admin can manually resolve

---

## Success Criteria

✅ All test scenarios pass
✅ No bookings auto-cancelled without receptionist confirmation
✅ Payment confirms convert holds to paid within seconds
✅ Cancelled bookings properly release slots
✅ Recurring clients unaffected (follow standard 24h rule)
✅ Audit trail shows who confirmed and when
