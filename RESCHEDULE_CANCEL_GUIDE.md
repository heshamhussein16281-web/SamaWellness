# Reschedule/Cancel Feature - Complete Guide

## When It Appears

When a client has status **"booking_scheduled"**, the action button shows:
```
"Reschedule or Cancel"
```

This means:
- ✅ Payment already verified
- ✅ Session already booked
- ✅ Client can now manage the booking

---

## How It Works

### Step 1: Click "Reschedule or Cancel"
Opens modal with two options:

```
┌─────────────────────┐  ┌──────────────────┐
│     📅 Reschedule   │  │   ✕ Cancel       │
│  Move to different  │  │  Remove this     │
│  date/time          │  │  session         │
│  Payment applies    │  │  Choose payment  │
│  to new session     │  │  handling        │
└─────────────────────┘  └──────────────────┘
```

---

## Option 1: RESCHEDULE

### When to Use
- Client wants to move the session to a different date/time
- Keep the same therapist
- Payment already made applies to new session

### Process

**Step 1:** Click "Reschedule"
- Opens date/time picker
- Must be tomorrow or later (no same-day bookings)

**Step 2:** Select New Date
```
[Date Picker] ← Tomorrow or later
[Time Picker] ← Default 10:00 AM
```

**Step 3:** Review Financial Status
```
💰 Original payment (3000 EGP) will apply to the new session.
   No additional payment required.
```

**Step 4:** Confirm
- Original booking cancelled (reason: "Rescheduled to new date")
- New booking created
- Original payment applies
- Client status remains: booking_scheduled
- Session tracker updated

### Financial Implications

| Aspect | Details |
|--------|---------|
| Original Payment | 3000 EGP |
| New Booking Payment | 0 EGP (payment applies) |
| Total Client Owes | 0 EGP |
| Payment Status | Paid (applies to new session) |

---

## Option 2: CANCEL

### When to Use
- Client no longer wants the session
- Need to decide payment handling
- Can rebook later if desired

### Process

**Step 1:** Click "Cancel"
- Opens cancellation form

**Step 2:** Provide Reason (Required)
```
Why is this session being cancelled?

[Text Area]
- "Personal emergency"
- "Need to reschedule to a different therapist"
- "Schedule conflict"
- etc.
```

**Step 3:** Choose Payment Handling

#### Option A: Keep Payment ✓
```
Keep Payment
├─ Amount: 3000 EGP retained
├─ Client status: ready_for_booking
├─ Next step: Client books another session
└─ Financial: Payment already collected
```

**Best for:**
- Sessions within 24 hours
- Last-minute cancellations
- No-show policies
- Standard clinic cancellation policy

#### Option B: Issue Refund
```
Issue Refund
├─ Amount: 3000 EGP refunded
├─ Client status: ready_for_booking (needs payment again)
├─ Next step: Client pays + books new session
└─ Financial: Refund processed to payment method
```

**Best for:**
- Clinic initiating cancellation
- Medical conflicts
- Exceptional circumstances
- Client satisfaction priority

**Step 4:** Confirm Cancellation
- Original booking deleted
- Payment handled per selection
- Client status: ready_for_booking
- Client can rebook anytime

---

## Workflow Examples

### Example 1: Reschedule

**Current State:**
- Client: Ahmed Mohamed
- Status: booking_scheduled
- Session: Tuesday 10 AM with Sama Eissa
- Payment: 3000 EGP (paid)

**Action:** Click "Reschedule or Cancel" → "Reschedule"

**New Date:** Thursday 2 PM

**Result:**
- Original session: CANCELLED (reason: "Rescheduled to new date")
- New session: Thursday 2 PM with Sama Eissa
- Payment: 3000 EGP applies to new session
- Status: booking_scheduled
- Client: No additional payment needed

**Financial Summary:**
```
Original: Tuesday 10 AM - 3000 EGP (cancelled)
New:      Thursday 2 PM - 0 EGP (payment applies from original)
Total:    3000 EGP (one payment covers both)
```

---

### Example 2: Cancel - Keep Payment

**Current State:**
- Client: Fatima Hassan
- Status: booking_scheduled
- Session: Monday 10 AM with Sara El Shakankiri
- Payment: 2000 EGP (paid)

**Action:** Click "Reschedule or Cancel" → "Cancel"

**Reason:** "Need to postpone, personal issues"

**Payment:** Keep Payment

**Result:**
- Session: CANCELLED
- Payment: 2000 EGP KEPT
- Status: ready_for_booking
- Next step: Client can book another session without paying again
- Session Tracker: Shows "Cancelled" in history

**Financial Summary:**
```
Original Payment: 2000 EGP (kept)
Refund: 0 EGP
Client Owes: 0 EGP for next booking
```

---

### Example 3: Cancel - Issue Refund

**Current State:**
- Client: Mohammed Torkey
- Status: booking_scheduled
- Session: Tomorrow 11 AM with Alia El Meteni
- Payment: 3000 EGP (paid)

**Action:** Click "Reschedule or Cancel" → "Cancel"

**Reason:** "Clinic needs to cancel due to therapist emergency"

**Payment:** Issue Refund

**Result:**
- Session: CANCELLED
- Payment: 3000 EGP REFUNDED (process takes 3-5 business days)
- Status: ready_for_booking
- Next step: Client must pay again to book new session
- Session Tracker: Shows "Cancelled" in history
- Refund Record: Logged for accounting

**Financial Summary:**
```
Original Payment: 3000 EGP (refunded)
Client Account: +3000 EGP credit or refund
Client Owes: 3000 EGP to book next session
```

---

## Status Changes

