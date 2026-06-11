# Phase 4 & 5: Clinical Operations — Complete Design Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an integrated clinical operations system enabling therapist scheduling, patient intake, appointment booking with proper payment handling, treatment tracking, and comprehensive client management.

**Architecture:** Backend-driven with client scheduling at API layer, frontend provides intuitive booking interface and client profile management. Multi-clinic, multi-therapist support with proper payment validation and financial tracking.

**Tech Stack:** Next.js 14, React, TypeScript, Supabase (PostgreSQL), 3-layer CSS architecture

---

## Client Status Flow (Complete)

**New Client → No Referred Therapist:**
```
Intake Completed → Pending Assessment → Ready for Booking → Booking Scheduled → Payment Pending → Payment Confirmed/Active → [sessions] → Completed
```

**New Client → With Referred Therapist:**
```
Intake Completed → Ready for Booking → Booking Scheduled → Payment Pending → Payment Confirmed/Active → [sessions] → Completed
```

**Recurring Client (has completed ≥1 session):**
```
Booking Scheduled → Payment Pending → Payment Confirmed/Active → [more sessions] → Completed
```

**Failure Paths:**
- Booking Scheduled → [no payment in 24h] → Booking Expired
- Active → [90+ days idle] → Inactive

---

## Database Design (Extended)

### New/Extended Tables

**1. therapist_availability**
```sql
CREATE TABLE therapist_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id BIGINT NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL (Mon-Sun),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'working' (working, vacation, off),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_therapist_availability_therapist_clinic ON therapist_availability(therapist_id, clinic_id);
CREATE INDEX idx_therapist_availability_day ON therapist_availability(day_of_week);
```

**2. therapist_specializations** (NEW)
```sql
CREATE TABLE therapist_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id BIGINT NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('single', 'group', 'couple')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_therapist_specializations_therapist ON therapist_specializations(therapist_id);
```

**3. clinic_rooms** (NEW)
```sql
CREATE TABLE clinic_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  room_name VARCHAR(100) NOT NULL,
  room_type VARCHAR(50) DEFAULT 'standard',
  capacity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clinic_rooms_clinic ON clinic_rooms(clinic_id);
```

**4. bookings** (EXTEND)
```sql
-- Add columns to existing bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS:
  - payment_status VARCHAR(20) DEFAULT 'pending' (pending, paid, refunded, charged, cancelled)
  - payment_date TIMESTAMPTZ
  - payment_amount DECIMAL(10,2) DEFAULT 2000
  - actual_cost DECIMAL(10,2)
  - refund_amount DECIMAL(10,2)
  - additional_charge DECIMAL(10,2)
  - charge_status VARCHAR(20) DEFAULT 'pending' (pending, collected)
  - room_id UUID REFERENCES clinic_rooms(id) ON DELETE SET NULL
  - session_type VARCHAR(50) NOT NULL DEFAULT 'single' (single, group, couple)
  - booking_status VARCHAR(50) DEFAULT 'scheduled' (scheduled, confirmed, completed, cancelled, expired)
  - cancelled_by_user_id UUID REFERENCES clinic_users(id) ON DELETE SET NULL
  - cancellation_reason TEXT
  - cancelled_at TIMESTAMPTZ
  - payment_deadline TIMESTAMPTZ
  - marked_paid_by_user_id UUID REFERENCES clinic_users(id) ON DELETE SET NULL
  - marked_paid_at TIMESTAMPTZ

CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_payment_deadline ON bookings(payment_deadline);
CREATE INDEX idx_bookings_booking_status ON bookings(booking_status);
```

**5. session_notes** (NEW - only if not already in assessments)
```sql
CREATE TABLE session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  therapist_id BIGINT NOT NULL REFERENCES therapists(id) ON DELETE SET NULL,
  notes TEXT NOT NULL,
  session_outcome TEXT,
  progress_score INT CHECK (progress_score >= 1 AND progress_score <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_session_notes_booking ON session_notes(booking_id);
CREATE INDEX idx_session_notes_therapist ON session_notes(therapist_id);
```

