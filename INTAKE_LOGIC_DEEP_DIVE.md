# Intake Section Logic - Deep Dive Analysis

**Date:** 2026-06-14  
**Focus:** Intake form logic, data flow, and client journey implications

---

## Executive Summary

The intake process is the **entry point** for all new clients. It:
1. Collects essential client information via a structured form
2. Validates data on both client & server sides
3. Creates an atomic database transaction (clients + status history + audit log)
4. Initiates the client lifecycle at `status='intake'`
5. Sets the foundation for all downstream operations (assessment, booking, payment)

**Critical insight:** Only core contact fields are saved initially. Detailed clinical data (gender, language, concern) are collected but **not stored** in this phase—this is intentional design.

---

## Part 1: Frontend Logic (IntakeForm Component)

### Form Structure & State Management

**React State:**
```typescript
formData: {
  name, email, phone, date_of_birth,
  gender, language, concern, referred_by,
  preferences, intake_notes
}

loading: boolean       // Track submission in progress
error: string | null   // Display validation/API errors
success: {...}         // Show success card & redirect
```

**Key Behavioral Pattern:**
- Form displays in `list` view toggle when user clicks "New Client Intake"
- On success, it shows a success card (not a redirect page—just a card overlay)
- After 2 seconds, it auto-switches back to `list` view to show the new client

### Client-Side Validation Logic

**Validation Sequence:**

1. **Name Field (REQUIRED)**
   - Check: `!formData.name.trim()`
   - Error Message: "Name is required"
   - Blocking: YES — form won't submit

2. **Concern Field (REQUIRED)**
   - Check: `!formData.concern.trim()`
   - Error Message: "Primary concern is required"
   - Blocking: YES — form won't submit

3. **Email Field (OPTIONAL, but validated if provided)**
   - Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - Error Message: "Invalid email format"
   - Blocking: YES if email provided and invalid

4. **Date of Birth Field (OPTIONAL, but validated if provided)**
   - Check: `isNaN(new Date(formData.date_of_birth).getTime())`
   - Error Message: "Invalid date of birth"
   - Blocking: YES if date provided and invalid

5. **Other Fields (Gender, Language, Referred By, Preferences, Notes)**
   - **NO client-side validation**
   - Free-text fields
   - Never cause form submission to fail

### Critical Issue: Data Loss on Initial Save

```
COLLECTED IN FORM          |  SENT TO API       |  ACTUALLY SAVED TO DB
──────────────────────────────────────────────────────────────────
name ✓                     |  name ✓            |  clients.name ✓
email ✓                    |  email ✓           |  clients.email ✓
phone ✓                    |  phone ✓           |  clients.phone ✓
date_of_birth ✓            |  date_of_birth ✓   |  clients.date_of_birth ✓
gender ✓                   |  gender ✓          |  ❌ NOT SAVED
language ✓                 |  language ✓        |  ❌ NOT SAVED
concern ✓                  |  concern ✓         |  ❌ NOT SAVED (but sent)
referred_by ✓              |  referred_by ✓     |  clients.referral_source ✓
preferences ✓              |  preferences ✓     |  ❌ NOT SAVED
intake_notes ✓             |  intake_notes ✓    |  clients.notes ✓
```

**Why is this happening?** The API route receives all fields but only saves the core contact fields. This suggests:
- Gender, language, concern, preferences were meant to be stored elsewhere (separate form? future expansion?)
- The current design treats intake as "basic onboarding" not "full clinical intake"
- There may be a follow-up form or flow to capture detailed clinical data

---

## Part 2: Backend API Logic

### Endpoint Structure
```
POST /api/admin/clients/intake
Credentials: 'include' (sends JWT cookie)
Content-Type: application/json
```

### Authentication Gate

**Before ANY processing:**

1. Extract JWT token from cookies
2. Verify JWT signature & expiration
3. Check if user has `manage_clients` permission
4. Reject if unauthorized (401/403)
5. Extract `userId` from JWT payload for audit logging

**Response codes:**
- `401` - "No authentication token found" OR "Invalid or expired token"
- `403` - "Insufficient permissions"

### Validation Gate (Server-Side)

Runs ONLY if auth passes:

1. **Name & Concern check** (hardcoded)
   ```
   if (!name || !concern)
     return 400: "name and concern are required"
   ```

2. **Email validation** (if provided)
   ```
   if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
     return 400: "Invalid email format"
   ```

3. **Date of Birth validation** (if provided)
   ```
   if (date_of_birth) {
     const dob = new Date(date_of_birth);
     if (isNaN(dob.getTime()))
       return 400: "Invalid date_of_birth format. Must be ISO 8601."
   }
   ```

### Database Insert Logic

**Atomicity:** Both `clients` and `client_status_history` must succeed, or neither is created.

**clients table INSERT:**
```sql
INSERT INTO clients (
  name,
  email,
  phone,
  date_of_birth,
  status,              -- hardcoded as 'intake'
  client_since,        -- current timestamp
  referral_source,     -- from 'referred_by'
  notes,               -- from 'intake_notes'
  is_recurring,        -- default FALSE
  total_sessions_completed,  -- default 0
  total_amount_paid,   -- default 0.00
  created_at,
  updated_at
) VALUES (...)
```

**Critical Fields NOT Set:**
- `therapist_id` (assigned later during therapist assignment)
- `last_session_date` (set after first session)
- `gender` ❌ (collected but not saved)
- `language` ❌ (collected but not saved)
- `concern` ❌ (collected but not saved—this is the biggest gap!)
- `preferences` ❌ (collected but not saved)

**UNIQUE Constraints:**
- `email` must be unique across all clients
- `phone` must be unique across all clients
- If duplicate detected → 400: "Client with this email or phone already exists"

**client_status_history INSERT:**
```sql
INSERT INTO client_status_history (
  client_id,
  old_status,        -- NULL (first entry)
  new_status,        -- 'intake'
  changed_by_user_id,
  reason,
  created_at
) VALUES (...)
```

This creates the **first audit trail entry** for this client.

### Error Handling Strategy

**If client insert fails:**
- PostgreSQL error code 23505 (unique constraint) → 400: "Client with this email or phone already exists"
- Other errors → 500: "Failed to create client"
- **STOP processing**—status history and audit never run

**If status history insert fails:**
- Log error to console
- **DO NOT** fail the response (data already in clients table)
- Client created successfully; history missing (acceptable trade-off)

**If audit log fails:**
- Log error to console
- **DO NOT** fail the response
- Client created successfully; audit missing (acceptable trade-off)

### Response on Success

```json
{
  "success": true,
  "data": {
    "id": 42,
    "name": "John Doe",
    "status": "intake",
    "client_since": "2026-06-14T10:30:00Z"
  }
}
```

Status code: **201 Created**

---

## Part 3: Client Journey After Intake

### Immediate State (Right After Submission)

**In Database:**
- ✅ `clients` row created with `status='intake'`
- ✅ `client_status_history` row created (first entry)
- ✅ `audit_logs` entry created
- ❌ No therapist assigned yet
- ❌ No bookings created
- ❌ No payment records
- ❌ `is_recurring = false` (no sessions yet)

**In Frontend:**
- Success card shown for 2 seconds
- Client name & ID displayed
- Message: "You can now assign a therapist or schedule their first session"
- Auto-redirect to `/dashboard/clinical/clients` list

### Next Steps in Client Lifecycle