### During Reschedule
```
Before: booking_scheduled
        ↓ Click Reschedule
        ├─ Cancel old booking (confirmed → cancelled)
        └─ Create new booking (payment applies)
After: booking_scheduled
```

### During Cancel
```
Before: booking_scheduled
        ↓ Click Cancel
        ├─ Delete booking
        ├─ Handle payment (keep or refund)
        └─ Update status
After: ready_for_booking (if keep payment)
       OR
       ready_for_booking (if refund - will need payment)
```

---

## Payment Ledger

### Reschedule Example
```
Date        Type              Amount   Status      Notes
────────────────────────────────────────────────────────
Jun 15      Original Payment  +3000    PAID        Tuesday session
Jun 15      Cancellation      0        CANCELLED   Rescheduled
Jun 18      Applied to New    -3000    APPLIED     Thursday session
```

### Cancel - Keep Payment
```
Date        Type              Amount   Status      Notes
────────────────────────────────────────────────────────
Jun 15      Payment           +3000    PAID        Monday session
Jun 15      Cancellation      0        CANCELLED   Client requested
Jun 15      Payment Kept      +3000    RETAINED    Clinic policy
```

### Cancel - Refund
```
Date        Type              Amount   Status      Notes
────────────────────────────────────────────────────────
Jun 15      Payment           +3000    PAID        Tomorrow session
Jun 15      Cancellation      0        CANCELLED   Clinic initiated
Jun 15      Refund Issued     -3000    PENDING     3-5 days to process
Jun 18      Refund Complete   -3000    COMPLETED   Back to payment method
```

---

## Client Actions After Reschedule/Cancel

### After Reschedule
**Client Status:** booking_scheduled
**Next Action:** None (already booked for new date)
**If they want another change:**
- Click "Reschedule or Cancel" again
- Reschedule to different date or cancel

### After Cancel - Keep Payment
**Client Status:** ready_for_booking
**Next Action:** "Book Session"
**What happens:**
- Client books new session
- Payment (3000 EGP) applies automatically
- No additional payment needed

### After Cancel - Refund
**Client Status:** ready_for_booking
**Next Action:** "Book Session"
**What happens:**
- Client clicks "Book Session"
- Sees "Verify Payment" action
- Must pay again (3000 EGP)
- Then books session

---

## Important Notes

### 1. Payment Handling
- **Reschedule:** Original payment transfers to new booking
- **Cancel + Keep:** Payment retained in clinic account
- **Cancel + Refund:** Payment returned to client's payment method

### 2. Status Changes
- After any action, client returns to "ready_for_booking"
- Allows rebooking if needed
- Session history tracks cancellations

### 3. Session Tracker
All sessions (including cancelled ones) appear in Session Tracker:
- Original session shows as "Cancelled"
- New session shows as "Scheduled"
- Financial status clear for each

### 4. Same-Day Bookings
- Cannot reschedule to today
- Must be tomorrow or later
- Enforced by date picker

### 5. Therapist Consistency
- Reschedule keeps same therapist
- If client wants different therapist, must cancel and rebook

---

## API Endpoints Used

### Fetch Current Booking
```bash
GET /api/admin/clients/[client_id]/bookings?status=confirmed
```

### Cancel Booking (both reschedule and cancel)
```bash
DELETE /api/admin/bookings/[booking_id]
Body: {
  "reason": "Rescheduled to new date" OR "User cancellation reason",
  "refund_requested": true | false
}
```

### Create New Booking (reschedule only)
```bash
POST /api/admin/bookings
Body: {
  "client_id": 42,
  "therapist_id": 87,
  "session_date": "2026-06-26T14:00:00Z",
  "duration_minutes": 60,
  "session_type": "single",
  "clinic_id": 12,
  "notes": "Rescheduled from [original date]"
}
```

---

## User Interface Flow

```
Client List Page
    ↓
Select Client (status: booking_scheduled)
    ↓
Button: "Reschedule or Cancel"
    ↓
Modal Opens
    ├─ Option A: Reschedule
    │  ├─ Pick new date
    │  ├─ Pick new time
    │  ├─ Confirm
    │  └─ Session moved ✓
    │
    └─ Option B: Cancel
       ├─ Reason required
       ├─ Choose: Keep Payment OR Refund
       ├─ Confirm
       └─ Session cancelled ✓
        
Client Status Updates
    ↓
ready_for_booking (if cancel) or booking_scheduled (if reschedule)
    ↓
Action updates (can reschedule again or book new session)
```

---

## Testing

### Test Reschedule
1. Create test booking (status: booking_scheduled)
2. Click "Reschedule or Cancel"
3. Select "Reschedule"
4. Pick new date (tomorrow or later)
5. Confirm
6. Verify: New session created, old one cancelled, payment transferred

### Test Cancel - Keep
1. Create test booking (status: booking_scheduled)
2. Click "Reschedule or Cancel"
3. Select "Cancel"
4. Provide reason
5. Select "Keep Payment"
6. Confirm
7. Verify: Payment retained, status updated, can rebook without new payment

### Test Cancel - Refund
1. Create test booking (status: booking_scheduled)
2. Click "Reschedule or Cancel"
3. Select "Cancel"
4. Provide reason
5. Select "Issue Refund"
6. Confirm
7. Verify: Payment refunded, status updated, needs new payment to rebook

---

## Summary

| Feature | Reschedule | Cancel + Keep | Cancel + Refund |
|---------|-----------|---------------|-----------------|
| **New Session Date** | Yes | No | No |
| **Payment Handled** | Transfer | Retain | Refund |
| **Final Status** | booking_scheduled | ready_for_booking | ready_for_booking |
| **Next Action** | None | Book Session | Verify Payment + Book |
| **Use Case** | Schedule change | Client request | Clinic cancel |

Ready to test! 🎯