**6. payment_records** (NEW - for financial tracking)
```sql
CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  therapist_id BIGINT NOT NULL REFERENCES therapists(id) ON DELETE SET NULL,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE SET NULL,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 2000,
  actual_cost DECIMAL(10,2) NOT NULL,
  refund_amount DECIMAL(10,2),
  additional_charge DECIMAL(10,2),
  charge_status VARCHAR(20) DEFAULT 'pending',
  payment_date TIMESTAMPTZ NOT NULL,
  marked_by_user_id UUID NOT NULL REFERENCES clinic_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payment_records_booking ON payment_records(booking_id);
CREATE INDEX idx_payment_records_client ON payment_records(client_id);
CREATE INDEX idx_payment_records_payment_date ON payment_records(payment_date);
```

**7. client_status_history** (NEW - for audit trail)
```sql
CREATE TABLE client_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by_user_id UUID REFERENCES clinic_users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_client_status_history_client ON client_status_history(client_id);
```

### Data Model: Client Categorization

```sql
-- Add column to clients table to identify recurring vs new
ALTER TABLE clients ADD COLUMN IF NOT EXISTS:
  - is_recurring BOOLEAN DEFAULT false (true if completed ≥1 session)
  - status VARCHAR(50) DEFAULT 'intake' (intake, assessment_pending, ready_for_booking, booking_scheduled, payment_pending, active, completed, inactive, booking_expired)
  - last_session_date TIMESTAMPTZ
  - total_sessions_completed INT DEFAULT 0
  - total_amount_paid DECIMAL(10,2) DEFAULT 0
  - client_since TIMESTAMPTZ DEFAULT now()

CREATE INDEX idx_clients_is_recurring ON clients(is_recurring);
CREATE INDEX idx_clients_status ON clients(status);
```

---

## Phase 4: Clinical Scheduling

### Features & Scope

**A. Therapist Schedule Management (Admin)**
- View therapists across all clinics
- Set working hours per clinic (hours + days)
- Mark days off, vacation periods
- Assign session types handled by each therapist (single/group/couple)
- View current availability and workload

**B. Available Slots Calculation**
Show slots based on:
- Therapist availability ✓ (working hours, not on vacation)
- Room availability ✓ (not booked at that time)
- Session type match ✓ (therapist handles that type)
- Capacity constraints (clinic room limits)

**C. Booking Flow (Reception Staff)**
1. After intake form filled (or assessment done):
   - Receptionist views available slots
   - Filters: therapist, clinic, date range, time, session type
   - Selects slot for client
   - System shows cost breakdown
2. Confirms with client on phone call
3. Creates booking in system
4. Generates payment link/instructions
5. Sets 24-hour payment deadline

**D. Payment Handling**
- Client pays externally (Instapay, bank, etc.)
- Receptionist manually marks "Payment Received"
- System calculates actual cost vs. 2,000 EGP
- Records refund/charge if different
- Status changes to "Payment Confirmed/Active"

**E. Automatic Slot Release**
- 24 hours before session: check if payment received
- If NO → Release slot, set status to "Booking Expired"
- Recurring clients get priority if slot becomes available

---

## Phase 5: Patient Management

### Features & Scope

**A. Intake Form (New Clients)**
- Digital form filled by receptionist during phone call
- Fields: name, phone, age, gender, language, concern, referral, preferences, notes
- Stored with timestamp and status: "Intake Completed"

**B. Assessment Tracking**
- Flag if assessment pending (new client, no referred therapist)
- Receptionist logs assessment result when received:
  - Assessment date
  - Assigned therapist (from "Sama's" assessment)
  - Assessment notes (optional)
- Status moves to "Ready for Booking"

**C. Treatment History & Session Tracking**
- Client profile shows:
  - All completed sessions (with dates, therapist, notes)
  - All upcoming bookings
  - Session history with therapist notes
  - Progress/outcome tracking

**D. Session Notes (Therapist)**
- After each session, therapist logs:
  - Session notes/observations
  - Progress assessment
  - Optional: outcome score
- Notes visible to other therapists in client's profile

