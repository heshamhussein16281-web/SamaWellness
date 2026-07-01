# Scenario 1: Recurring Client Books Second+ Session

## Test Objective
Verify that a recurring client can book a session immediately and has 24 hours to complete payment.

---

## Key Business Logic Being Tested

**Recurring Client Payment Flow:**
- ✅ Can BOOK NOW (immediately, without paying first)
- ✅ Must PAY WITHIN 24 HOURS (payment deadline modal)
- ✅ Different from new clients (who must pay first)

---

## Test Prerequisites

- Dev server running on `http://localhost:3003`
- One recurring client in `recurring_client` status
- Client has completed at least one previous session
- Client has NO active/pending bookings
- Therapist: Sara (hourly_rate: 2000 EGP)

---

## Step-by-Step Testing

### Step 1: Navigate to Clients Dashboard
```
URL: http://localhost:3003/dashboard/clinical/clients
Expected: See list of clients with action buttons
```

### Step 2: Locate Recurring Client
```
Find: Client with status "recurring_client"
Verify: Client has no active bookings
```

### Step 3: Click "Book Session"
```
Action: Click "Book Session" button
Expected: BookingCalendarModal opens
Expected: Calendar shows week view with dates
```

### Step 4: Verify Calendar State
```
Check:
✅ Past dates are DISABLED (grayed out, can't click)
✅ Today's date is DISABLED
✅ Future dates (3+ days out) are ENABLED (clickable)
✅ Week layout shows Monday-Sunday
```

### Step 5: Select Future Date
```
Action: Click a date 3+ days in the future
Expected: Date highlights/becomes selected
```

### Step 6: Select Time Slot
```
Action: Click available time slot (e.g., 10:00 AM or 2:00 PM)
Expected: Time slot highlights/becomes selected
```

### Step 7: Click "Book Session" in Modal
```
Action: Click "Book Session" button
Expected: Modal closes
Expected: PaymentDeadlineModal appears immediately
```

### Step 8: Verify Payment Modal ⚠️ CRITICAL
```
Check PaymentDeadlineModal shows:
✅ Client name
✅ Session date/time
✅ Amount: 2000 EGP (NOT 3000 - critical bug fix)
✅ Deadline: 24 hours from now
✅ "Pay" and "Cancel" buttons
```

### Step 9: Click "Pay"
```
Action: Click "Pay" button
Expected: Modal closes
Expected: Client row updates immediately
Expected: Status changes to "booking_scheduled"
Expected: Buttons change from "Book Session" to "Reschedule" and "Cancel"
```

### Step 10: Verify Session Created
```
Action: Click on client name to view details
Expected: New booked session appears in session history
Expected: Session shows:
  ✅ Correct date/time
  ✅ Therapist name (Sara)
  ✅ Duration (60 minutes)
  ✅ Status (booked/scheduled)
```

---

## Pass/Fail Criteria

### ✅ PASS If:
- Payment modal appeared with **2000 EGP** (not 3000)
- Client status changed to `booking_scheduled` after payment
- "Reschedule" and "Cancel" buttons appeared
- Session visible in client details with correct information
- 24-hour deadline clearly shown in payment modal

### ❌ FAIL If:
- Payment amount is **3000 EGP** (wrong calculation)
- Status didn't change after payment
- Session not created or not visible
- Payment modal didn't appear
- Past/today dates are still clickable in calendar

---

## Critical Bug Being Verified

**Bug:** Refund amount calculated as 3000 EGP instead of 2000 EGP
**Formula:** (hourlyRate / 60 minutes) × duration_minutes
**Expected:** (2000 / 60) × 60 = 2000 EGP
**Wrong:** (some incorrect calculation) = 3000 EGP

This test verifies the **payment amount** shown in the modal uses the correct formula.

---

## Database State Required

For this test to work, you need:
1. **One recurring client** with status `recurring_client`
2. Client must have completed at least one session (not first-time)
3. Client must NOT have any active bookings
4. Client must have therapist assigned

If no suitable client exists, one will need to be created.
