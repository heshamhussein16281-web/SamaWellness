# Session Management System - Complete Guide

## Overview

Complete session management system for tracking client sessions with two outcomes:
1. **Completed** - Session conducted (payment finalized)
2. **No Show** - Client didn't attend (payment kept)

Both count as "delivered" for financial accounting purposes.

---

## Features

### 1. **View Session Button** (Active Clients)

When a client status is **"active"**, the button shows **"View Session"**.

**Click to:**
- Mark session as **Completed** (✓)
  - Add detailed notes
  - Set session outcome (positive/neutral/negative)
  - Record progress score (1-5 stars)
- Mark as **No Show** (✗)
  - Optional reason for absence
  - Payment automatically retained
  - Warning: Client needs to reschedule

### 2. **Session Tracker** (Completed/Inactive Clients)

Shows complete history of ALL sessions:

**Statistics Panel:**
- Total sessions (past + future)
- Completed sessions
- No-show sessions
- Scheduled sessions

**Each Session Shows:**
- Date & time
- Therapist name
- Room/location
- Duration
- Session status badge
- Financial status
- Notes/details
- Financial indicator

**Color Coding:**
- 🟢 Green = Completed (session delivered)
- 🔴 Red = No Show (client absent, payment kept)
- 🔵 Blue = Scheduled (future session)

---

## How It Works

### Marking a Session

**Step 1:** Client reaches "active" status after booking
**Step 2:** Next action button shows "View Session"
**Step 3:** Click "View Session" → Modal opens
**Step 4:** Choose:
- **Completed:** Add notes, outcome, progress score
- **No Show:** Reason (optional), confirm policy

**Step 5:** Submit → Session recorded
**Step 6:** Client status updates

### Financial Accounting

Both **Completed** and **No Show** count as "delivered":

```
Completed Session:
  - Session conducted
  - Payment finalized
  - Notes recorded
  - Progress tracked

No Show:
  - Client absent
  - Payment KEPT (not refunded)
  - Tracked as "no show"
  - Client must reschedule
```

**Important:** No-show is NOT a refund situation. The money is kept as per policy.

---

## Database Fields

### Bookings Table

```sql
booking_status = 'completed'    -- Session happened or no-show
status = 'completed' | 'no_show' -- Distinguishes between completed and no-show
payment_status = 'paid'         -- Payment finalized
notes = 'Session notes...'       -- Notes from therapist
```

### Session Notes Table

Stores detailed notes:
```sql
booking_id         -- Links to booking
therapist_id       -- Who conducted session
notes              -- Session summary
session_outcome    -- positive/neutral/negative
progress_score     -- 1-5 rating
```

---

## API Endpoints

### Mark Session Complete/No Show

```bash
POST /api/admin/bookings/[booking_id]/complete-session
Content-Type: application/json

{
  "session_status": "completed" | "no_show",
  "notes": "Session notes here",
  "session_outcome": "positive|neutral|negative",
  "progress_score": 1-5
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "booking_status": "completed",
    "status": "completed|no_show",
    "updated_at": "2026-06-24T..."
  }
}
```

### Get All Sessions (Tracker)

```bash
GET /api/admin/clients/[client_id]/bookings
```

Returns all sessions with:
- Status (scheduled/completed/cancelled)
- Payment status
- Therapist info
- Room details
- Notes

---

## UI Components

### CompleteSessionModal.tsx
Opens when clicking "View Session" on active clients.

**Features:**
- Two-button selection (Completed / No Show)
- Conditional form fields
- Financial status indicator
- Progress score slider with stars

### SessionTracker.tsx
Shows complete session history.

**Features:**
- Statistics cards
- Session list with status badges
- Financial indicators
- Color-coded display
- Scrollable list (60vh height)

---

## Testing with Test Data

### Generate Test Client

```bash
npx tsx lib/test-data-generator.ts
```

Creates:
- 1 recurring client
- 5 completed past sessions
- 4 future scheduled sessions

### Mark a Session Complete

1. Go to Clients page
2. Find "Test Recurring Client"
3. View client details (should show "active" status)
4. Click "View Session" button
5. Choose:
   - ✓ Completed (add notes)
   - ✗ No Show (optional reason)
6. Submit

### View Session Tracker

1. For completed/inactive clients
2. Next action shows "View History"
3. Click to open Session Tracker
4. See all sessions with status

---

## Financial Implications

### Completed Session
- ✓ Session conducted
- ✓ Payment finalized
- ✓ Notes recorded for clinical records
- ✓ Counts toward completion percentage

### No Show
- ✗ Client didn't attend
- ✓ Payment **KEPT** (not refunded)
- ✓ Tracked as "no show" for client record
- ✓ Counts as "delivered" financially
- ✓ Client must reschedule

### Important Notes

1. **No Show is NOT a Refund:**
   - Payment is kept as per clinic policy
   - Client forfeits session
   - Can reschedule next session

2. **Payment Status:**
   - Both completed and no-show = payment_status: 'paid'
   - Financial side: DELIVERED (payment collected)

3. **Tracking:**
   - Session Tracker shows all sessions with status
   - No-shows are distinguishable (red badge, "no_show" status)
   - Financial indicator shows payment kept

---

## Workflow Example

**Scenario:** Recurring client with Sama Eissa

1. **Payment Verified** ✓
   - Tier 1: 2000 EGP (initial)
   - Tier 2: 1000 EGP (difference from 3000 rate)

2. **Booking Created** 
   - Session scheduled for next Tuesday 10 AM
   - Room: Serenity
   - Payment status: Pending

3. **Session Occurs**
   - Client shows up
   - Click "View Session"
   - Select "Completed"
   - Add notes: "Discussed anxiety management, good progress"
   - Set outcome: Positive
   - Progress: 4/5 stars
   - Submit

4. **Payment Finalized**
   - Status: Completed
   - Payment kept (3000 EGP total)
   - Notes recorded
   - Progress tracked

5. **Next Booking**
   - Client can book another session
   - Same process repeats

---

## No-Show Example

**Scenario:** Same client, different session

1. **Session Scheduled**
   - Friday 10 AM with Sama
   - Payment status: Pending
   - Payment still due: 3000 EGP (if paid already counted toward next session or just kept)

2. **Client Doesn't Show**
   - Click "View Session"
   - Select "No Show"
   - Optional: Reason: "Client called sick"
   - Submit

3. **Financial Status**
   - Payment KEPT
   - Status: No Show (tracked)
   - No refund issued
   - Next session can be rescheduled

4. **Tracking**
   - Session Tracker shows "No Show" (red badge)
   - Financial indicator: "No-Show: Payment retained as per policy"
   - Visible in client history

---

## Key Takeaways

✅ **Completed & No Show both count as "delivered"**
✅ **No-show doesn't trigger refund**
✅ **All sessions tracked in history**
✅ **Financial status clear at all times**
✅ **Easy to mark sessions with one click**

---

## Files Created/Modified

- ✅ `CompleteSessionModal.tsx` - Mark session complete/no-show
- ✅ `SessionTracker.tsx` - View all sessions with status
- ✅ `ClientActionButton.tsx` - Integrated modals
- ✅ `/api/admin/bookings/[id]/complete-session` - API endpoint
- ✅ `SESSION_MANAGEMENT_GUIDE.md` - This file

---

## Next Steps

1. Test with development server: `npm run dev`
2. Create test client: `npx tsx lib/test-data-generator.ts`
3. View clients page: `/dashboard/clinical/clients`
4. Click "View Session" on active client
5. Mark a session complete or no-show
6. View Session Tracker for history

Ready to go! 🚀