**E. Client Discharge**
- Therapist marks "Completed" when treatment done
- Final outcome recorded
- Client status: "Completed"
- Can still view full session history

**F. Client Profile Screen**
Tabs:
1. **Information:** Contact info, intake details, therapist info, notes, quick stats
2. **Sessions:** All past sessions with dates, therapist, notes, outcomes
3. **Bookings:** Booking history (completed, cancelled, upcoming)
4. **Payments:** Payment history, refunds, charges
5. **Notes & History:** Status changes, cancellation history

---

## Booking Status & Cancellation

### Booking Lifecycle

```
Scheduled → [24h deadline] → Confirmed → [session happens] → Completed
                           ↓
                      [no payment] → Expired (slot released)
                      [cancelled] → Cancelled (optional reason, slot released)
```

### Cancellation Flow

1. **Initiate:** Click "Cancel Booking" button on confirmation
2. **Confirm:** Modal asks to confirm with optional reason
3. **Process:** 
   - Slot released immediately (available for other clients)
   - Payment marked as "cancelled"
   - If already paid, refund queued
   - Client notification queued (send later, not immediately)
4. **Result:** Booking status = "Cancelled", visible in booking history

### Auto-Cancel (Expired) Flow

- Cron job runs 24 hours before session
- If `booking_status = 'scheduled'` AND `payment_status = 'pending'`:
  - Set `booking_status = 'expired'`
  - Release room slot
  - Mark in booking history

---

## Recurring Client Indicator

### What Shows Where

1. **Dashboard (Client List):**
   - Blue "🔄 Recurring (X sessions)" badge next to recurring clients
   - Green background for active recurring clients
   - Shows if completed ≥1 session

2. **Client Detail Page:**
   - "🔄 Recurring" badge in header
   - Shows total sessions completed, total paid, since date

3. **Booking Logic:**
   - Recurring clients get priority if slot becomes available after cancellation
   - Skip assessment step (go straight to booking)

---

## API Endpoints (New & Modified)

### Therapist Schedule
- `GET /api/admin/therapists/[id]/availability?clinic_id=X` - Get therapist's availability
- `POST /api/admin/therapists/[id]/availability` - Set/update availability
- `PUT /api/admin/therapists/[id]/specializations` - Update session types offered

### Available Slots
- `GET /api/admin/bookings/available-slots?therapist_id=X&clinic_id=Y&date=Z&session_type=single` - Get available slots

### Bookings
- `POST /api/admin/bookings` - Create booking with 24h payment deadline
- `GET /api/admin/bookings/[id]` - Get booking details
- `PUT /api/admin/bookings/[id]/payment-received` - Mark payment received
- `DELETE /api/admin/bookings/[id]` - Cancel booking (soft delete, logs reason)
- `GET /api/admin/bookings?client_id=X` - Get client's booking history

### Session Notes (for therapist)
- `POST /api/admin/bookings/[id]/session-notes` - Add notes after session
- `GET /api/admin/bookings/[id]/session-notes` - Get session notes

### Client Profile
- `GET /api/admin/clients/[id]/profile` - Get full client profile with all tabs
- `GET /api/admin/clients/[id]/sessions` - Get completed sessions
- `GET /api/admin/clients/[id]/bookings` - Get booking history
- `GET /api/admin/clients/[id]/payments` - Get payment history
- `GET /api/admin/clients/[id]/status-history` - Get status change audit trail

### Intake & Assessment
- `POST /api/admin/clients/intake` - Create intake form submission
- `PUT /api/admin/clients/[id]/assessment` - Log assessment result
- `PUT /api/admin/clients/[id]/status` - Update client status

---

## Frontend Components & Screens

### Phase 4 Components
- **AvailableSlotsModal.tsx** - Calendar/slot picker with cost breakdown
- **TherapistScheduleManager.tsx** - Admin interface for setting availability
- **BookingConfirmation.tsx** - Confirmation screen with cancel button
- **PaymentInstructions.tsx** - Show payment details & deadline timer

### Phase 5 Components
- **IntakeForm.tsx** - Digital intake form for reception
- **ClientProfile.tsx** - Tabbed client profile screen
- **SessionNotes.tsx** - Therapist notes after session
- **ClientStatus.tsx** - Status badge showing current state

