# Client Journey Mapping - Intake to Active Status

**Date:** 2026-06-14  
**Purpose:** Visual & narrative guide to how clients move through the system starting from intake

---

## Overview: The Client Journey

Every client in Sama Wellness follows a deterministic path from creation to active therapy. The intake process is the **starting gun**—after that, a series of manual and automated status transitions move the client forward.

---

## Timeline: Day-by-Day Client Journey

### Day 1: Intake Submitted

**9:30 AM - Therapist clicks "New Client Intake"**
```
✓ Fill form with client info
✓ Submit (client-side validation passes)
✓ POST to /api/admin/clients/intake

API Response: 201 Created
{
  id: 42,
  name: "Sarah Johnson",
  status: "intake",
  client_since: "2026-06-14T09:30:00Z"
}

Database State:
├─ clients table: 1 row (id=42, status='intake', therapist_id=NULL)
├─ client_status_history: 1 row (NULL → 'intake')
└─ audit_logs: 1 entry (therapist_id created client 42)
```

**What the client can do:** Nothing yet. No portal access, no bookings visible.

**What the therapist sees:**
- Success card showing client ID and name
- Auto-redirect to clients list
- New client appears in table with status badge "Intake"

---

### Day 1-3: Assessment Preparation

**Therapist reviews client info**
```
Therapist opens client profile at:
/dashboard/clinical/clients/42

Sees:
├─ Name: Sarah Johnson
├─ Email: sarah@example.com
├─ Phone: +1-555-0123
├─ Date of Birth: 1990-05-15
├─ Status: "Intake" (badge)
├─ Therapist: "Not assigned" (link to assign)
├─ Sessions: 0
├─ Client Since: Jun 14, 2026
└─ Notes & History tab
   └─ First entry: NULL → intake (changed by therapist_id, reason: "Client intake form submitted")
```

**Therapist decides:** "Need to talk to client about their concerns before proceeding"

---

### Day 4: Assessment Scheduled

**Therapist manually changes status to 'assessment_pending'**
```
PUT /api/admin/clients/42/status
{
  newStatus: "assessment_pending",
  reason: "Initial assessment call scheduled for Thursday"
}

Database State:
├─ clients: status changed to 'assessment_pending'
├─ client_status_history: NEW entry added
│  ├─ old_status: 'intake'
│  ├─ new_status: 'assessment_pending'
│  ├─ changed_by_user_id: therapist_id
│  ├─ reason: "Initial assessment call scheduled for Thursday"
│  └─ created_at: 2026-06-18T14:00:00Z
└─ audit_logs: NEW entry (status change logged)

Client sees: (if they have portal access)
└─ Status changed to "Assessment Pending"
```

**What client can do:** Still nothing. Awaiting therapist's assessment.

---

### Day 5: Assessment Completed

**Therapist completes initial consultation**
```
Client talks to therapist about:
├─ Primary concern (from intake)
├─ Mental health history
├─ Treatment goals
└─ Therapist assessment: "Suitable for 8-week therapy program"

Therapist changes status to 'ready_for_booking'
PUT /api/admin/clients/42/status
{
  newStatus: "ready_for_booking",
  reason: "Assessment complete, client approved for therapy"
}

Database State:
├─ clients: status changed to 'ready_for_booking'
├─ client_status_history: NEW entry
│  ├─ old_status: 'assessment_pending'
│  ├─ new_status: 'ready_for_booking'
│  └─ changed_by_user_id: therapist_id
└─ audit_logs: NEW entry
```

**What changed in client experience:** Client is now available for booking.

---

### Day 6-7: Session Booking

**Therapist schedules first session**
```
Therapist goes to Bookings section:
/dashboard/clinical/bookings

Creates new booking:
├─ Client: Sarah Johnson (id=42)
├─ Date: Thursday, June 27, 2026
├─ Time: 2:00 PM (50 minutes)
├─ Therapist: self (or assign)
└─ Rate: 300 AED

POST /api/admin/bookings
{
  client_id: 42,
  therapist_id: 12,
  scheduled_date: "2026-06-27T14:00:00Z",
  session_duration: 50,
  rate: 300,
  status: "confirmed"
}

Database State:
├─ clients: status changed to 'booking_scheduled'
├─ bookings: NEW entry (id=1001, booking_status='confirmed')
├─ client_status_history: NEW entry
│  ├─ old_status: 'ready_for_booking'
│  ├─ new_status: 'booking_scheduled'
│  └─ reason: "Session scheduled for June 27"
└─ audit_logs: NEW entry
```

