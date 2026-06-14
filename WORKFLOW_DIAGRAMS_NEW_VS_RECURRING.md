# Workflow Diagrams: New Client vs. Recurring Client

**Last Updated:** 2026-06-14  
**Project:** Sama Wellness Therapy Platform  
**Visual Reference:** Complete workflow diagrams with all statuses

---

## Table of Contents

1. [Combined Overview Diagram](#combined-overview-diagram)
2. [New Client Detailed Workflow](#new-client-detailed-workflow)
3. [Recurring Client Detailed Workflow](#recurring-client-detailed-workflow)
4. [Side-by-Side Comparison](#side-by-side-comparison)
5. [Status Transition Matrix](#status-transition-matrix)
6. [Timeline Comparison](#timeline-comparison)
7. [Decision Tree Flowcharts](#decision-tree-flowcharts)

---

## Combined Overview Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                   SAMA WELLNESS CLIENT LIFECYCLE OVERVIEW                         │
│                    (New Client → Recurring Client Path)                           │
└────────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   INTAKE    │
                              │ is_rec: ✗   │
                              └──────┬──────┘
                                     │
                          Clinician reviews form
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
        Request more info                    Assessment scheduled
         (stay in INTAKE)                                │
         is_rec: ✗                    ┌──────────────────┘
                 │                    │
                 │         ┌──────────────────────────┐
                 │         │ ASSESSMENT_PENDING       │
                 │         │ is_rec: ✗                │
                 │         └──────┬───────────────────┘
                 │                │
                 │     Clinician evaluates client
                 │                │
                 │    ┌───────────┼───────────┐
                 │    │           │           │
              Suitable      Not Suitable    Crisis
                 │           (→ INACTIVE)  (→ ACTIVE)
                 │                │
                 │    ┌───────────┘
                 │    │
                 ▼    ▼
         ┌──────────────────────┐
         │ READY_FOR_BOOKING    │
         │ is_rec: ✗            │
         │ Sessions: 0          │
         └──────┬───────────────┘
                │
        Client ready to book?
        ┌───────┴────────┐
        │                │
       YES              NO/HESITANT
        │               (→ INACTIVE)
        │
        ▼
    ┌──────────────────────┐
    │ BOOKING_SCHEDULED    │
    │ is_rec: ✗            │
    │ Sessions: 0          │
    │ Appointment: Confirmed
    └──────┬───────────────┘
           │
    Prepayment required?
    ┌──────┴──────┐
    │             │
   YES           NO
    │             │
    ▼             │
┌─────────────┐   │
│PAYMENT_     │   │
│PENDING      │   │
│is_rec: ✗    │   │
└──┬──────────┘   │
   │              │
Payment received  │
   │              │
   └──────┬───────┘
          │
          ▼
    ╔════════════════════════════════════════════════════════════╗
    ║                    🔄 CRITICAL MOMENT 🔄                  ║
    ║                                                            ║
    ║   SESSION 1 OCCURS (Day 15 at 2:00 PM)                   ║
    ║   Status: ACTIVE                                          ║
    ║   is_recurring: ✗ (STILL FALSE - not yet counted)        ║
    ║                                                            ║
    ║   Session marked COMPLETE (Day 15 at 3:00 PM)            ║
    ║   Status: ACTIVE                                          ║
    ║   is_recurring: ✗ (STILL FALSE - waiting for cron)       ║
    ║                                                            ║
    ║   CRON JOB RUNS (Day 16 at 1:00 AM UTC)                  ║
    ║   ├─ Detects: 1 completed session ✓                       ║
    ║   ├─ Calculation: 1 >= 1 → TRUE                           ║
    ║   └─ UPDATE: is_recurring: ✗ → ✓ ✅ TRANSITION!         ║
    ║                                                            ║
    ║   NOW OFFICIALLY RECURRING CLIENT 🔄                      ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
          │
          │ is_recurring now = ✓ (RECURRING CLIENT)
          │ Sessions: 1
          │
          ▼
    ┌──────────────────────────────┐
    │ ACTIVE (Ongoing Therapy)     │
    │ is_rec: ✓                    │
    │ Sessions: 1, 2, 3, ... N    │
    │ Pattern: Regular (weekly)    │
    └──────┬──────────────────────┘
           │
           │ (Sessions continue)
           │ (Each session increments counter via daily cron)
           │
    ┌──────┴────────────┬────────────────────┐
    │                   │                    │
 Therapy         Client wants      Therapy goals
  pauses              to stop           achieved
    │                   │                    │
    ▼                   ▼                    ▼
┌────────────┐   ┌────────────┐   ┌──────────────────┐
│ INACTIVE   │   │ COMPLETED  │   │ COMPLETED        │
│ is_rec: ✓  │   │ is_rec: ✓  │   │ (After many      │
│ Sessions:  │   │ Sessions:  │   │  sessions)       │
│ paused at 2│   │ 1 (early   │   │ is_rec: ✓        │
│            │   │  termination)  │ Sessions: 10+   │
└────────────┘   └────────────┘   └──────────────────┘
    │                                     │
    │ (Can resume)                        │
    └─────────────────────────────────────┘
          │
          └─→ (Option to re-engage anytime)


LEGEND:
┌─────┐
│ STATE │  = Client Status
└─────┘
is_rec: ✗  = is_recurring = false (NEW CLIENT)
is_rec: ✓  = is_recurring = true  (RECURRING CLIENT)
→         = Automatic or manual transition
🔄        = CRITICAL TRANSITION POINT
```

---

## New Client Detailed Workflow

```
┌────────────────────────────────────────────────────────────────────┐
│              📋 NEW CLIENT WORKFLOW (is_recurring = FALSE)         │
│                      Step-by-Step Journey                          │
└────────────────────────────────────────────────────────────────────┘


PHASE 1: INITIAL INTAKE (Days 1-7)
═══════════════════════════════════════════════════════════════════

    ┌─────────────────────────────────┐
    │   INTAKE                        │
    │ ─────────────────────────────   │
    │ is_recurring: FALSE             │
    │ Sessions completed: 0           │
    │ Therapist: None yet             │
    │ Appointment: None               │
    │ Duration in state: 1-3 days     │
    │ Risk level: Highest             │
    └──────────────┬──────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
    Complete?             Needs more info
         │                    │
    ┌────▼─────┐         ┌───▼────────┐
    │ Schedule │         │ Request    │
    │Assessment│         │ Additional │
    │          │         │ Info from  │
    └────┬─────┘         │ Client     │
         │               └───┬────────┘
         │                   │
         └──────┬────────────┘
                │
                ▼
    ┌─────────────────────────────────┐
    │ ASSESSMENT_PENDING              │
    │ ─────────────────────────────   │
    │ is_recurring: FALSE             │
    │ Sessions completed: 0           │
    │ Therapist: Assigned             │
    │ Appointment: Assessment booked  │
    │ Duration in state: 1-3 days     │
    │ Risk level: Still high          │
    └──────────────┬──────────────────┘
                   │
    ┌──────────────┴────────────────┐
    │ ASSESSMENT DAY ARRIVES         │
    └──────────────┬────────────────┘
                   │
    ┌──────────────┴────────────────┐
    │ Clinician evaluates client     │
    │ • Deep dive into concerns      │
    │ • Mental health assessment     │
    │ • Treatment plan discussion    │
    │ • Suitable for outpatient?     │
    └──────────────┬────────────────┘
                   │
         ┌─────────┴──────────┬──────────┐
         │                    │          │
      Suitable           Not suitable  Crisis
         │                    │          │
         │              ┌─────▼──────┐  │
         │              │ INACTIVE   │  │
         │              │ Referred   │  │
         │              │elsewhere   │  │
         │              └────────────┘  │
         │                               │
         │                        ┌──────▼─────┐
         │                        │ ACTIVE     │
         │                        │ Crisis     │
         │                        │ intervention
         │                        └────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │ READY_FOR_BOOKING               │
    │ ─────────────────────────────   │
    │ is_recurring: FALSE             │
    │ Sessions completed: 0           │
    │ Therapist: CONFIRMED ASSIGNED   │
    │ Appointment: Awaiting booking   │
    │ Duration in state: 2-7 days     │
    │ Risk level: DECISION POINT      │
    └──────────────┬──────────────────┘
                   │
    ┌──────────────┴────────────────┐
    │ CRITICAL DECISION POINT        │
    │ Will client proceed with       │
    │ first appointment?             │
    └──────────────┬────────────────┘
                   │
         ┌─────────┴──────────┬──────────┐
         │                    │          │
      YES              NO/HESITANT    CANCEL
         │                    │         │
         │              ┌─────▼──────┐ │
         │              │ INACTIVE   │ │
         │              │ Waiting    │ │
         │              │ list       │ │
         │              └────────────┘ │
         │                             │
         ▼                             │
    ┌──────────────────────────────┐   │
    │ BOOKING_SCHEDULED            │◄──┘
    │ ──────────────────────────   │
    │ is_recurring: FALSE          │
    │ Sessions completed: 0        │
    │ Appointment: CONFIRMED ✓     │
    │ Date/Time: Locked in         │
    │ Therapist: Ready             │
    │ Duration in state: 1-14 days │
    │ Risk level: HIGH             │
    └──────────────┬───────────────┘
                   │
    ┌──────────────┴─────────────┐
    │ Is prepayment required?    │
    └──────────────┬─────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
        YES                   NO
         │                    │
    ┌────▼──────────┐         │
    │ PAYMENT_      │         │
    │ PENDING       │         │
    │ ──────────    │         │
    │ is_recurring: │         │
    │ FALSE         │         │
    │ Payment due:  │         │
    │ <deadline>    │         │
    └────┬──────────┘         │
         │                    │
    ┌────┴──────────┐         │
    │ Payment       │         │
    │ received?     │         │
    └────┬──────────┘         │
         │                    │
    ┌────▼───────┐            │
    │ YES        │            │
    └────┬───────┘            │
         │                    │
         └──────┬─────────────┘
                │
                ▼
    ╔═════════════════════════════════╗
    ║ ⏰ SESSION 1 OCCURS 🎬        ║
    ║ ═════════════════════════════ ║
    ║                                 ║
    ║ Date: <appointment date>        ║
    ║ Time: <appointment time>        ║
    ║ Status: ACTIVE                  ║
    ║ is_recurring: FALSE (still)     ║
    ║                                 ║
    ║ What happens:                   ║
    ║ • Client meets therapist        ║
    ║ • Rapport building              ║
    ║ • Initial goal setting          ║
    ║ • Exploration of concerns       ║
    ║                                 ║
    ║ Risk: Client says "not for me"  ║
    ║       and leaves                ║
    ║                                 ║
    ╚═════════════════════════════════╝
                │
                │ Session completes
                │
                ▼
    ┌────────────────────────────────┐
    │ ACTIVE (Session 1 Complete)    │
    │ ──────────────────────────────│
    │ is_recurring: FALSE (waiting)   │
    │ Sessions completed: 0 (formal)  │
    │ Status: Session marked complete │
    │ Timestamp: <session end time>   │
    │                                │
    │ WAITING FOR DAILY CRON JOB      │
    │ (runs at 1 AM UTC next day)     │
    └────────────────────────────────┘
                │
                │ (Client continues)
                │
    ╔═════════════════════════════════╗
    ║ 🤖 AUTOMATION: CRON JOB RUNS 🤖║
    ║ ═════════════════════════════ ║
    ║                                 ║
    ║ Time: Next day at 1:00 AM UTC   ║
    ║ Function: update-recurring-     ║
    ║           clients               ║
    ║                                 ║
    ║ Detection: ✓ Client has 1       ║
    ║            completed session    ║
    ║                                 ║
    ║ Calculation:                    ║
    ║ total_sessions >= 1?            ║
    ║ YES ✓                           ║
    ║                                 ║
    ║ UPDATE:                         ║
    ║ is_recurring: FALSE → TRUE ✅  ║
    ║                                 ║
    ║ NEW CLIENT → RECURRING CLIENT   ║
    ║ TRANSITION COMPLETE! 🎉         ║
    ║                                 ║
    ╚═════════════════════════════════╝
                │
                │ is_recurring now TRUE
                │
                ▼
    ┌──────────────────────────────────┐
    │ ACTIVE (Now RECURRING) 🔄        │
    │ ──────────────────────────────  │
    │ is_recurring: TRUE ✓             │
    │ Sessions completed: 1            │
    │ Therapist: Established relation  │
    │ Pattern: Regular weekly schedule │
    │ Status: Ongoing therapy          │
    │                                  │
    │ CRITICAL: Now considered a       │
    │ "Recurring Client"               │
    │ (Retention = SUCCESS)            │
    └──────────────┬───────────────────┘
                   │
         ┌─────────┴──────────────────┐
         │                            │
    Session 2 booked                Session ends
    (weekly pattern)                 (client decides
         │                           to stop)
         │                           │
         ▼                      ┌────▼──────┐
    ┌───────────────┐           │COMPLETED  │
    │ACTIVE (S2)    │           │(early)    │
    │Sessions: 1→2  │           │Sessions:1 │
    │is_recurring:✓ │           └───────────┘
    │Pattern: Locked│
    │              │
    └───────────────┘


POSSIBLE OUTCOMES FOR NEW CLIENTS:
═══════════════════════════════════════════════════════════════════

✅ BEST: Client → Recurring (Session 1 & continues)
   └─→ ACTIVE → Eventually COMPLETED after therapy

⚠️  NEUTRAL: Client → Cancelled (no-show or cancels before S1)
   └─→ BOOKING_EXPIRED → INACTIVE

⚠️  PROBLEMATIC: Client → Stops after Session 1
   └─→ Marked RECURRING (technically, 1 session)
   └─→ But never returns (churned)

❌ WORST: Client drops in intake/assessment phase
   └─→ Never reaches ACTIVE
   └─→ Lost client
```

---

## Recurring Client Detailed Workflow

```
┌────────────────────────────────────────────────────────────────────┐
│            🔄 RECURRING CLIENT WORKFLOW (is_recurring = TRUE)      │
│                    Sustained Therapy Journey                       │
└────────────────────────────────────────────────────────────────────┘


PHASE 1-3: (Same as new client until Session 1 completes)
═══════════════════════════════════════════════════════════════════

    INTAKE → ASSESSMENT_PENDING → READY_FOR_BOOKING →
    BOOKING_SCHEDULED → (PAYMENT_PENDING optional) → ACTIVE (S1)
    
    is_recurring: FALSE throughout
    Sessions: 0
    
    (See NEW CLIENT diagram above for detailed flow)


🔄 CRITICAL TRANSITION POINT
═══════════════════════════════════════════════════════════════════

    ╔═════════════════════════════════════════════════════════╗
    ║ SESSION 1 COMPLETES & CRON JOB UPDATES                 ║
    ║ is_recurring: FALSE → TRUE ✅                           ║
    ║                                                         ║
    ║ CLIENT NOW CLASSIFIED AS "RECURRING"                   ║
    ║ ════════════════════════════════════════════════════  ║
    ║ • Higher retention likelihood                          ║
    ║ • Regular therapy expected                             ║
    ║ • Sustained revenue stream                             ║
    ║ • Multi-week/month treatment planned                   ║
    ╚═════════════════════════════════════════════════════════╝


PHASE 2: ESTABLISHING PATTERN (Weeks 2-5)
═══════════════════════════════════════════════════════════════════

    ┌──────────────────────────────────┐
    │ ACTIVE - Session 2                │
    │ ──────────────────────────────   │
    │ is_recurring: TRUE ✓              │
    │ Sessions: 1 (completed) → 2      │
    │ Pattern: Weekly Tuesdays 3 PM    │
    │ Therapist: Dr. Sarah (established│
    │ Client comfort: Growing          │
    │ Progress: Baseline established   │
    │ Duration in state: ~1 week       │
    │                                  │
    │ Session notes: Rapport building, │
    │ goal refinement, technique intro │
    └──────────────┬───────────────────┘
                   │
                   │ (Daily cron updates totals)
                   │ is_recurring: TRUE (maintained)
                   │ Sessions: 2
                   │
                   ▼
    ┌──────────────────────────────────┐
    │ ACTIVE - Session 3                │
    │ ──────────────────────────────   │
    │ is_recurring: TRUE ✓              │
    │ Sessions: 2 (completed) → 3      │
    │ Pattern: Weekly (routine now)    │
    │ Therapist: Dr. Sarah (consistent)│
    │ Client comfort: High             │
    │ Progress: Techniques working     │
    │ Duration in state: ~1 week       │
    │                                  │
    │ Session notes: Client learning   │
    │ coping strategies, seeing results│
    └──────────────┬───────────────────┘
                   │
                   │ (Weekly sessions continue)
                   │ (Cron updates: Sessions 3→4→5)
                   │
                   ▼
    ┌──────────────────────────────────┐
    │ ACTIVE - Sessions 4-5             │
    │ ──────────────────────────────   │
    │ is_recurring: TRUE ✓              │
    │ Sessions: 5 (completed)          │
    │ Pattern: Locked-in routine       │
    │ Therapist: Deep relationship     │
    │ Client comfort: Very comfortable │
    │ Progress: Clear improvement      │
    │ Duration in state: ~2 weeks      │
    │                                  │
    │ Session notes: Deeper therapeutic│
    │ work, addressing core patterns,  │
    │ client confidence increasing     │
    └──────────────┬───────────────────┘
                   │


PHASE 3: SUSTAINED THERAPY (Weeks 6-12+)
═══════════════════════════════════════════════════════════════════

    ┌────────────────────────────────────────┐
    │ ACTIVE - Ongoing Therapy (Sessions 6-10)│
    │ ──────────────────────────────────────│
    │ is_recurring: TRUE ✓ (MAINTAINED)     │
    │ Sessions: 6, 7, 8, 9, 10 (ongoing)   │
    │ Pattern: Reliable weekly schedule     │
    │ Therapist: Strong established bond    │
    │ Client: Showing measurable progress   │
    │ Duration in state: 4-6 weeks          │
    │ Risk level: LOW (committed)           │
    │                                       │
    │ Cron job updates DAILY:               │
    │ • Sessions completed: 6 → 10         │
    │ • Total amount paid: Updated          │
    │ • Last session date: Updated          │
    │ • is_recurring: TRUE (maintained)    │
    │                                       │
    │ Therapy focus:                        │
    │ • Addressing core issues              │
    │ • Building resilience                 │
    │ • Developing long-term coping         │
    │ • Monitoring progress toward goals    │
    └────────────────┬──────────────────────┘
                     │
       ┌─────────────┼──────────────┐
       │             │              │
   Therapy ends  Client pauses  Continue ongoing
   (Goals met)   (Life event)  (Open-ended)
       │             │              │
       │        ┌────▼─────┐        │
       │        │ INACTIVE │        │
       │        │ is_rec:✓ │        │
       │        │ (Paused) │        │
       │        └──────────┘        │
       │                            │
       │     ┌──────────────┐       │
       │     │ Can resume   │       │
       │     │ when ready   │       │
       │     └──────────────┘       │
       │                            │
       ▼                            ▼
    ┌────────────────────┐    ┌──────────────────────┐
    │ COMPLETED          │    │ ACTIVE (Continues)   │
    │ ────────────────  │    │ ─────────────────── │
    │ is_recurring: TRUE │    │ is_recurring: TRUE  │
    │ Sessions: 10+     │    │ Sessions: 11, 12,   │
    │ Outcome: Goals    │    │ 13... (ongoing)     │
    │         achieved  │    │ Pattern: Maintenance│
    │ Discharge notes:  │    │ or growth therapy   │
    │ • Relapse         │    │                    │
    │   prevention plan │    │ Duration: Weeks to │
    │ • Referrals      │    │ months to years     │
    │ • Resources      │    │ Status: Stable      │
    │                  │    │                    │
    │ FINAL STATE      │    │ ONGOING STATE       │
    │ (Usually)        │    │ (Indefinite)        │
    └────────────────────┘    └──────────────────────┘
           │                           │
           │                           │
           │ (If new issues arise       │ (Life continues)
           │  months/years later)       │
           │                           │
           └────────┬──────────────────┘
                    │
                    │ Can return anytime
                    │ (Established history)
                    │
                    ▼
           ┌────────────────────┐
           │ RE-ENGAGEMENT      │
           │ (Option to return) │
           │                    │
           │ Can go directly to │
           │ ASSESSMENT_PENDING │
           │ (fast-track,       │
           │ therapist knows    │
           │ client history)    │
           └────────────────────┘


RECURRING CLIENT DAILY UPDATES (Via Cron Job)
═════════════════════════════════════════════

    Every day at 1:00 AM UTC:
    POST /api/cron/update-recurring-clients
    
    For each recurring client:
    ├─ COUNT(completed sessions)
    ├─ Calculate is_recurring (≥1 sessions)
    ├─ SUM(all payments)
    ├─ Get latest session date
    └─ UPDATE client table with new values
    
    Example progression:
    ┌──────────────────────────────────┐
    │ Session completion tracking      │
    ├──────────────────────────────────┤
    │ After S1: total_sessions = 1     │
    │ After S2: total_sessions = 2     │
    │ After S3: total_sessions = 3     │
    │ After S4: total_sessions = 4     │
    │ After S5: total_sessions = 5     │
    │ ...                              │
    │ After S10: total_sessions = 10   │
    │ (Final)                          │
    │                                  │
    │ is_recurring: TRUE throughout    │
    │ (never changes once set to TRUE) │
    └──────────────────────────────────┘


OUTCOME PATHS FOR RECURRING CLIENTS
═════════════════════════════════════════════════════════════════════

✅ MOST COMMON: Sustained Therapy
   └─→ ACTIVE (multiple sessions)
   └─→ COMPLETED (goals achieved, usually 8-12 sessions)
   └─→ Final state: COMPLETED with full treatment history

⚠️  PAUSE: Therapy interruption
   └─→ ACTIVE (multiple sessions completed)
   └─→ INACTIVE (client needs break)
   └─→ Can RESUME with existing therapist (most beneficial)
   └─→ Eventually COMPLETED when therapy ends

⚠️  EXTENDED: Long-term ongoing therapy
   └─→ ACTIVE (indefinite)
   └─→ Sessions continue 6+ months, years, or open-ended
   └─→ Maintenance/growth therapy model
   └─→ Status: ACTIVE continuously

❌ RARE: Early abandonment
   └─→ ACTIVE (has 1+ sessions)
   └─→ Client stops attending (no re-bookings)
   └─→ After 90 days: Auto-move to INACTIVE (cron job)
   └─→ Marked as recurring technically, but churned
```

---

## Side-by-Side Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│        NEW CLIENT vs. RECURRING CLIENT - SIDE-BY-SIDE WORKFLOW          │
└─────────────────────────────────────────────────────────────────────────┘


INTAKE PHASE
═══════════════════════════════════════════════════════════════════════════

    NEW CLIENT                        │  RECURRING CLIENT
    ────────────────────────────────┼──────────────────────────────
    INTAKE (is_recurring: FALSE)     │  INTAKE (is_recurring: FALSE)
         │                           │       │
         │ Days 1-3                  │       │ Days 1-3
         │                           │       │
         ▼                           │       ▼
    ASSESSMENT_PENDING              │  ASSESSMENT_PENDING
    (is_recurring: FALSE)            │  (is_recurring: FALSE)
         │                           │       │
         │ Days 4-7                  │       │ Days 4-7
         │                           │       │
         ▼                           │       ▼
    READY_FOR_BOOKING               │  READY_FOR_BOOKING
    (is_recurring: FALSE)            │  (is_recurring: FALSE)
         │                           │       │
         │ Days 8-14                 │       │ Days 8-14
         │                           │       │
         ▼                           │       ▼
    BOOKING_SCHEDULED               │  BOOKING_SCHEDULED
    (is_recurring: FALSE)            │  (is_recurring: FALSE)
         │                           │       │
         │ Payment check             │       │ Payment check
         │                           │       │
    (Optional: PAYMENT_PENDING)      │  (Optional: PAYMENT_PENDING)
         │                           │       │
         └─────────┬─────────────────┼───────┘
                   │                 │
                   │ Days 15-21      │
                   │                 │
                   ▼                 │
            ACTIVE (S1 occurs)       │
            (is_recurring: FALSE)    │
                   │                 │
                   │ Session marked  │
                   │ complete        │
                   │                 │
                   ▼                 │
        ⏰ CRON JOB RUNS (Day 16) ⏰ │
        Detects: 1 session ✓         │
        Updates: is_recurring        │
                = TRUE ✅            │
                   │                 │
                   ▼                 │
            ┏━━━━━━━━━━━━━━━━━┓     │
            ┃ NOW RECURRING 🔄┃     │
            ┃ (Transition!)   ┃     │
            ┗━━━━━━━━━━━━━━━━━┛     │
                                    │


THERAPY PHASE
═══════════════════════════════════════════════════════════════════════════

NEW CLIENT (Just became recurring)   │  RECURRING CLIENT (Established)
────────────────────────────────────┼────────────────────────────
ACTIVE (Session 1 complete)         │  ACTIVE (Sessions 2+ ongoing)
is_recurring: TRUE (just changed)   │  is_recurring: TRUE (confirmed)
Sessions: 1                         │  Sessions: 2, 3, 4... 10+
                                    │
Comfort level: UNCERTAIN            │  Comfort level: HIGH
     ↓                              │       ↓
Will client continue?               │  Will client continue?
(HIGH RISK)                         │  (LOW RISK)
                                    │
Possible outcomes:                  │  Likely outcomes:
├─ YES (continue) ← leads to        │  ├─ YES (continue)
│  recurring                        │  │  ↓
│  ↓                                │  ├─ Multiple sessions
├─ NO (stop)                        │  │  (progress tracking)
│  ↓ (still tech. recurring, but    │  │
│  never returns)                   │  ├─ Therapy endpoints
├─ MAYBE (pause) → INACTIVE         │  │  reached
                                    │  │  ↓
CRITICAL: First 2 weeks are         │  │ COMPLETED (goals met)
make-or-break                       │  │
                                    │  ├─ OR pause → INACTIVE
                                    │  │
                                    │  └─ OR continue long-term
                                    │
                                    │  CONFIDENT: Regular schedule
                                    │  High retention expected


SESSION PROGRESSION
═══════════════════════════════════════════════════════════════════════════

NEW CLIENT                          │  RECURRING CLIENT
────────────────────────────────────┼────────────────────────────
Session 1 (first time, nervous)     │  Session 2-5 (pattern forming)
 │                                  │   │
 │ Next session: UNCERTAIN          │   │ Next session: SCHEDULED
 │ (Will they book?)                │   │ (Already on calendar)
 │                                  │   │
 └─ Risk: 40-50% don't return       │   └─ Risk: <10% don't return
                                    │
Session 1+ (if continuing)          │  Session 6-10+ (established)
 │                                  │   │
 │ Therapist worried: Will client   │   │ Therapist focused: Progress
 │ keep showing up?                 │   │ toward therapeutic goals
 │                                  │   │
 └─ Rapport still building          │   └─ Relationship well-established


DAILY CRON JOB IMPACT
═════════════════════════════════════════════════════════════════════════════

NEW CLIENT (Before transition)      │  RECURRING CLIENT (After transition)
────────────────────────────────────┼────────────────────────────────────
Cron runs daily                     │  Cron runs daily
 │                                 │   │
 └─ Watches for: 1st completion    │   └─ Updates: Session count, payments
    ├─ If found → is_recurring     │      total_sessions: 1→2→3→...10+
    │            = TRUE            │      total_paid: $150→300→450...→1500
    │ TRANSITION DAY!              │      last_session: Updated
    └─ If not yet → no change      │      is_recurring: TRUE (maintained)


FAILURE MODES
═════════════════════════════════════════════════════════════════════════════

NEW CLIENT Risks                    │  RECURRING CLIENT Risks
────────────────────────────────────┼────────────────────────────────────
1. Drops during INTAKE              │  1. No-show (rare, low probability)
   └─ Never reaches therapy         │     └─ Auto-move to INACTIVE after 90d
                                    │
2. Cancels BOOKING_SCHEDULED        │  2. Pauses mid-therapy
   └─ BOOKING_EXPIRED              │     └─ INACTIVE (can resume)
                                    │
3. No-shows Session 1              │  3. Therapy ends early
   └─ BOOKING_EXPIRED              │     └─ COMPLETED (less common)
                                    │
4. Shows to S1 but quits           │  4. Life interruption (rare)
   └─ Stops after first session    │     └─ INACTIVE then resumes
   └─ High dropout rate            │
                                    │
5. Financial barriers              │  5. Insurance changes
   └─ Can't afford continuation    │     └─ Payment structure changes


METRICS TO TRACK
═════════════════════════════════════════════════════════════════════════════

NEW CLIENT → RECURRING CONVERSION   │  RECURRING CLIENT RETENTION
────────────────────────────────────┼────────────────────────────
Metric: "New to Recurring Rate"     │  Metric: "Session Completion Rate"
                                    │
Track:                              │  Track:
├─ % of intakes that reach S1      │  ├─ % completing planned sessions
├─ % completing Session 1          │  ├─ % staying in ACTIVE >8 weeks
├─ % moving to is_recurring=TRUE   │  ├─ % reaching COMPLETED
├─ Days from intake to recurring   │  ├─ Average session count
│                                  │  ├─ Revenue per recurring client
Baseline: ~60-70% make it to S1    │  └─ Churn rate (move to INACTIVE)
Goal: Convert as many to           │
recurring as possible              │  Baseline: 80%+ retention after S2
(HIGH VALUE = retention!)          │  Goal: 90%+ complete treatment
```

---

## Status Transition Matrix

```
┌─────────────────────────────────────────────────────────────────────────┐
│           STATUS TRANSITION MATRIX - ALL VALID TRANSITIONS              │
│  (✓ = allowed, ✗ = not allowed, is_recurring flag shown for each)     │
└─────────────────────────────────────────────────────────────────────────┘


FROM STATE     │ TO STATE              │ is_rec  │ Condition/Notes
───────────────┼──────────────────────┼─────────┼─────────────────────────
INTAKE         │ ASSESSMENT_PENDING    │ ✗→✗     │ Clinician ready to assess
               │ INTAKE (stay)         │ ✗→✗     │ Request more info
               │ INACTIVE              │ ✗→✗     │ Not ready, decline
               │ ✗ BOOKING_SCHEDULED   │ ✗       │ Invalid (no assessment)
               │ ✗ ACTIVE              │ ✗       │ Invalid (skip assessment)
───────────────┼──────────────────────┼─────────┼─────────────────────────
ASSESSMENT_    │ READY_FOR_BOOKING     │ ✗→✗     │ Assessment complete,
PENDING        │                       │         │ client suitable
               │ INACTIVE              │ ✗→✗     │ Not suitable, referred
               │ ACTIVE                │ ✗→✓     │ RARE: Crisis intervention
               │ ASSESSMENT_PENDING    │ ✗→✗     │ Continue assessing
               │ ✗ COMPLETED           │ ✗       │ Invalid (no therapy yet)
───────────────┼──────────────────────┼─────────┼─────────────────────────
READY_FOR_     │ BOOKING_SCHEDULED     │ ✗→✗     │ Client books appointment
BOOKING        │ INACTIVE              │ ✗→✗     │ Client delays/hesitant
               │ READY_FOR_BOOKING     │ ✗→✗     │ Wait for client decision
               │ ✗ ACTIVE              │ ✗       │ Invalid (must book first)
───────────────┼──────────────────────┼─────────┼─────────────────────────
BOOKING_       │ PAYMENT_PENDING       │ ✗→✗     │ Prepayment required
SCHEDULED      │ ACTIVE                │ ✗→✓     │ No prepay, session starts
               │ INACTIVE              │ ✗→✗     │ Client cancels
               │ BOOKING_EXPIRED       │ ✗→✗     │ Appointment missed
               │ BOOKING_SCHEDULED     │ ✗→✗     │ Rescheduled (rare)
               │ ✗ COMPLETED           │ ✗       │ Invalid (session not done)
───────────────┼──────────────────────┼─────────┼─────────────────────────
PAYMENT_       │ ACTIVE                │ ✗→✓     │ Payment received
PENDING        │ BOOKING_EXPIRED       │ ✗→✗     │ Deadline passed
               │ INACTIVE              │ ✗→✗     │ Client cancels
               │ PAYMENT_PENDING       │ ✗→✗     │ Resend payment request
               │ ✗ BOOKING_SCHEDULED   │ ✗       │ Invalid (payment first)
───────────────┼──────────────────────┼─────────┼─────────────────────────
ACTIVE         │ ACTIVE (continue)     │ ✓→✓     │ Next session occurs
               │ COMPLETED             │ ✓→✓     │ Therapy ended, goals met
               │ INACTIVE              │ ✓→✓     │ Client pause/break
               │ ✗ INTAKE              │ ✓       │ Invalid (cannot reverse)
               │ ✗ ASSESSMENT_PENDING  │ ✓       │ Invalid (assessment done)
───────────────┼──────────────────────┼─────────┼─────────────────────────
COMPLETED      │ INACTIVE              │ ✓→✓     │ RARE: Preserve option
               │ ASSESSMENT_PENDING    │ ✓→✓     │ RARE: Return + reassess
               │ COMPLETED (stay)      │ ✓→✓     │ Final state usually
               │ ✗ ACTIVE              │ ✓       │ Invalid (therapy ended)
───────────────┼──────────────────────┼─────────┼─────────────────────────
INACTIVE       │ ASSESSMENT_PENDING    │ ✓→✓     │ Resume, quick reassess
               │ ACTIVE                │ ✓→✓     │ Resume existing therapy
               │ COMPLETED             │ ✓→✓     │ Decide not to continue
               │ INACTIVE (stay)       │ ✓→✓     │ Remain paused
               │ ✗ INTAKE              │ ✓       │ Invalid (restart as new)
───────────────┼──────────────────────┼─────────┼─────────────────────────
BOOKING_       │ BOOKING_SCHEDULED     │ ✗→✗     │ Rebook new appointment
EXPIRED        │ INACTIVE              │ ✗→✗     │ No response, move to hold
               │ COMPLETED             │ ✗→✗     │ Give up on therapy
               │ BOOKING_EXPIRED       │ ✗→✗     │ Remain expired
               │ ✗ ASSESSMENT_PENDING  │ ✗       │ Invalid (must rebook)


LEGEND:
✗→✗   = is_recurring stays FALSE
✓→✓   = is_recurring stays TRUE
✗→✓   = is_recurring changes FALSE to TRUE (transition point)
✓→✗   = Never happens (once TRUE, always TRUE)
✗     = Invalid transition, not allowed by API


CRITICAL RULES:
═══════════════════════════════════════════════════════════════════════════

1. FORWARD ONLY (mostly)
   ├─ Intake → Assessment → Ready → Booking → Active → Completed
   └─ Cannot go backwards except: Inactive ↔ Active/Assessment

2. is_recurring NEVER DECREASES
   ├─ Once set to TRUE (after 1st session)
   ├─ Always remains TRUE
   └─ Cannot go back to FALSE

3. DEAD STATES (from which no forward transition)
   ├─ COMPLETED (usually final, unless re-engagement)
   ├─ BOOKING_EXPIRED (requires manual recovery)
   └─ INACTIVE (can be resumed, but stuck if abandoned)

4. AUTOMATIC TRANSITIONS (via Cron)
   ├─ is_recurring: FALSE → TRUE (after 1st session completion)
   ├─ ACTIVE → INACTIVE (after 90 days no activity)
   └─ All updates to total_sessions_completed daily
```

---

## Timeline Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TIMELINE: NEW vs. RECURRING CLIENT                   │
│         (Typical durations and progression through states)              │
└─────────────────────────────────────────────────────────────────────────┘


NEW CLIENT TIMELINE
═════════════════════════════════════════════════════════════════════════

Week 0 (Days 1-3)
├─ INTAKE submitted
│  └─ Client fills form (30 min)
│  └─ is_recurring: FALSE
│  └─ Sessions: 0
│
└─ Clinic receives intake
   └─ Queued for review

Week 0 (Days 4-7)
├─ ASSESSMENT_PENDING scheduled
│  └─ Admin contacts client (booking call)
│  └─ Appointment scheduled: Week 1, Thursday 2 PM
│  └─ is_recurring: FALSE
│  └─ Sessions: 0
│
└─ CRITICAL PERIOD: Client waits for assessment
   └─ Some may lose interest, decline, or ask questions

Week 1 (Days 8-14)
├─ READY_FOR_BOOKING
│  └─ Assessment happens (Thursday 2 PM)
│  └─ Clinician approves client for therapy
│  └─ Therapist assigned: Dr. Sarah
│  └─ is_recurring: FALSE
│  └─ Sessions: 0
│
└─ Client must decide: Book first session?
   └─ Days 8-12: Client hesitates? May never rebook
   └─ Days 13-14: First session scheduled

Week 2 (Days 15-21)
├─ BOOKING_SCHEDULED
│  └─ First appointment: Tuesday 2 PM
│  └─ is_recurring: FALSE
│  └─ Sessions: 0
│
├─ SESSION 1 OCCURS (Tuesday 2 PM)
│  ├─ Session starts
│  ├─ Rapport building (60 min)
│  ├─ Post-session marked complete
│  ├─ is_recurring: FALSE (still! waiting for cron)
│  └─ Sessions: 0 formally (counted after cron)
│
└─ CRITICAL DECISION POINT: Will client return?
   └─ Days 15-20: Client hesitates about S2
   └─ Day 21: Therapist calls, confirms next appointment

WEEK 2 NIGHT (1 AM UTC, Day 16)
╔═══════════════════════════════════════════════════════╗
║ CRON JOB RUNS: update-recurring-clients              ║
║ ─────────────────────────────────────────────────── ║
║ Detects: Client has 1 completed session ✓             ║
║ Updates: is_recurring = FALSE → TRUE ✅              ║
║ Result: CLIENT NOW RECURRING 🔄                      ║
╚═══════════════════════════════════════════════════════╝

Week 3+ (Days 22+)
├─ ACTIVE (Now Recurring)
│  ├─ is_recurring: TRUE
│  ├─ Sessions: 1 (cron counted)
│  ├─ Session 2 scheduled: Next Tuesday 2 PM
│  └─ Pattern established: Weekly Tuesdays
│
└─ Decision branches:
   ├─ Client continues → Pattern locked in (best case)
   │  └─ Regular therapy begins
   │  └─ Multiple sessions expected
   │
   ├─ Client hesitates about S2
   │  └─ Still marked RECURRING (1 session done)
   │  └─ But may never show for S2 (churn)
   │
   └─ Client cancels S2
      └─ Status: INACTIVE
      └─ Still technically recurring (1 session = true)
      └─ Opportunity lost


TOTAL TIME NEW → RECURRING: 2-3 WEEKS
═════════════════════════════════════════════════════════════════════


RECURRING CLIENT TIMELINE
═════════════════════════════════════════════════════════════════════

Week 0-2: (Same as NEW client above)
├─ INTAKE
├─ ASSESSMENT_PENDING
├─ READY_FOR_BOOKING
├─ BOOKING_SCHEDULED
└─ Session 1 occurs
   └─ Becomes RECURRING after cron runs

Week 3-5: ESTABLISHING PATTERN
├─ Session 2: Week 3 Tuesday 2 PM
│  └─ Rapport solidified
│  └─ Cron: Sessions now = 2
│
├─ Session 3: Week 4 Tuesday 2 PM
│  └─ Client: "This is my routine now"
│  └─ Cron: Sessions now = 3
│
└─ Session 4: Week 5 Tuesday 2 PM
   └─ Pattern: Locked in
   └─ Cron: Sessions now = 4
   └─ Client comfort: HIGH

Week 6-10: SUSTAINED THERAPY
├─ Sessions 5-9 occur weekly
│  ├─ Client progress: Visible
│  ├─ Therapist notes: "Good therapeutic gains"
│  ├─ Cron updates daily: Sessions 5 → 6 → 7 → 8 → 9
│  └─ Client: Committed, invested
│
└─ Total paid: $750 (5 × $150)

Week 11-12: APPROACHING COMPLETION
├─ Sessions 10-11
│  ├─ Therapist: "We're nearing completion"
│  ├─ Client: "I'm feeling so much better"
│  ├─ Cron: Sessions 10, 11
│  └─ Total paid: $1,650 (11 × $150)
│
└─ Final session planning begins

Week 13: COMPLETION
├─ Final session: Tuesday 2 PM (Session 12)
│  ├─ Discharge planning
│  ├─ Relapse prevention
│  ├─ Referrals provided
│  └─ Cron: Sessions 12 (final)
│
└─ Status: ACTIVE → COMPLETED
   ├─ is_recurring: TRUE (preserved)
   ├─ total_sessions_completed: 12
   ├─ total_amount_paid: $1,800
   └─ Final state: COMPLETED


OUTCOMES TIMELINE:
═════════════════════════════════════════════════════════════════════

Best case: Week 13-16 COMPLETED
├─ Therapy goals achieved
├─ Client confident and independent
├─ Full treatment course completed
└─ Success metric: High satisfaction

Pause case: Week 8 INACTIVE
├─ Client needs break (financial, life event)
├─ After 3-4 sessions completed
├─ Sessions: 4 (preserved)
├─ Can resume later (existing therapist)
└─ Not abandoned, just paused

Ongoing case: Week 20+ ACTIVE (continued)
├─ Sessions continue beyond initial plan
├─ Client: Maintenance or growth therapy
├─ Sessions: 15, 16, 17... (ongoing)
├─ Therapy indefinite or until goals expand
└─ Recurring indefinitely


CRITICAL TIME WINDOWS:
═════════════════════════════════════════════════════════════════════

NEW CLIENT ATTRITION RISK (Highest risk windows):
├─ Days 4-7 (assessment wait): "Why is this taking long?"
├─ Days 8-14 (pre-first session): "Am I really ready?"
├─ Days 15-21 (after Session 1): "Will I go back?" ← PEAK RISK
├─ Week 3 decision (Session 2): "Is therapy working?"
└─ Weeks 4-6: Natural drop-off if no progress shown

RECURRING CLIENT ATTRITION RISK (Lower):
├─ Weeks 2-3: Adjustment phase (low risk)
├─ Weeks 4-5: Established, low risk
├─ Weeks 6+: Low risk (invested in process)
├─ Weeks 12+: Plan-dependent (completion vs. ongoing)
└─ Risk increases again after 90 days no activity
   (Cron auto-moves to INACTIVE)
```

---

## Decision Tree Flowcharts

```
┌─────────────────────────────────────────────────────────────────────────┐
│              DECISION TREES: What Path Will Client Take?               │
└─────────────────────────────────────────────────────────────────────────┘


DECISION TREE 1: NEW CLIENT - WILL THEY BECOME RECURRING?
═════════════════════════════════════════════════════════════════════════

START: Client submits intake form
   │
   ├─ Decision 1: Does client complete intake form?
   │  ├─ YES → Proceed
   │  └─ NO → Lost (never entered system)
   │
   ├─ Decision 2: Does clinician schedule assessment?
   │  ├─ YES → Proceed to ASSESSMENT_PENDING
   │  └─ NO → INACTIVE (no assessment planned)
   │
   ├─ Decision 3: Does client attend assessment?
   │  ├─ YES → Assessment occurs
   │  └─ NO → BOOKING_EXPIRED (no-show)
   │
   ├─ Decision 4: Does clinician approve client?
   │  ├─ YES → READY_FOR_BOOKING
   │  └─ NO → INACTIVE (not suitable)
   │
   ├─ Decision 5: Does client book first session?
   │  ├─ YES → BOOKING_SCHEDULED
   │  └─ NO → INACTIVE (never booked)
   │
   ├─ Decision 6: Does client attend Session 1?
   │  ├─ YES → Session occurs, ACTIVE
   │  └─ NO → BOOKING_EXPIRED (no-show)
   │
   ├─ Decision 7: Does therapist mark session complete?
   │  ├─ YES → Proceed
   │  └─ NO → Session abandoned (rare)
   │
   ├─ Decision 8: CRON JOB RUNS (automatic, Day 16 at 1 AM)
   │  └─ Detects 1 completed session
   │  └─ Sets: is_recurring = TRUE ✓
   │  └─ CLIENT NOW RECURRING 🔄
   │
   └─ Decision 9 (CRITICAL): Does client return for Session 2?
      ├─ YES → Pattern established, RECURRING therapy begins
      │  └─ Sessions continue, is_recurring stays TRUE
      │  └─ Success outcome likely
      │
      └─ NO → Client stops (churned, despite being "recurring")
         └─ Status: INACTIVE (no activity)
         └─ is_recurring: TRUE (technically, but abandoned)


ATTRITION FUNNEL:
────────────────────────────────────────────────────────────
100 clients submit intake
 ├─ 95 complete intake (5 drop)
 │
 ├─ 85 scheduled for assessment (10 don't schedule)
 │
 ├─ 80 attend assessment (5 no-show)
 │
 ├─ 70 approved for therapy (10 not suitable)
 │
 ├─ 60 book Session 1 (10 never book)
 │
 ├─ 55 attend Session 1 (5 no-show)
 │
 ├─ 50 complete Session 1 (5 abandoned mid-session)
 │
 ├─ 50 marked RECURRING after cron ✓
 │
 └─ 40 return for Session 2 (10 churn after 1st)
    └─ TRUE RETENTION RATE: 40% (40 out of 100 original)


DECISION TREE 2: RECURRING CLIENT - WHAT'S THE THERAPY OUTCOME?
═════════════════════════════════════════════════════════════════════════

START: Client now in ACTIVE status (is_recurring: TRUE)
   │
   ├─ Decision 1: Does client complete Session 2?
   │  ├─ YES → Pattern likely to continue
   │  └─ NO → INACTIVE (churned despite 1 session)
   │
   ├─ Decision 2: Is client showing progress?
   │  ├─ YES → Continue therapy
   │  └─ NO → Therapist reassesses approach
   │
   ├─ Decision 3: Will therapy continue as planned?
   │  ├─ YES → Regular sessions continue
   │  └─ NO → Pause/change approach
   │
   ├─ Decision 4 (Sessions 6-8): Is client committed?
   │  ├─ YES → Likely to complete treatment
   │  └─ NO → May pause (INACTIVE)
   │
   ├─ Decision 5 (Session 8-10): Are goals being achieved?
   │  │
   │  ├─ YES → Therapy appears successful
   │  │  ├─ Decision: Complete now or continue?
   │  │  │  ├─ Complete → COMPLETED
   │  │  │  └─ Continue → Extended therapy
   │  │  │     └─ Sessions 13, 14, 15, ... onward
   │  │  │     └─ Open-ended ongoing
   │  │  │
   │  │  └─ OUTCOME: ✅ SUCCESSFUL THERAPY
   │  │
   │  └─ NO → Reassess treatment plan
   │     ├─ Modify approach → Continue
   │     └─ Refer elsewhere → May move to INACTIVE
   │
   └─ Decision 6 (At any point): Life circumstances change?
      ├─ Financial hardship → INACTIVE (pause)
      ├─ Schedule conflict → INACTIVE (reschedule)
      ├─ Personal crisis → May intensify therapy
      └─ Major life event → INACTIVE (temporary)


OUTCOME DISTRIBUTION (100 recurring clients):
───────────────────────────────────────────────
 70 Complete full therapy (8-12 sessions)
    └─ COMPLETED (success)
 
 15 Pause temporarily (4-5 sessions)
    └─ INACTIVE (can resume later)
    └─ Of these: 8 resume, 7 abandon
 
 10 Go long-term (15+ sessions ongoing)
    └─ ACTIVE indefinite
    └─ Maintenance or growth therapy
 
  5 Stop early (2-3 sessions)
    └─ COMPLETED early or INACTIVE
    └─ Not therapeutic fit discovered


DECISION TREE 3: INTAKE DECISION - NEW or RECURRING PATH?
═════════════════════════════════════════════════════════════════════════

All clients start here:

CLIENT SUBMITS INTAKE
    │
    ├─ Question: What happens next?
    │
    └─ Answer depends on clinic behavior & client commitment
       │
       BOTH paths start identically:
       INTAKE → ASSESSMENT_PENDING → READY_FOR_BOOKING
                        → BOOKING_SCHEDULED
                        → SESSION 1 → ACTIVE
       │
       ├─ DIVERGENCE POINT: Session 1 completion
       │
       ├─ Path A: Client completes S1, commits to S2+
       │  └─ is_recurring = TRUE (after cron)
       │  └─ Sessions: 2, 3, 4, 5... (ongoing)
       │  └─ Expected outcome: 8-12 sessions, COMPLETED
       │  └─ Revenue: $1,200-$1,800 per client
       │
       ├─ Path B: Client completes S1, never returns
       │  └─ is_recurring = TRUE (technically, 1 session done)
       │  └─ Status: INACTIVE (no re-bookings)
       │  └─ Revenue: $150 (one session only)
       │  └─ Churn outcome
       │
       └─ Path C: Client never reaches S1
          └─ is_recurring = FALSE (never completes session)
          └─ Status: BOOKING_EXPIRED or INACTIVE
          └─ Revenue: $0
          └─ Acquisition cost wasted


SUCCESS METRIC:
───────────────────────────────────────────
Clinic goal: Maximize Path A (recurring, completes therapy)

Success = (Path A clients / Total clients) × 100%

Baseline: ~40-50% of new intakes become true recurring clients
Target: ~60-70% (with good retention practices)

Key interventions to improve Path A → Recurring:
├─ Better therapist matching
├─ Strong Session 1 rapport building
├─ Clear goal setting after Session 1
├─ Quick confirmation of Session 2 before client leaves
└─ Follow-up call if any hesitation detected
```

---

**Document Complete**

**Diagrams Included:**
1. ✅ Combined overview (shows transition point)
2. ✅ New client detailed workflow (with decision points)
3. ✅ Recurring client detailed workflow (multi-week progression)
4. ✅ Side-by-side comparison (statuses, risks, outcomes)
5. ✅ Status transition matrix (all valid transitions)
6. ✅ Timeline comparison (durations and critical windows)
7. ✅ Decision tree flowcharts (attrition funnel, outcomes)

**Last Updated:** 2026-06-14