### Dashboard Updates
- **ClientList:** Add recurring badge, color-code by status
- **ClientDetail:** Add cancel button, show refund/charge status

---

## Payment Logic (Detailed)

### Calculation
```
actual_cost = (therapist.hourly_rate / 60) * session_duration_minutes
client_paid = 2000 EGP (flat)

if actual_cost < 2000:
  refund_amount = 2000 - actual_cost
  charge_status = "none"
  
if actual_cost > 2000:
  additional_charge = actual_cost - 2000
  charge_status = "pending_collection"
```

### Payment Deadline
```
booking_created_at = now()
payment_deadline = booking_created_at + 24 hours

At payment_deadline:
  if payment_status != 'paid':
    booking_status = 'expired'
    release_room_slot()
    notify_client_cancellation() // queued, not immediate
```

### Marking as Paid
```
When receptionist clicks "Mark as Paid":
  1. Set payment_status = 'paid'
  2. Set marked_paid_by_user_id = current_user
  3. Set marked_paid_at = now()
  4. Calculate actual_cost
  5. If refund: create payment_record with refund_amount
  6. If charge: create payment_record with additional_charge (status: pending_collection)
  7. Set booking_status = 'confirmed'
  8. Send confirmation to therapist
```

---

## Cancellation Details

### User-Initiated Cancel
```
receptionist clicks "Cancel Booking"
  → Modal: "Cancel this booking? (optional reason)"
  → Click "Confirm Cancellation"
  → System:
    1. Set booking_status = 'cancelled'
    2. Set cancelled_by_user_id = current_user
    3. Set cancellation_reason = user_input
    4. Set cancelled_at = now()
    5. Release room slot
    6. If payment_status = 'paid': queue refund
    7. Queue client notification (send later)
    8. Return to client list
```

### Auto-Expire (No Payment)
```
Cron job: every 15 minutes
  Find: bookings where:
    - booking_status = 'scheduled'
    - payment_status = 'pending'
    - payment_deadline <= now()
  For each:
    1. Set booking_status = 'expired'
    2. Release room slot
    3. Log in status_history
    4. Queue client notification
```

---

## Cron Jobs Required

1. **Payment Deadline Checker** (run every 15 min)
   - Find expired bookings (no payment within 24h)
   - Mark as expired, release slots, queue notifications

2. **Recurring Client Updater** (run daily)
   - For completed bookings: set `is_recurring = true`
   - Update `total_sessions_completed`, `total_amount_paid`

3. **Inactive Client Marker** (run daily)
   - Find active clients with no session for 90+ days
   - Set status = 'inactive'

---

## Multi-Clinic Support

**Data Structure:**
- Therapists linked to multiple clinics via `therapist_availability` (each clinic has separate hours)
- Rooms scoped to clinics via `clinic_id`
- Bookings must have `clinic_id` to track which clinic

**Example:**
```
Dr. Jane:
  - Mon-Tue 10am-6pm @ Clinic A (single & couple)
  - Wed-Thu 2pm-8pm @ Clinic B (single only)
  - Fri off everywhere
```

---

## Success Criteria

- ✅ Therapist availability managed across multiple clinics with clinic-specific hours
- ✅ Available booking slots calculated correctly (therapist + room + session type)
- ✅ Payment processed manually and tracked accurately
- ✅ Refunds/charges calculated correctly based on hourly rates
- ✅ Booking automatically expires if payment not received within 24 hours
- ✅ Recurring clients shown with badge, get priority on released slots
- ✅ Client statuses transition correctly through intake → assessment → booking → active
- ✅ Cancellation flow works with optional reason, immediate slot release, queued notifications
- ✅ Session notes tracked and retrievable
- ✅ Client profile shows all history (sessions, bookings, payments, status changes)
- ✅ Financial dashboard shows refunds due and charges awaiting collection
- ✅ Multi-clinic support working (therapists visible at correct clinics)
- ✅ No double-bookings of therapists or rooms
- ✅ Build succeeds, no TypeScript errors