```
1️⃣ INTAKE (Just created)
   └─ Clinician reviews intake information
   └─ May request additional clinical data (gender, language, concern)
   
   ├─ Option A: Request more information
   │  └─ Client stays in 'intake' until data complete
   │
   └─ Option B: Schedule assessment
      └─ Status change to 'assessment_pending'

2️⃣ ASSESSMENT_PENDING
   └─ Clinician/therapist reviews client fit
   └─ Conducts initial clinical assessment
   
   ├─ Decision A: Not suitable
   │  └─ Status change to 'inactive' or 'completed'
   │
   └─ Decision B: Approved for therapy
      └─ Status change to 'ready_for_booking'

3️⃣ READY_FOR_BOOKING
   └─ Client available for session scheduling
   └─ Therapist can be assigned
   
   └─ Client/therapist schedule first session
      └─ Status change to 'booking_scheduled'

4️⃣ BOOKING_SCHEDULED
   └─ Session booked, awaiting payment
   └─ Status change to 'payment_pending'

5️⃣ PAYMENT_PENDING
   └─ Awaiting payment for session
   
   ├─ Payment received
   │  └─ Status change to 'active'
   │
   └─ Payment deadline missed
      └─ Status change to 'booking_expired' (dead state)

6️⃣ ACTIVE
   └─ Session conducted, client in ongoing therapy
   
   ├─ Option A: Complete (final session done)
   │  └─ Status change to 'completed'
   │
   ├─ Option B: Pause therapy
   │  └─ Status change to 'inactive'
   │
   └─ At 1 AM UTC Daily Cron Job:
      ├─ System checks: totalCompletedSessions >= 1?
      ├─ If YES → is_recurring = true ✓ (NOW RECURRING CLIENT)
      └─ If NO → is_recurring = false (still new client)
```

### The Critical Cron Job Logic

**Runs:** Daily at 1 AM UTC  
**Endpoint:** POST `/api/cron/update-recurring-clients`  
**Purpose:** Determine if client should be marked as `is_recurring`

**Logic:**
```typescript
For each client:
  1. COUNT completed bookings
  2. If totalCompletedSessions >= 1:
     - is_recurring = true
     - Update total_sessions_completed
     - Update total_amount_paid
  3. Else:
     - is_recurring = false
```

**Key Implication:** A client doesn't become "recurring" immediately after their first session. There's a ~1 day delay (until the next cron run).

---

## Part 4: Data Schema for Intake

### clients table (Fields Set During Intake)

| Field | Value | Source | Type |
|-------|-------|--------|------|
| `id` | Auto-generated | Database | BIGSERIAL |
| `name` | form.name | User input | VARCHAR(255) |
| `email` | form.email | User input | VARCHAR(255) UNIQUE |
| `phone` | form.phone | User input | VARCHAR(20) UNIQUE |
| `date_of_birth` | form.date_of_birth | User input | DATE |
| `status` | 'intake' | Hardcoded | VARCHAR(50) |
| `client_since` | NOW() | Server | TIMESTAMPTZ |
| `referral_source` | form.referred_by | User input | VARCHAR(255) |
| `notes` | form.intake_notes | User input | TEXT |
| `is_recurring` | FALSE | Default | BOOLEAN |
| `total_sessions_completed` | 0 | Default | INT |
| `total_amount_paid` | 0.00 | Default | DECIMAL(10,2) |
| `created_at` | NOW() | Server | TIMESTAMPTZ |
| `updated_at` | NOW() | Server | TIMESTAMPTZ |

### client_status_history table (First Entry)

| Field | Value |
|-------|-------|
| `id` | Auto-generated UUID |
| `client_id` | New client ID |
| `old_status` | NULL |
| `new_status` | 'intake' |
| `changed_by_user_id` | Auth user ID |
| `reason` | "Client intake form submitted" |
| `created_at` | NOW() |

---

## Part 5: Critical Issues & Design Decisions

### Issue #1: Clinical Data Not Persisted

**Problem:** Gender, language, concern, and preferences are collected in the form but NOT saved to the database.

**Current Behavior:**
- Form shows these fields
- User fills them out
- API receives them
- API ignores them
- Data is lost

**Possible Explanations:**
1. **Phase 1 Design** — Intentionally minimal intake, detailed clinical data collected in Phase 2
2. **Future Expansion** — Schema prepared (fields exist on clients table) but logic not implemented
3. **Separate Form** — These fields meant to be collected in a different form/flow

**Risk:**
- Users may think data is saved when it's not
- Therapists expect detailed client information from intake but won't find it
- Data loss without error message

**Recommendation:**
Either:
- ✅ Save these fields (add to INSERT statement)
- ✅ Remove these fields from the form (if not needed)
- ✅ Add explicit messaging: "Clinical details collected in next step"

### Issue #2: Concern Field Semantics

**Problem:** "Concern" is marked as REQUIRED in the form but is NOT stored in the database.

**Current Flow:**
1. Form validation: "Primary concern is required" ✓
2. API receives it: ✓
3. API stores it: ❌ Ignored