**What changed:**
- Client status badge now says "Booking Scheduled"
- Therapist assigned (if not already)
- Session visible in bookings table

---

### Day 8-26: Pre-Session

**Waiting period before first session**
```
Client state:
├─ Status: 'booking_scheduled'
├─ Therapist: Assigned (id=12)
├─ First session date: June 27, 2:00 PM
└─ Amount due: 300 AED

Client experience (if portal exists):
├─ Can see session scheduled
├─ Can see session details
└─ Receives reminder emails

Therapist experience:
├─ Session visible in calendar
├─ Can view client profile
└─ Can modify session if needed
```

**No automatic status change during this period.**

---

### Day 27: 24 Hours Before Session

**Status change to 'payment_pending'** (if payment required upfront)

Alternative path: If payment collected at session end, status remains 'booking_scheduled'

```
Assumption: Payment required before session

PUT /api/admin/clients/42/status
{
  newStatus: "payment_pending",
  reason: "Awaiting payment for first session"
}

Client must pay 300 AED to proceed.

Payment Options:
├─ Online via stripe/payment gateway
├─ Manual transfer
├─ At session (not typical)
└─ Invoice
```

---

### Day 27-Evening: Payment Received

**Client or therapist processes payment**
```
POST /api/admin/payments
{
  client_id: 42,
  booking_id: 1001,
  amount: 300,
  payment_method: "card",
  status: "paid"
}

Database State:
├─ payment_records: NEW entry
├─ clients: status changed to 'active'
├─ client_status_history: NEW entry
│  ├─ old_status: 'payment_pending'
│  ├─ new_status: 'active'
│  └─ reason: "Payment received"
└─ bookings: payment_status changed to 'paid'

Client sees: "Status: Active - Your session is confirmed"
```

---

### Day 28 (June 28): Session Occurs

**9:00 AM (1 hour before session)**
```
Reminder notifications sent (if configured)
├─ Email to client
├─ Email to therapist
└─ Calendar alerts
```

**2:00 PM: Session Starts**
```
Therapist & client meet (zoom, phone, in-person)
├─ Discuss primary concern
├─ Build rapport
├─ Establish treatment plan
├─ Estimate future sessions needed
└─ Schedule next appointment (if recurring)
```

**2:50 PM: Session Ends**
```
Therapist completes session in dashboard:

POST /api/admin/session-notes/1001
{
  booking_id: 1001,
  notes: "Initial session successful. Client discusses anxiety...",
  outcome: "productive",
  next_steps: "Continue weekly sessions"
}

Database State:
├─ session_notes: NEW entry
├─ bookings: booking_status changed to 'completed'
├─ clients: last_session_date updated to June 28, 2026
│              total_sessions_completed = 0 (NOT updated yet—cron job does this)
└─ Therapist sees: "Session completed successfully"
```

**Current client state BEFORE cron job:**
```
Status: 'active'
is_recurring: FALSE  ← STILL FALSE (not updated until cron)
total_sessions_completed: 0  ← STILL 0 (not updated until cron)
therapist_id: 12 (assigned)
last_session_date: 2026-06-28T14:00:00Z
```

---

### Day 29 (1 AM UTC): Cron Job Runs

**POST /api/cron/update-recurring-clients** executes at 1 AM UTC

```
Cron Job Logic:
├─ FOR each client in database:
├─   COUNT completed bookings
│   └─ SELECT COUNT(*) FROM bookings WHERE 
│        client_id = 42 AND booking_status = 'completed'
│      Result: 1 ✓
│
└─   IF totalCompletedSessions >= 1:
     ├─ isRecurring = TRUE
     ├─ UPDATE clients SET
     │  ├─ is_recurring = TRUE
     │  ├─ total_sessions_completed = 1
     │  ├─ total_amount_paid = 300.00
     │  └─ updated_at = NOW()
     └─ WHERE id = 42
```

