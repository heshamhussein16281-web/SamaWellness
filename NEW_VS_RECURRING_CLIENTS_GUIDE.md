# New vs. Recurring Clients - Complete Guide

**Last Updated:** 2026-06-14  
**Project:** Sama Wellness Therapy Platform  
**Context:** Client Lifecycle & Session Management

---

## Table of Contents

1. [Overview & Definition](#overview--definition)
2. [How the System Determines Status](#how-the-system-determines-status)
3. [Key Differences at Each Lifecycle Stage](#key-differences-at-each-lifecycle-stage)
4. [Workflow Comparison](#workflow-comparison)
5. [Data Fields & Tracking](#data-fields--tracking)
6. [Operational Implications](#operational-implications)
7. [Examples & Scenarios](#examples--scenarios)
8. [Automated Systems for Each Type](#automated-systems-for-each-type)

---

## Overview & Definition

### NEW CLIENT (is_recurring = false)

A **NEW CLIENT** is one who:
- ✅ Has completed their first therapy session (0 completed sessions in the count, but about to start)
- ✅ OR has been approved for therapy but hasn't had any sessions yet
- ✅ OR has attended only 1 session (still establishing)
- ❌ Has NOT yet completed 2+ sessions
- ❌ Is not in a regular ongoing therapy relationship
- ❌ Does not have a confirmed recurring appointment slot

**Database Value:** `is_recurring = false` (default)

**Client Status in System:** Typically in `BOOKING_SCHEDULED`, `PAYMENT_PENDING`, or just entering `ACTIVE` (first session)

### RECURRING CLIENT (is_recurring = true)

A **RECURRING CLIENT** is one who:
- ✅ Has completed AT LEAST 1 therapy session successfully
- ✅ Has an ongoing therapeutic relationship with their therapist
- ✅ Has multiple sessions either scheduled or expected to occur
- ✅ Maintains a regular appointment pattern (e.g., weekly Tuesdays at 3 PM)
- ✅ Continues therapy over an extended period (weeks, months, or ongoing)
- ❌ Is not a one-time or episodic client
- ❌ Is not in their first or second session

**Database Value:** `is_recurring = true`

**Client Status in System:** Typically `ACTIVE` with confirmed upcoming sessions

---

## How the System Determines Status

### Automatic Determination (Cron Job)

The system **automatically determines** if a client is recurring using a **daily cron job** at **1 AM UTC**:

```
POST /api/cron/update-recurring-clients
├─ Runs: Daily at 1 AM UTC
├─ Triggered by: Scheduled background task
├─ Authentication: CRON_SECRET header
└─ Purpose: Update all clients' is_recurring status
```

### Logic for Marking Client as Recurring

```typescript
// From: update-recurring-clients cron job

1. Find ALL clients with completed bookings (status = 'completed')
   
2. For each client with completed bookings:
   
   3. Count total completed sessions:
      const totalSessions = COUNT(bookings WHERE 
                                   booking_status = 'completed' 
                                   AND client_id = this_client_id)
   
   4. Calculate recurring status:
      const isRecurring = totalSessions >= 1
      
      // CRITICAL RULE:
      // If client has 1+ completed sessions → RECURRING
      // If client has 0 completed sessions → NEW
   
   5. Update client record:
      UPDATE clients SET
        is_recurring = isRecurring,
        total_sessions_completed = totalSessions,
        total_amount_paid = SUM(payment_records.amount_paid),
        updated_at = NOW()
      WHERE id = client_id
```

### Timing of Status Change

```
Timeline: New Client → Recurring Client

Week 1: INTAKE → ASSESSMENT_PENDING → READY_FOR_BOOKING
Status: is_recurring = false (no sessions yet)

Week 2: BOOKING_SCHEDULED
Status: is_recurring = false (waiting for first session)

Day of Session: ACTIVE (first session starts)
Status: is_recurring = false (still just first session)

After Session Complete: Session marked as 'completed'
Status: is_recurring = false (still first session)

Next Day at 1 AM: CRON JOB RUNS
├─ Detects: Client has 1 completed session ✓
├─ Calculation: totalSessions >= 1 → true
├─ Action: Set is_recurring = true
└─ Status: NOW RECURRING ✓

From This Point: Client is officially RECURRING
Status: is_recurring = true (ongoing therapy)
```

---

## Key Differences at Each Lifecycle Stage

### INTAKE Stage

| Aspect | NEW CLIENT | RECURRING CLIENT |
|--------|-----------|------------------|
| **Possible?** | ✅ YES (starting point) | ❌ NO (already past intake) |
| **is_recurring** | false | - |
| **Prior sessions** | 0 | - |
| **Therapist assigned** | None yet | - |

### ASSESSMENT_PENDING Stage

| Aspect | NEW CLIENT | RECURRING CLIENT |
|--------|-----------|------------------|
| **Possible?** | ✅ YES (first assessment) | ✅ YES (rare - reassessment) |
| **is_recurring** | false | true (if reassessing) |
| **Prior sessions** | 0 | 1+ |
| **Expected outcome** | First therapy approval | Change of approach/therapist |

### READY_FOR_BOOKING Stage

| Aspect | NEW CLIENT | RECURRING CLIENT |
|--------|-----------|------------------|
| **Possible?** | ✅ YES (first session awaited) | ✅ YES (rare - after pause) |
| **is_recurring** | false | true (if returning) |
| **Prior sessions** | 0 | 1+ (but paused) |
| **Therapist** | Newly assigned | Same or new |

### BOOKING_SCHEDULED Stage

| Aspect | NEW CLIENT | RECURRING CLIENT |
|--------|-----------|------------------|
| **Possible?** | ✅ YES (first appointment) | ✅ YES (frequent) |
| **is_recurring** | false | true |
| **Session count** | About to be 1 | Already 2+ |
| **Appointment pattern** | First time | Regular slot (weekly/bi-weekly) |
| **Therapist continuity** | First meeting | Established relationship |
| **Client comfort level** | Nervous/uncertain | Familiar/routine |

### PAYMENT_PENDING Stage

| Aspect | NEW CLIENT | RECURRING CLIENT |
|--------|-----------|------------------|
| **Possible?** | ✅ YES (if prepay required) | ✅ YES (recurring clients pay too) |
| **is_recurring** | false | true |
| **Payment pattern** | First payment | Established pattern |
| **Payment method** | Likely new | Already on file |
| **Urgency** | Maybe hesitant | Expected/routine |

### ACTIVE Stage

| Aspect | NEW CLIENT | RECURRING CLIENT |
|--------|-----------|------------------|
| **Possible?** | ✅ YES (just started 1st session) | ✅ YES (most common) |
| **is_recurring** | false → true (after 1st session) | true |
| **Session count** | 1 (just completed) | 2+ |
| **Next step** | Decision: continue or stop | Continue auto-scheduled sessions |
| **Therapist** | Building rapport | Established relationship |
| **Duration in this state** | Could be brief | Often weeks/months |
| **Risk of dropout** | High (first session) | Lower (invested) |

### COMPLETED Stage

| Aspect | NEW CLIENT | RECURRING CLIENT |
|--------|-----------|------------------|
| **Possible?** | ✅ YES (ended after 1 session) | ✅ YES (most common) |
| **is_recurring** | false | true |
| **Session count** | 1 | Many (10+) |
| **Therapy outcome** | Limited scope | Full course of treatment |
| **Why ended** | Decided to stop early | Therapy goals achieved |
| **Reopening likelihood** | Lower | Can resume (has history) |

### INACTIVE Stage

| Aspect | NEW CLIENT | RECURRING CLIENT |
|--------|-----------|------------------|
| **Possible?** | ✅ YES (paused before starting) | ✅ YES (common - therapy break) |
| **is_recurring** | false | true |
| **Session count** | 0 | 1+ |
| **Why paused** | Not ready, waiting, declined | Financial, personal, schedule |
| **Resumption** | Restart from intake | Resume existing therapy |
| **Records** | Minimal | Full history preserved |

### BOOKING_EXPIRED Stage

| Aspect | NEW CLIENT | RECURRING CLIENT |
|--------|-----------|------------------|
| **Possible?** | ✅ YES (missed first appointment) | ✅ YES (rare - no-show on recurring) |
| **is_recurring** | false | true |
| **Session count** | Still 0 | At least 1 |
| **Recovery path** | Rebook as new | Rebook with established therapist |
| **Likelihood** | Higher (nervous/uncertain) | Lower (committed) |

---

## Workflow Comparison

### NEW CLIENT WORKFLOW

```
┌──────────────────────────────────────────────────────┐
│         NEW CLIENT TYPICAL JOURNEY                   │
└──────────────────────────────────────────────────────┘

PHASE 1: INTAKE & ASSESSMENT
Days 1-7:
  └─ INTAKE → ASSESSMENT_PENDING → READY_FOR_BOOKING
  └─ is_recurring: false
  └─ Actions: Intake form, clinical evaluation
  └─ Anxiety level: High

PHASE 2: FIRST BOOKING
Days 8-14:
  └─ READY_FOR_BOOKING → BOOKING_SCHEDULED
  └─ is_recurring: false
  └─ Actions: First appointment scheduled
  └─ Client feelings: Excitement + nervousness

PHASE 3: FIRST SESSION
Days 15-21:
  └─ BOOKING_SCHEDULED → PAYMENT_PENDING (if applicable) → ACTIVE
  └─ is_recurring: false (still)
  └─ Actions: First therapy session occurs
  └─ Session outcome: Building rapport, establishing goals
  └─ Therapist note: "Good initial connection"

PHASE 4: CRUCIAL DECISION POINT (After 1st Session)
Days 22-30:
  
  At 1 AM Day 23: CRON JOB RUNS
  ├─ Counts: 1 completed session ✓
  ├─ Updates: is_recurring = true ← TRANSITION
  └─ Client now considered: RECURRING
  
  Decision branches:
  ├─ Branch A: Client wants to continue
  │  └─ Next session scheduled
  │  └─ Status: ACTIVE (ongoing)
  │  └─ Pattern: Regular appointments begin
  │
  ├─ Branch B: Client unsure / taking break
  │  └─ Status: INACTIVE (on hold)
  │  └─ is_recurring: true (but paused)
  │
  └─ Branch C: Client wants to stop (rare)
     └─ Status: COMPLETED (ended after 1 session)
     └─ is_recurring: true (technically, but completed)

PHASE 5: ONGOING (If Continuing)
Weeks 5+:
  └─ ACTIVE (multiple sessions)
  └─ is_recurring: true
  └─ Pattern: Regular therapy established
  └─ Client comfort: Increasing
```

### RECURRING CLIENT WORKFLOW

```
┌──────────────────────────────────────────────────────┐
│      RECURRING CLIENT TYPICAL JOURNEY                │
└──────────────────────────────────────────────────────┘

PHASE 1: INITIAL INTAKE & ASSESSMENT
Days 1-7: (Same as new client)
  └─ INTAKE → ASSESSMENT_PENDING → READY_FOR_BOOKING
  └─ is_recurring: false

PHASE 2: RAPID BOOKING
Days 8-10:
  └─ BOOKING_SCHEDULED (1st appointment)
  └─ is_recurring: false

PHASE 3: ACTIVE THERAPY BEGINS
Week 2-14+:
  └─ ACTIVE (recurring appointments established)
  └─ Session 1: Week 2
     ├─ is_recurring: false (not yet 1 completed)
     └─ [After cron runs next day: is_recurring = true]
  │
  └─ Session 2: Week 3
     ├─ is_recurring: true (1+ completed)
     └─ Regular pattern established (e.g., Weekly Tuesdays)
  │
  └─ Sessions 3-10: Weeks 4-11
     ├─ is_recurring: true (ongoing)
     ├─ Regular appointments continue
     ├─ Therapeutic relationship deepens
     ├─ Progress toward goals
     └─ Therapist & client settled into routine

PHASE 4: SUSTAINED ACTIVE THERAPY
Weeks 12+:
  └─ ACTIVE (maintained)
  └─ is_recurring: true
  └─ Pattern: Established routine
  └─ Client confidence: High
  └─ Sessions: Continuing indefinitely or to planned endpoint

PHASE 5: THERAPY ENDS (Multiple Pathways)

  Path A: COMPLETED (Goals Met)
  ├─ Timing: Week 12-16 (typical package complete)
  ├─ Sessions: 10-12
  ├─ Status: ACTIVE → COMPLETED
  ├─ is_recurring: true (final value)
  ├─ Outcome: Discharge planning, relapse prevention
  └─ Client: Feeling accomplished, independent

  Path B: INACTIVE (Pause)
  ├─ Timing: After 3-4 sessions
  ├─ Reason: Financial hardship, schedule conflict, life event
  ├─ Status: ACTIVE → INACTIVE
  ├─ is_recurring: true (but paused)
  ├─ Plan: Resume in X weeks/months
  └─ Client: Therapy on hold, can resume

  Path C: ONGOING ACTIVE (Indefinite)
  ├─ Timing: Weeks 16+
  ├─ Session frequency: Continues weekly or as scheduled
  ├─ Status: Remains ACTIVE
  ├─ is_recurring: true (constantly)
  ├─ Type: Long-term therapy client
  └─ Client: Maintenance + growth ongoing
```

---

## Data Fields & Tracking

### fields Set/Updated for NEW Clients

```sql
-- At INTAKE Creation:
INSERT INTO clients (
  name,                    -- From form
  email,                   -- From form
  phone,                   -- From form
  date_of_birth,          -- From form
  status,                 -- 'intake'
  is_recurring,           -- false ← DEFAULT
  client_since,           -- NOW()
  referral_source,        -- From form
  notes,                  -- From form
  total_sessions_completed, -- 0 ← DEFAULT
  total_amount_paid,      -- 0.00 ← DEFAULT
  created_at,
  updated_at
)

-- During ASSESSMENT & BOOKING:
UPDATE clients SET
  therapist_id = <assigned>,  -- May be set
  status = '<next state>',
  updated_at = NOW()

-- After First Session Complete:
-- CRON JOB runs and updates:
UPDATE clients SET
  is_recurring = true,              ← KEY CHANGE!
  total_sessions_completed = 1,
  total_amount_paid = <from payments>,
  last_session_date = <session date>,
  updated_at = NOW()
WHERE id = <client_id>
```

### Fields Set/Updated for RECURRING Clients

```sql
-- Initial Creation (Same as new):
is_recurring = false

-- After 1st Session Completion:
-- CRON JOB updates ALL fields:
UPDATE clients SET
  is_recurring = true,              ← NOW RECURRING
  total_sessions_completed = 1,     ← Incremented
  total_amount_paid = <summed>,     ← Tracked
  last_session_date = <date>,       ← Updated
  updated_at = NOW()

-- For Subsequent Sessions:
-- CRON JOB updates daily with latest data:
UPDATE clients SET
  total_sessions_completed = N,     ← Increases per completed session
  total_amount_paid = <new sum>,
  last_session_date = <most recent>,
  updated_at = NOW()
  -- is_recurring = true (unchanged)

-- Example progression:
-- After session 1: is_recurring = true, total_sessions = 1
-- After session 2: is_recurring = true, total_sessions = 2
-- After session 3: is_recurring = true, total_sessions = 3
-- ... and so on
```

### How Total_Sessions_Completed is Tracked

```typescript
// CRON JOB LOGIC (Runs Daily at 1 AM UTC)

For each client:
  
  1. Count completed bookings:
     SELECT COUNT(*) FROM bookings 
     WHERE client_id = X 
     AND booking_status = 'completed'
  
  2. Sum all payments:
     SELECT SUM(amount_paid) FROM payment_records
     WHERE client_id = X
  
  3. Get most recent session:
     SELECT MAX(session_date) FROM bookings
     WHERE client_id = X 
     AND booking_status = 'completed'
  
  4. Update client record with all values
  
  Result: Always up-to-date totals
```

---

## Operational Implications

### For NEW Clients (is_recurring = false)

**Clinic Operations:**
1. ✅ Higher staff attention needed (uncertain if they'll continue)
2. ✅ Therapy planning is experimental (single session)
3. ✅ Limited history to work from
4. ✅ More flexible scheduling (not locked into weekly slot)
5. ✅ Potential cost: Intake forms, initial assessments
6. ❌ Higher dropout risk (don't know if therapy is right for them)

**Therapist Perspective:**
1. Focus: Building rapport, establishing goals, assessing fit
2. Planning: Initial treatment plan, not long-term commitment
3. Notes: Extensive background gathering
4. Schedule: May have gaps between first and second session
5. Risk: "First session flakiness" (some never return after intake)

**Client Perspective:**
1. Uncertainty: "Is this the right therapist/clinic?"
2. Cost: Paying for unknown value
3. Comfort: Nervous about first session
4. Commitment: Testing waters, not fully committed
5. Expectations: May have unrealistic hopes or fears

**Reporting & Analytics:**
```
Metric: "New Client Retention"
├─ How many new clients (is_recurring = false) continue to session 2?
├─ When is "recurring" flag triggered?
└─ Drop-off point analysis: Intake vs. 1st session
```

### For RECURRING Clients (is_recurring = true)

**Clinic Operations:**
1. ✅ Stable, predictable workflow
2. ✅ Client committed to treatment
3. ✅ Therapist has full background
4. ✅ Locked into recurring appointment slot
5. ✅ Lower intake/administrative overhead per session
6. ✅ Revenue is predictable and sustained

**Therapist Perspective:**
1. Focus: Deepening work, tracking progress toward goals
2. Planning: Multi-week/month treatment arc
3. Notes: Building on prior sessions
4. Schedule: Regular confirmed slot (e.g., "Tuesday 3 PM")
5. Relationship: Established therapeutic alliance

**Client Perspective:**
1. Commitment: "I'm in therapy, this is my routine"
2. Cost: Sunk cost + expected ongoing investment
3. Comfort: Familiar therapist, routine appointment
4. Progress: Measurable improvement over time
5. Expectations: Clear about what therapy entails

**Reporting & Analytics:**
```
Metric: "Recurring Client Metrics"
├─ Total active recurring clients: <count>
├─ Average session count: <n>
├─ Average treatment duration: <weeks/months>
├─ Revenue from recurring clients: $X
├─ Therapist utilization: <% of time booked>
└─ Completion rate: <% who finish vs. abandoned>
```

---

## Automated Systems for Each Type

### Cron Job 1: Update Recurring Clients (Daily at 1 AM UTC)

**Purpose:** Identify NEW clients who just became RECURRING

```
Cron: POST /api/cron/update-recurring-clients

Triggers:
├─ Time: 1 AM UTC every day
├─ Type: Automated background job
└─ Secret: Verified via CRON_SECRET header

Logic:
  1. Find all clients with completed bookings
  2. For each client:
     ├─ Count: How many completed sessions?
     ├─ Calc: Is count >= 1?
     ├─ Sum: Total amount paid?
     ├─ Get: Last session date?
     └─ Update: Set is_recurring flag + totals

Result:
  ✅ NEW client (0 sessions) remains: is_recurring = false
  ✅ NEW → RECURRING (1+ sessions) becomes: is_recurring = true
  ✅ RECURRING client (2+ sessions) confirmed: is_recurring = true
  ✅ All session counts & payment totals updated

Example Output:
{
  "success": true,
  "count": 45,
  "failed": 0,
  "message": "Updated 45 clients: 45 successful, 0 failed"
}
```

**Error Handling:**
- If payment record fetch fails: Client update skipped, error logged
- If client update fails: Try next client
- If history fails: Log warning but continue
- Partial success: Returns success if at least one client updated

### Cron Job 2: Mark Inactive Clients (Daily at 2 AM UTC)

**Purpose:** Auto-pause RECURRING clients who haven't had sessions in 90 days

```
Cron: POST /api/cron/mark-inactive-clients

Triggers:
├─ Time: 2 AM UTC every day (after recurring clients job)
├─ Type: Automated background job
└─ Secret: Verified via CRON_SECRET header

Logic:
  1. Find clients where:
     ├─ status = 'active' (currently in therapy)
     ├─ last_session_date < 90 days ago (no recent activity)
     └─ [May include both new & recurring]
  
  2. For each inactive client:
     ├─ Update: status = 'inactive'
     ├─ Log: Create status history entry
     ├─ Reason: "No activity for 90 days"
     └─ Changed_by: System (null user_id)

Result:
  ✅ NEW client (1 session, none since): May move to inactive
  ✅ RECURRING client (last session 4 months ago): Moved to inactive
  ✅ ACTIVE ongoing client: Remains active
  ✅ History: Audit trail created for each change

Example Output:
{
  "success": true,
  "count": 12,
  "failed": 0,
  "message": "Processed 12 clients: 12 marked inactive, 0 failed"
}
```

**Impact:**
```
Before Cron:
├─ Client status: 'active'
├─ is_recurring: true
├─ last_session_date: 2026-03-14 (95 days ago)
└─ Result: Client still shows as "active" in dashboard

After Cron:
├─ Client status: 'inactive' ← CHANGED
├─ is_recurring: true (unchanged)
├─ last_session_date: 2026-03-14 (unchanged)
├─ status_history: New entry created
└─ Result: Client moved to "waiting list", can be reactivated
```

### Cron Job Scheduling

```
Timeline of Daily Automated Updates:

1 AM UTC: update-recurring-clients runs
  ├─ Detects new recurring clients
  ├─ Updates session counts
  ├─ Updates payment totals
  └─ Mark clients as is_recurring = true

↓ 1 minute later ↓

2 AM UTC: mark-inactive-clients runs
  ├─ Detects active clients with no sessions in 90 days
  ├─ May include NEW or RECURRING clients
  ├─ Updates status to 'inactive'
  └─ Logs status change

Result: Every morning (1-2 AM UTC), all client data refreshed
```

---

## Examples & Scenarios

### Scenario 1: New Client Success Path

```
CLIENT: James, starts therapy for anxiety

Day 1: INTAKE
├─ Submits form: Name, contact, concern (anxiety)
├─ is_recurring: false
├─ Status: intake
└─ Sessions: 0

Days 2-3: ASSESSMENT_PENDING
├─ Meets clinician, evaluation occurs
├─ Therapist assigned: Dr. Sarah
├─ is_recurring: false (still no sessions)
├─ Status: assessment_pending
└─ Sessions: 0

Days 4-7: READY_FOR_BOOKING
├─ Clinician approves for therapy
├─ is_recurring: false (no sessions yet)
├─ Status: ready_for_booking
└─ Sessions: 0

Days 8-14: BOOKING_SCHEDULED
├─ First appointment booked: Tuesday 2 PM
├─ is_recurring: false (not yet a session)
├─ Status: booking_scheduled
└─ Sessions: 0

Day 14 at 2 PM: FIRST SESSION OCCURS (ACTIVE)
├─ Session 1 of undefined begins
├─ Rapport building, goal setting
├─ is_recurring: false (session just occurring, not yet completed)
├─ Status: active
└─ Sessions: 0 (not marked completed yet)

Day 14 at 3 PM: SESSION MARKED COMPLETE
├─ Therapist marks session as completed in system
├─ is_recurring: STILL false (marked complete, waiting for cron)
├─ Status: active
└─ Sessions: 0 → 1 (marked complete, counted)

Day 15 at 1 AM: CRON JOB RUNS
├─ Detects: Client has 1 completed session ✓
├─ Calculation: 1 >= 1 → TRUE
├─ Update: is_recurring = false → TRUE ← TRANSITION!
├─ is_recurring: true (OFFICIALLY RECURRING NOW)
├─ Status: active (unchanged)
└─ Sessions: 1 (updated by cron)

Day 15+: CLIENT IS NOW RECURRING
├─ is_recurring: true
├─ Next session: Booked for Week 3
├─ Pattern: Weekly therapy established
├─ Dashboard shows: "Recurring" badge
├─ James is now: RECURRING CLIENT
```

### Scenario 2: New Client Dropout Path

```
CLIENT: Maria, starts therapy then stops

Days 1-14: (Same as above)
├─ Intake → Assessment → Ready → Booking
├─ is_recurring: false
└─ Status: booking_scheduled

Day 15: FIRST SESSION
├─ Session starts at 3 PM
├─ 20 minutes in: Maria feels overwhelmed
├─ Maria: "I'm not ready for this"
├─ Leaves early, doesn't want to continue
└─ is_recurring: false

Day 15 at 3:30 PM: THERAPIST MARKS SESSION
├─ Note: "Client attended 30 min, decided to stop"
├─ Status: marked as 'completed' (she attended part of it)
├─ is_recurring: false
└─ Sessions: 0 → 1

Day 16 at 1 AM: CRON JOB RUNS
├─ Detects: Client has 1 completed session ✓
├─ Calculation: 1 >= 1 → TRUE
├─ Update: is_recurring = true ← (Even though stopping!)
├─ is_recurring: true
├─ Status: active
└─ Sessions: 1

Day 16: Maria's Status
├─ Technically: is_recurring = true, is_recurring = 1
├─ Actually: Not coming back
├─ Admin follow-up: "Would you like to reschedule?"
├─ Maria: "No, I think I need to focus on other things"
├─ Action: Moved to INACTIVE
├─ Final is_recurring: true (completed = 1, so true)
└─ Outcome: One-session therapy, technically recurring (but done)
```

### Scenario 3: Recurring Client Longterm Therapy

```
CLIENT: David, ongoing therapy client

Weeks 1-2: NEW CLIENT
├─ Intake, assessment, booking
├─ is_recurring: false
└─ Status: booking_scheduled → active

Week 2 Session 1: (Marks as complete)
├─ is_recurring: false (until cron runs)
└─ Sessions: 0

Week 2 Night (1 AM): CRON RUNS
├─ is_recurring: true ← TRANSITION
└─ Sessions: 1

Week 3 Session 2:
├─ is_recurring: true (confirmed)
├─ Regular Tuesday 3 PM slot
├─ Building therapeutic relationship
├─ Progress: Setting baseline for anxiety levels
└─ Sessions: 1 (before session), 2 (after complete)

Weeks 4-11: ONGOING ACTIVE
├─ Regular weekly sessions
├─ is_recurring: true (maintained)
├─ Sessions increment: 3, 4, 5, ..., 10
├─ Progress: Visible improvement
├─ Therapist: Taking session notes, tracking outcomes
└─ David: Comfortable routine, seeing results

Week 12: COMPLETION ASSESSMENT
├─ David & Dr. Smith discuss: "Goals achieved?"
├─ David: "Yes, I'm managing anxiety much better"
├─ Plan: Final session next week
├─ is_recurring: true (unchanged)
└─ Sessions: 10 completed

Week 13 Final Session:
├─ Discharge planning, relapse prevention
├─ Celebration of progress
├─ Referral to support group
├─ is_recurring: true (doesn't change)
├─ Status: ACTIVE → COMPLETED
└─ Sessions: 11

Post-Completion:
├─ is_recurring: true (preserved)
├─ total_sessions_completed: 11 (preserved)
├─ Status: COMPLETED
├─ total_amount_paid: $1,650 (11 × $150)
└─ Outcome: Successful long-term therapy
```

---

## Summary Table

| Aspect | NEW CLIENT (is_recurring = false) | RECURRING CLIENT (is_recurring = true) |
|--------|---------|---------|
| **Definition** | 0 completed sessions OR < 1 completed session | ≥ 1 completed session |
| **Lifecycle Stage** | Intake through 1st session | 2nd+ session onward |
| **When Status Changes** | After 1st session, when cron runs | Never changes (once true, stays true) |
| **Therapist Assignment** | Newly assigned | Established |
| **Appointment Pattern** | One-off, testing | Regular weekly/recurring slot |
| **Clinic Attention** | High (uncertain continuity) | Medium (routine, sustained) |
| **Dropout Risk** | Very High | Low |
| **Revenue Predictability** | Unknown | Predictable |
| **Data Tracking** | Minimal | Complete history |
| **Total Sessions** | 0-1 | 2+ |
| **Common Statuses** | Intake, Assessment, Booking | Active, Completed, Inactive (paused) |
| **Re-engagement Path** | New intake if time passes | Resume with existing therapist |
| **Cron Job Impact** | Watched closely (can become recurring) | Maintained daily (updated stats) |

---

**Document Complete**  
**Status:** Comprehensive New vs. Recurring Client Reference  
**Last Updated:** 2026-06-14