**Why collected if not saved?**
- Possibly meant to validate form is complete
- Possibly placeholder for future clinical intake form
- Data loss by design or oversight?

### Issue #3: Unique Constraint on Duplicate Prevention

**Current Behavior:**
- Email must be unique
- Phone must be unique
- If both provided and duplicate exists, user gets: "Client with this email or phone already exists"

**Edge Case:**
What if user submits with SAME email but DIFFERENT phone? Currently:
- Database constraint triggers on email
- Error returned correctly
- ✓ Duplicate prevention works

**No Issue Here** — constraint logic is sound.

### Issue #4: Password/Verification Missing

**Design Decision:** No email verification or password setup during intake.

**Implication:**
- Client record created but client has no login/access
- Therapist manages everything on backend
- Clients passive until they're sent a login link
- No "verify email" step needed for intake

**This is correct for a B2B therapist platform** (not B2C).

---

## Part 6: Audit Trail Strategy

Every successful intake creates TWO audit records:

### 1. client_status_history Table
```
client_id: 42
old_status: NULL
new_status: 'intake'
changed_by_user_id: <therapist_user_id>
reason: 'Client intake form submitted'
created_at: 2026-06-14 10:30:00 UTC
```

**Purpose:** Track status transitions for **compliance**

### 2. audit_logs Table
```
adminId: <therapist_user_id>
action: 'create'
entityType: 'client'
entityId: '42'
entityName: 'John Doe (Intake submitted)'
timestamp: 2026-06-14 10:30:00 UTC
```

**Purpose:** Track **who did what** for **security & accountability**

**Implication:** Every client created by a therapist is logged. Can reconstruct: "Which therapist created this client and when?"

---

## Part 7: Security & Permissions

### Authentication Flow

```
Frontend
  ↓
POST /api/admin/clients/intake
credentials: 'include' (sends JWT cookie)
  ↓
Backend
  ├─ Extract JWT from cookie
  ├─ Verify JWT signature
  ├─ Check expiration
  └─ Extract userId & permissions array
  
Permission Check
  └─ Does permissions include 'manage_clients'?
     ├─ NO → 403 Forbidden
     └─ YES → Proceed
```

**Design:** Only users with explicit `manage_clients` permission can create intakes.

### Data Protection

- **In Transit:** HTTPS/TLS (enforced by Vercel deployment)
- **At Rest:** Supabase PostgreSQL with Row-Level Security (RLS)
- **Access Control:** JWT + permission-based (manage_clients)
- **Logging:** Audit trail of all creates

---

## Summary: Key Logic Points

| Aspect | Current Behavior | Implication |
|--------|------------------|-------------|
| **Entry Point** | User clicks "New Client Intake" button | Simple, discoverable |
| **Form Validation** | Name & concern required; email/DOB validated if provided | Prevents obviously bad data |
| **Data Loss** | Gender, language, concern, preferences collected but not saved | ⚠️ Design issue or intentional? |
| **Unique Constraints** | Email & phone must be unique | Prevents accidental duplicates |
| **Status Initialization** | All new clients start at status='intake' | Clear, consistent starting point |
| **Audit Trail** | First status_history entry created automatically | HIPAA compliance ready |
| **Recurring Flag** | Set by daily cron job if completed_sessions >= 1 | 1-day delay in status change |
| **Therapist Assignment** | Not assigned during intake, done later | Flexibility in workflow |
| **Next Actions** | "Assign therapist or schedule first session" | Clear post-intake guidance |

---

## Recommendations

### High Priority
1. **Clarify Clinical Data** — Are gender, language, concern, preferences supposed to be saved? If not, remove from form.
2. **Document the Two-Phase Approach** — If intake is minimal and detailed clinical data comes later, document the flow.

### Medium Priority
3. **Add Field Mapping** — Create a document mapping form fields to database columns (some fields are "collected but not stored")
4. **Client-Facing UX** — Consider whether clients need to see intake form status or if therapist-only is sufficient

### Low Priority
5. **Error Messaging** — Current errors are clear but could be more specific (e.g., "Client with this email already exists" instead of generic message)

---

**Document Complete** — Ready for implementation review