**Result AFTER cron:**
```
clients table (id=42):
├─ status: 'active' (unchanged)
├─ is_recurring: TRUE ✓ (UPDATED)
├─ total_sessions_completed: 1 ✓ (UPDATED)
├─ total_amount_paid: 300.00 ✓ (UPDATED)
└─ updated_at: 2026-06-29T01:00:00Z
```

**Dashboard Impact:**
- Clients list now shows "🔄 Recurring" instead of "One-time"
- Client card highlights them as recurring client
- Therapist may adjust booking strategy (e.g., weekly recurring slots)

---

### Day 30+: Ongoing Therapy

**Therapist schedules next session**
```
POST /api/admin/bookings
{
  client_id: 42,
  therapist_id: 12,
  scheduled_date: "2026-07-05T14:00:00Z",  ← 1 week later
  session_duration: 50,
  rate: 300,
  status: "confirmed"
}

Client state:
├─ Status: 'active'
├─ is_recurring: TRUE
├─ Next session: July 5, 2:00 PM
├─ Therapist: Assigned
└─ Sessions completed: 1
```

**Client can:**
- View upcoming sessions
- Pay for sessions in advance
- Update contact info
- View session history (if portal exists)

**Therapist can:**
- View client progress
- Update session notes
- Adjust treatment plan
- Add clinical observations

---

## Key Transitions Visualized

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT STATUS LIFECYCLE                    │
└─────────────────────────────────────────────────────────────────┘

                    [1. INTAKE] ← Created via intake form
                         ↓
                    (Therapist reviews)
                         ↓
              [2. ASSESSMENT_PENDING] ← Manual status change
                         ↓
                  (Assessment completed)
                         ↓
              [3. READY_FOR_BOOKING] ← Manual status change
                         ↓
          (Therapist creates first booking)
                         ↓
              [4. BOOKING_SCHEDULED] ← Automatic (via booking)
                         ↓
           (Awaiting payment if required)
                         ↓
              [5. PAYMENT_PENDING] ← Manual or automatic
                         ↓
                  (Payment received)
                         ↓
                   [6. ACTIVE] ← Automatic
                         ↓
              (Session conducted & completed)
                         ↓
        [CRON JOB: 1 AM UTC] ← Check for completed sessions
                         ↓
                  is_recurring = TRUE
           (if totalCompletedSessions >= 1)
                         ↓
         [6. ACTIVE + RECURRING FLAG] ← Updated via cron
```

---

## Data Progression Table

| Timeline | Status | is_recurring | Sessions | Therapist | Next Action |
|----------|--------|--------------|----------|-----------|-------------|
| Day 1, 9:30 AM | intake | FALSE | 0 | NULL | Assign therapist |
| Day 4, 2 PM | assessment_pending | FALSE | 0 | NULL | Schedule assessment |
| Day 5, 10 AM | ready_for_booking | FALSE | 0 | NULL | Create first booking |
| Day 6, 3 PM | booking_scheduled | FALSE | 0 | 12 | Collect payment |
| Day 27, 5 PM | payment_pending | FALSE | 0 | 12 | Process payment |
| Day 27, 6 PM | active | FALSE | 0 | 12 | Conduct session |
| Day 28, 2 PM | active | FALSE | 0 | 12 | Session in progress |
| Day 28, 2:50 PM | active | FALSE | 0 | 12 | Mark session complete |
| Day 29, 1 AM | active | **TRUE** | **1** | 12 | Schedule next session |
| Day 35, 2 PM | active | TRUE | 1 | 12 | Session 2 in progress |
| Day 35, 2:50 PM | active | TRUE | 1 | 12 | Mark session 2 complete |
| Day 36, 1 AM | active | TRUE | **2** | 12 | Continue therapy |

---

## Critical State Rules

### Rule 1: Intake is Mandatory Start Point
- Every client begins at `status='intake'`
- No client can exist outside the lifecycle
- Manual status transition moves client forward

### Rule 2: Therapist Assignment Can Happen Anytime After Intake
- Not required during intake
- Can be assigned during assessment prep
- Recommended before booking
- Can change if reassigning (rare)

### Rule 3: is_recurring Flag Only Changes at 1 AM UTC
- Determined by cron job
- Checks: `totalCompletedSessions >= 1`
- One day delay from session completion
- Manual updates NOT supported (cron-only)

### Rule 4: Status Transitions Are Granular
- Each step has a specific reason
- Audit trail tracks every change
- Can skip steps (e.g., go directly from intake to ready_for_booking if fast-tracked)
- Cannot go backward (no reversion supported)

### Rule 5: Payment Tied to Session Readiness
- Session must be "confirmed" (booked)
- Payment_pending status optional (depends on payment timing)
- Session can't start until paid (if payment_pending status used)
- Recurring clients may pay monthly (depends on implementation)

---

## Failure Scenarios & Recovery

### Scenario 1: Client Defaults on Payment

**Current State:**
```
Status: payment_pending
Payment: NOT received
Session: Scheduled for June 27
Amount: 300 AED
```

**What happens:**
```
Day of session: Session should start but client hasn't paid

Options:
├─ A. Therapist cancels session
│     └─ Booking status → 'cancelled'
│     └─ Status → ? (system doesn't define this)
│
├─ B. Therapist blocks session, waits for payment
│     └─ Status → 'booking_expired' (manual)
│     └─ Requires manual recovery
│
└─ C. Therapist conducts session anyway, bill later
     └─ Session completed with payment_status='pending'
```

**Recommendation:** System should have logic:
```
IF session_time >= NOW() AND payment_pending AND payment_not_received:
  ├─ Cancel booking OR
  ├─ Block therapist from starting session OR
  └─ Send urgent payment reminder
```

### Scenario 2: Client Not Suitable After Assessment

**Current State:**
```
Status: assessment_pending
Therapist review: "Not suitable for therapy"
```

**Manual recovery:**
```
PUT /api/admin/clients/42/status
{
  newStatus: "completed",
  reason: "Assessment completed, client not suitable for ongoing therapy"
}
```

**Implication:**
- Client marked as "completed" (but they never started!)
- is_recurring remains FALSE
- Therapist can note reason in client profile

**Better approach:**
- Add new status: "assessment_failed" or "not_suitable"
- Or: Use a "reason" field to distinguish completion types

### Scenario 3: Client Drops Out Mid-Therapy

**Current State:**
```
Status: active
is_recurring: TRUE
Sessions completed: 3
```

**Therapist decides:**
```
PUT /api/admin/clients/42/status
{
  newStatus: "inactive",
  reason: "Client requested to pause therapy"
}
```

**Result:**
- Status changed to "inactive"
- Can be resumed later (change status back to 'active')
- is_recurring flag stays TRUE (client already completed sessions)
- No new sessions scheduled

---

## Questions for Implementation

1. **What happens if a client is in `payment_pending` and the session time arrives without payment?**
   - Auto-cancel booking?
   - Prevent session start?
   - Send urgent reminder?

2. **Can therapists manually change `is_recurring`?**
   - Currently only cron job updates it
   - Should therapist be able to override?

3. **Can a status transition be reverted?**
   - Currently no backward transitions
   - Should there be an "undo" for accidental changes?

4. **How long should a client stay in `intake` before auto-expiring?**
   - Currently: indefinite (no timeout)
   - Should there be a "stale intake" rule?

5. **When a client is moved to `inactive`, what happens to pending bookings?**
   - Are sessions cancelled?
   - Are payments refunded?
   - Are they just paused?

---

## Summary

The client journey is:
1. **Created** at `intake` (via form submission)
2. **Assessed** by moving through `assessment_pending` → `ready_for_booking`
3. **Booked** when therapist creates first session → `booking_scheduled`
4. **Paid** (if required) → `payment_pending` → `active`
5. **Conducted** when session happens
6. **Marked Recurring** automatically by cron job after 1st completed session
7. **Continued** with ongoing sessions and payments

Each transition is **manual** (except cron) and **audited** for compliance.

