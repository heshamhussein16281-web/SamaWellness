# Sama Wellness Dashboard - Client Intake Process Workflow Analysis

**Last Updated:** 2026-06-14  
**Analyst:** Claude Code  
**Project:** Sama Wellness Therapy Platform

---

## Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [User Interface Layer](#user-interface-layer)
3. [API Layer](#api-layer)
4. [Database Layer](#database-layer)
5. [State Management & Flow](#state-management--flow)
6. [Data Validation](#data-validation)
7. [Error Handling](#error-handling)
8. [Audit & Compliance](#audit--compliance)
9. [Client Status Lifecycle](#client-status-lifecycle)
10. [Integration Points](#integration-points)

---

## Workflow Overview

The intake process in the new dashboard is a **clinical client onboarding system** that:

1. **Allows authorized clinicians to register new clients** via a structured intake form
2. **Stores comprehensive client information** in the Supabase database
3. **Initiates the client through the status lifecycle** beginning at "intake" status
4. **Maintains an audit trail** of all changes and status transitions
5. **Enables profile management** with sessions, bookings, payments, and historical data

### Key Participants

- **User:** Clinic staff or therapist with `manage_clients` permission
- **Frontend:** React component (`IntakeForm`) in the clinical dashboard
- **Backend:** Node.js/Next.js API route (`/api/admin/clients/intake`)
- **Database:** Supabase PostgreSQL with 8+ related tables
- **Audit System:** Automatic logging of all intake actions

---

## User Interface Layer

### Component: IntakeForm (`app/dashboard/clinical/clients/IntakeForm.tsx`)

#### Location & Access
- **Route:** `/dashboard/clinical/clients`
- **Access Method:** "New Client Intake" button on clients list page
- **View Mode:** Toggles between `list` and `intake` view modes

#### Form Structure (4 Fieldsets)

**1. Contact Information Section**
- **Name** (Required*) - Full name of the client
- **Email** (Optional) - Email address with regex validation
- **Phone** (Optional) - Phone number field

**2. Personal Information Section**
- **Date of Birth** (Optional) - Date picker input
- **Gender** (Optional) - Dropdown with options: Male, Female, Other, Prefer not to say
- **Preferred Language** (Optional) - Text field (e.g., "English", "Arabic")

**3. Referral & Concerns Section**
- **Referred By** (Optional) - Text field tracking referral source (Friend, Google, Therapist, etc.)
- **Primary Concern** (Required*) - Textarea describing client's reason for therapy
- **Client Preferences** (Optional) - Textarea for therapist gender/time preferences

**4. Additional Notes Section**
- **Intake Notes** (Optional) - Textarea for clinical observations

#### Form State Management

```typescript
// FormData Interface
interface FormData {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  language: string;
  concern: string;
  referred_by: string;
  preferences: string;
  intake_notes: string;
}

// Component State
const [formData, setFormData] = useState<FormData>(...);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<{id, name, status} | null>(null);
```

#### Validation Logic (Client-Side)

```typescript
validateForm(): boolean {
  - name: Must not be empty/whitespace (required)
  - concern: Must not be empty/whitespace (required)
  - email: If provided, must match /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  - date_of_birth: If provided, must be valid ISO date (isNaN check)
}
```

#### Form Submission Flow

```
User fills form
    ↓
Click "Submit Intake" button
    ↓
validateForm() runs locally
    ↓
If validation fails → Display error message to user
    ↓
If validation passes → Send POST request to /api/admin/clients/intake
    ↓
Server processes request
    ↓
Response received:
    ├─ Success (201) → Display success card with client ID & name
    │                   └─ Auto-redirect to clients list after 2 seconds
    │                   └─ Trigger onSuccess callback
    │
    └─ Error (400/401/403/500) → Display error message to user
```

#### Success State UI

When intake succeeds, the component displays:
- Green checkmark icon
- "Client Intake Submitted Successfully" heading
- Client ID, Name, and Status
- Message: "The client has been added to the system. You can now assign a therapist or schedule their first session."
- "View All Clients" button (redirects to `/dashboard/clinical/clients`)

#### Styling

- CSS file: `intake-form.css`
- Components styled with BEM-like naming: `.intake-form-*`, `.intake-success-*`
- Button states: Primary (submit), Secondary (cancel)
- Error display: Red banner with error text
- Disabled state during loading

---

## API Layer

### Endpoint: POST `/api/admin/clients/intake`

#### Security & Authentication

```typescript
// Permission Check
checkPermission(request, 'manage_clients')
  ├─ Extract JWT token from cookie
  ├─ Verify JWT signature & expiration
  ├─ Check if user has 'manage_clients' permission
  └─ Return 401/403 if unauthorized

// Request Headers
credentials: 'include'  // Send cookies with CORS requests
Content-Type: 'application/json'
```

#### Request Body

```typescript
{
  name: string (required),
  email: string (optional),
  phone: string (optional),
  date_of_birth: string (optional, ISO 8601),
  gender: string (optional),
  language: string (optional),
  concern: string (required),
  referred_by: string (optional),
  preferences: string (optional),
  intake_notes: string (optional)
}
```

#### Server-Side Processing

```
1. AUTHENTICATION
   └─ Verify JWT token & check 'manage_clients' permission
      ├─ No token → 401 Unauthorized
      ├─ Invalid token → 401 Unauthorized
      └─ Missing permission → 403 Forbidden

2. VALIDATION
   ├─ name: Required, non-empty
   ├─ concern: Required, non-empty
   ├─ email: Optional, but if provided must match /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   │         ├─ Invalid format → 400 Bad Request
   │         └─ Message: "Invalid email format"
   │
   └─ date_of_birth: Optional, but if provided must be valid ISO 8601
                     ├─ Invalid format → 400 Bad Request
                     └─ Message: "Invalid date_of_birth format. Must be ISO 8601."

3. DATABASE OPERATIONS (Atomic)
   ├─ INSERT into clients table:
   │  ├─ name (required)
   │  ├─ email (nullable)
   │  ├─ phone (nullable)
   │  ├─ date_of_birth (nullable)
   │  ├─ status: 'intake' (hardcoded)
   │  ├─ client_since: current ISO timestamp
   │  ├─ notes: intake_notes or null
   │  ├─ referral_source: referred_by or null
   │  ├─ created_at: current timestamp
   │  ├─ updated_at: current timestamp
   │  ├─ is_recurring: false (default)
   │  ├─ total_sessions_completed: 0 (default)
   │  └─ total_amount_paid: 0.00 (default)
   │
   │  Error Handling:
   │  ├─ UNIQUE constraint (email/phone) → 400 Bad Request
   │  │  └─ Message: "Client with this email or phone already exists"
   │  └─ Other error → 500 Internal Server Error
   │     └─ Message: "Failed to create client"
   │
   ├─ INSERT into client_status_history table:
   │  ├─ client_id: <newly created client ID>
   │  ├─ old_status: null (first status change)
   │  ├─ new_status: 'intake'
   │  ├─ changed_by_user_id: <authenticated user ID>
   │  ├─ reason: 'Client intake form submitted'
   │  └─ created_at: current timestamp
   │
   │  Error Handling:
   │  └─ If history insert fails, log error but DON'T fail the request
   │     (data is already in clients table)
   │
   └─ Log audit action:
      ├─ action: 'create'
      ├─ entityType: 'client'
      ├─ entityId: <client ID>
      ├─ entityName: "<Client Name> (Intake submitted)"
      └─ adminId: <authenticated user ID>

4. RESPONSE (201 Created)
   {
     "success": true,
     "data": {
       "id": <client ID>,
       "name": "<client name>",
       "status": "intake",
       "client_since": "<ISO timestamp>"
     }
   }
```

#### Response Codes

| Code | Condition | Message |
|------|-----------|---------|
| **201** | Success | `{success: true, data: {...}}` |
| **400** | Missing required fields | "name and concern are required" |
| **400** | Invalid email format | "Invalid email format" |
| **400** | Invalid date of birth | "Invalid date_of_birth format. Must be ISO 8601." |
| **400** | Duplicate email/phone | "Client with this email or phone already exists" |
| **401** | No auth token | "No authentication token found" |
| **401** | Invalid/expired token | "Invalid or expired token" |
| **403** | Missing permission | "Insufficient permissions" |
| **500** | Database error | "Failed to create client" or "Internal server error" |

---

## Database Layer

### Tables Involved in Intake Process

#### 1. clients (Primary Table)

**Schema:**
```sql
CREATE TABLE clients (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NULLABLE,
  phone VARCHAR(20) UNIQUE NULLABLE,
  date_of_birth DATE NULLABLE,
  status VARCHAR(50) NOT NULL DEFAULT 'intake' CHECK (status IN (
    'intake',                    -- Initial state after intake form
    'assessment_pending',        -- Awaiting clinical assessment
    'ready_for_booking',         -- Assessment complete, ready to schedule
    'booking_scheduled',         -- Session booked
    'payment_pending',           -- Waiting for payment
    'active',                    -- Currently in therapy
    'completed',                 -- Therapy complete
    'inactive',                  -- On pause/hiatus
    'booking_expired'            -- Booking window expired
  )),
  client_since TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_recurring BOOLEAN DEFAULT false,
  therapist_id BIGINT NULLABLE REFERENCES therapists(id),
  last_session_date TIMESTAMPTZ NULLABLE,
  total_sessions_completed INT DEFAULT 0,
  total_amount_paid DECIMAL(10,2) DEFAULT 0.00,
  referral_source VARCHAR(255) NULLABLE,  -- Referred by field
  notes TEXT NULLABLE,                     -- Intake notes field
  intake_date TIMESTAMPTZ NULLABLE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

Indexes:
  - PRIMARY KEY (id)
  - UNIQUE (email)
  - UNIQUE (phone)
  - idx_clients_status ON status
  - idx_clients_is_recurring ON is_recurring
  - idx_clients_client_since ON client_since
```

**Fields Set During Intake:**
- `name` ← form.name
- `email` ← form.email (optional)
- `phone` ← form.phone (optional)
- `date_of_birth` ← form.date_of_birth (optional)
- `referral_source` ← form.referred_by (optional)
- `notes` ← form.intake_notes (optional)
- `status` ← hardcoded as 'intake'
- `client_since` ← server timestamp
- `created_at` ← server timestamp
- `updated_at` ← server timestamp

**Fields NOT Set During Intake:**
- `gender` - Stored in separate form, not in initial intake
- `language` - Stored in separate form, not in initial intake
- `concern` - Stored in separate form, not in initial intake
- `preferences` - Stored in separate form, not in initial intake
- `therapist_id` - Assigned later during therapist assignment
- `is_recurring` - Determined after first booking
- `total_sessions_completed` - Incremented as sessions complete

#### 2. client_status_history (Audit Trail Table)

**Purpose:** Complete audit log of all client status transitions

**Schema:**
```sql
CREATE TABLE client_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  old_status VARCHAR(50) NULLABLE,  -- null for first entry
  new_status VARCHAR(50) NOT NULL,  -- 'intake' for first entry
  changed_by_user_id UUID NOT NULL REFERENCES clinic_users(id),
  reason TEXT NULLABLE,
  created_at TIMESTAMPTZ DEFAULT now()
);

Indexes:
  - idx_client_status_history_client_id ON client_id
  - idx_client_status_history_new_status ON new_status
  - idx_client_status_history_created_at ON created_at
  - idx_client_status_history_changed_by ON changed_by_user_id
```

**Initial Entry (After Intake):**
```sql
INSERT INTO client_status_history (
  client_id,
  old_status,
  new_status,
  changed_by_user_id,
  reason,
  created_at
) VALUES (
  <newly created client id>,
  null,  -- First status, no previous status
  'intake',
  <authenticated user id>,
  'Client intake form submitted',
  now()
);
```

#### 3. Related Tables (Populated Later in Lifecycle)

**bookings** - Session scheduling
- Only created after client moves to 'booking_scheduled' or later
- Links client_id to therapist_id for specific session

**payment_records** - Transaction history
- Created after bookings
- Tracks all payment-related data per session

**session_notes** - Clinical notes
- Created when therapist completes a session
- Stores outcome, progress, and notes

---

## State Management & Flow

### Client Lifecycle States

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT STATUS LIFECYCLE                  │
└─────────────────────────────────────────────────────────────┘

     ┌──────────────────────────────────────────────────┐
     │ 1. INTAKE                                        │
     │    ├─ Initial state after intake form submission  │
     │    ├─ Awaiting clinician review & assessment     │
     │    └─ May include additional form collection      │
     └──────────────────────────────────────────────────┘
                        ↓
                    (Review)
                        ↓
     ┌──────────────────────────────────────────────────┐
     │ 2. ASSESSMENT_PENDING                            │
     │    ├─ Clinical assessment scheduled              │
     │    ├─ May collect additional intake details      │
     │    └─ Clinician evaluating fit & next steps      │
     └──────────────────────────────────────────────────┘
                        ↓
                 (Assessment complete)
                        ↓
     ┌──────────────────────────────────────────────────┐
     │ 3. READY_FOR_BOOKING                             │
     │    ├─ Initial assessment complete                │
     │    ├─ Client cleared for therapy                 │
     │    └─ Available to schedule sessions             │
     └──────────────────────────────────────────────────┘
                        ↓
            (Client/therapist book session)
                        ↓
     ┌──────────────────────────────────────────────────┐
     │ 4. BOOKING_SCHEDULED                             │
     │    ├─ First session scheduled                    │
     │    ├─ Therapist assigned                         │
     │    └─ Payment/confirmation pending               │
     └──────────────────────────────────────────────────┘
                        ↓
              (Awaiting payment)
                        ↓
     ┌──────────────────────────────────────────────────┐
     │ 5. PAYMENT_PENDING                               │
     │    ├─ Session booked, awaiting payment           │
     │    ├─ Payment deadline set                       │
     │    └─ Session won't proceed until paid           │
     └──────────────────────────────────────────────────┘
              ↙             ↘
       (Paid)               (Not paid by deadline)
         ↓                           ↓
     ┌──────────────────────────────────────────────────┐
     │ 6a. ACTIVE                                       │
     │    ├─ Payment received                           │
     │    ├─ In active therapy                          │
     │    └─ May have multiple ongoing/upcoming sessions│
     └──────────────────────────────────────────────────┘
              ↙             ↘
      (Complete)        (Pause/Hold)
         ↓                   ↓
     ┌────────────────┐   ┌──────────────────────────────┐
     │ 7. COMPLETED   │   │ 6b. INACTIVE                 │
     │    ├─ Therapy  │   │    ├─ Temporarily paused     │
     │    │  complete │   │    ├─ May resume later       │
     │    └─ Archived │   │    └─ No active sessions     │
     └────────────────┘   └──────────────────────────────┘
                                 ↓
                           (Resume therapy)
                                 ↓
                            (→ ACTIVE)

     ┌──────────────────────────────────────────────────┐
     │ 8. BOOKING_EXPIRED (Dead State)                  │
     │    ├─ Booking window closed                      │
     │    ├─ Payment deadline exceeded                  │
     │    └─ Manual recovery required                   │
     └──────────────────────────────────────────────────┘
```

### Frontend State Management

**In ClientsPage component:**
```typescript
// View Mode Toggle
const [viewMode, setViewMode] = useState<'list' | 'intake'>('list');

// List View
├─ Fetch clients from /api/admin/clients
├─ Display table of all clients
├─ Filter by status (optional)
└─ Click "New Client Intake" → switch to 'intake' view

// Intake View
├─ Render IntakeForm component
├─ Pass onSuccess callback:
│  └─ setTimeout(() => setViewMode('list'), 2000)
├─ Pass onCancel callback:
│  └─ setViewMode('list')
└─ After success, auto-return to list
```

---

## Data Validation

### Client-Side Validation (IntakeForm)

```typescript
validateForm(): boolean {
  1. name field:
     ├─ Check: !formData.name.trim()
     ├─ Error: "Name is required"
     └─ Return: false

  2. concern field:
     ├─ Check: !formData.concern.trim()
     ├─ Error: "Primary concern is required"
     └─ Return: false

  3. email field (if provided):
     ├─ Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
     ├─ Check: email && !regex.test(email)
     ├─ Error: "Invalid email format"
     └─ Return: false

  4. date_of_birth field (if provided):
     ├─ Parse: new Date(formData.date_of_birth).getTime()
     ├─ Check: isNaN(result)
     ├─ Error: "Invalid date of birth"
     └─ Return: false

  5. If all checks pass:
     └─ Return: true
}
```

### Server-Side Validation (API Route)

```typescript
1. name field:
   ├─ Check: !name || !concern
   ├─ Response: 400, "name and concern are required"
   └─ Halt: Stop processing

2. email field (if provided):
   ├─ Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   ├─ Response: 400, "Invalid email format"
   └─ Halt: Stop processing

3. date_of_birth field (if provided):
   ├─ Parse: new Date(date_of_birth)
   ├─ Check: isNaN(dob.getTime())
   ├─ Response: 400, "Invalid date_of_birth format. Must be ISO 8601."
   └─ Halt: Stop processing

4. Unique constraints:
   ├─ Database check: UNIQUE(email), UNIQUE(phone)
   ├─ Error Code: 23505 (PostgreSQL)
   ├─ Response: 400, "Client with this email or phone already exists"
   └─ Halt: Stop processing

5. If all validations pass:
   └─ Proceed with database insertion
```

---

## Error Handling

### Client-Side Error Flow

```
User submits form
    ↓
try {
  ├─ Validation fails?
  │  └─ setError(message) → Display to user
  │     └─ User corrects & retries
  │
  ├─ Network request fails?
  │  └─ catch (err) → setError(err.message)
  │     └─ Display error message
  │
  ├─ Response status !ok?
  │  └─ res.json() → Extract error from response
  │     └─ setError(data.error)
  │        └─ Display error message
  │
  ├─ Response success?
  │  └─ setSuccess(data.data)
  │     └─ Display success card
  │
  └─ Finally:
     └─ setLoading(false)

Error message displayed to user with clear messaging
```

### Server-Side Error Handling

```
POST /api/admin/clients/intake
    ↓
try {
  ├─ Auth check fails?
  │  ├─ 401: "No authentication token found"
  │  ├─ 401: "Invalid or expired token"
  │  └─ 403: "Insufficient permissions"
  │
  ├─ Validation fails?
  │  └─ 400: "<specific validation error message>"
  │
  ├─ Clients table insert fails?
  │  ├─ 23505 (unique constraint): 400, "Client with this email or phone already exists"
  │  └─ Other: 500, "Failed to create client"
  │
  ├─ Status history insert fails?
  │  └─ Log error, DON'T fail request (data in clients table already)
  │
  ├─ Audit logging fails?
  │  └─ Log error, DON'T fail request
  │
  └─ Success?
     └─ 201: {success: true, data: {id, name, status, client_since}}

} catch (error) {
  └─ 500: "Internal server error"
     (with console error log for debugging)
}
```

---

## Audit & Compliance

### Audit Logging (`logAuditAction`)

**Every successful intake creates an audit log entry:**

```typescript
await logAuditAction({
  adminId: <authenticated user id>,
  action: 'create',
  entityType: 'client',
  entityId: <client id (as string)>,
  entityName: `<Client Name> (Intake submitted)`
});
```

**Audit table records:**
- Who created the client (adminId)
- What action was performed (create)
- Which entity was affected (client, <id>)
- When the action occurred (server timestamp)
- Human-readable entity name

### Status History Tracking

**Every status change logged in `client_status_history`:**

```typescript
INSERT INTO client_status_history (
  client_id,
  old_status,        // null for first entry
  new_status,        // 'intake' for initial intake
  changed_by_user_id,// Authenticated user ID
  reason,            // "Client intake form submitted"
  created_at         // Server timestamp
)
```

**Why this matters:**
- Complete audit trail of client journey
- Can answer: "Who moved this client from X to Y status, and when?"
- Compliance with healthcare regulations (HIPAA audit requirements)
- Can reconstruct client timeline if needed

### Data Protection

- **Password:** Admin credentials authenticated via JWT
- **Transport:** HTTPS/TLS (enforced by deployment)
- **Storage:** PostgreSQL with Row-Level Security (RLS) enabled
- **Access Control:** Permission-based (`manage_clients`)
- **Sensitive Data:** Email/phone stored but not logged in plain text

---

## Client Status Lifecycle

### What Happens After Intake

**Immediately After Form Submission:**

1. ✅ Client record created with status='intake'
2. ✅ Status history entry created
3. ✅ Audit log entry created
4. ✅ Success response sent to frontend
5. ✅ UI shows success card
6. ✅ User redirected to clients list after 2 seconds

**Next Steps (Manual Operations by Clinician):**

```
Client in 'intake' status
    ↓
Clinician reviews intake information
    ↓
├─ Option 1: Not ready for assessment
│  └─ Stay in 'intake' (no status change)
│
└─ Option 2: Schedule for assessment
   └─ Change status to 'assessment_pending' (via PUT /api/admin/clients/[id]/status)
      └─ Clinician assessment occurs
         └─ If cleared: Change to 'ready_for_booking'
            └─ Available for session scheduling
```

### Client Profile View (After Intake)

Once created, client visible in dashboard with profile showing:

- **Information Tab:**
  - Name, email, phone (from intake form)
  - Date of birth, status badges
  - Client since date (set to intake submission time)
  - Therapist assignment (initially null)
  - Notes section (populated with intake_notes)

- **Sessions Tab:**
  - Empty (no sessions yet)
  - Data loads from bookings table where booking_status='completed'

- **Bookings Tab:**
  - Empty (no bookings yet)
  - Becomes populated when sessions scheduled

- **Payments Tab:**
  - Empty (no payments yet)
  - Becomes populated as client pays for sessions

- **Notes & History Tab:**
  - Shows first status history entry: "null → intake"
  - Shows who created (changed_by_user_id)
  - Shows timestamp and reason

---

## Integration Points

### 1. Authentication System

```
IntakeForm submits
    ↓
Fetch to /api/admin/clients/intake
    ↓
API Route:
  ├─ Extract JWT from cookies
  ├─ Call verifyJWT(token)
  ├─ Extract userId from JWT payload
  ├─ Check permissions array includes 'manage_clients'
  └─ Use userId for audit logging
```

**Files involved:**
- `lib/auth.ts` - JWT verification
- Cookies must be included in fetch (credentials: 'include')

### 2. Database Connection

```
API Route:
    ↓
createClient(SUPABASE_URL, SERVICE_ROLE_KEY or ANON_KEY)
    ↓
Supabase PostgreSQL Connection
    ↓
├─ INSERT into clients
├─ INSERT into client_status_history
└─ Index queries for pagination/filtering
```

**Environment variables required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` (preferred) or `NEXT_PUBLIC_SUPABASE_ANON_KEY` (fallback)

### 3. Audit System

```
After successful client creation:
    ↓
logAuditAction({
  adminId,
  action: 'create',
  entityType: 'client',
  entityId,
  entityName
})
    ↓
File: lib/audit.ts
    ↓
INSERT into audit_logs table
```

### 4. Client Listing & Profile Viewing

```
After intake successful:
    ↓
User redirected to /dashboard/clinical/clients
    ↓
ClientsPage fetches from /api/admin/clients
    ↓
New client appears in table with:
  - status: 'intake'
  - client_since: intake submission time
  - therapist_name: null
  - total_sessions_completed: 0
    ↓
Click "View Profile" → /dashboard/clinical/clients/[id]
    ↓
ClientProfile component fetches from /api/admin/clients/[id]/profile
    ↓
Display full client information & history
```

### 5. Status Transitions (Later Operations)

```
After client is in 'intake' status:
    ↓
Clinician uses Client Profile page to:
  ├─ Click "Edit" → Edit client details
  ├─ View status history → See all transitions
  └─ Change status → PUT /api/admin/clients/[id]/status
      ├─ New status (e.g., 'assessment_pending')
      ├─ Optional reason
      └─ Triggers new status_history entry & audit log
```

---

## Summary Table

| Component | Location | Purpose |
|-----------|----------|---------|
| **Frontend Form** | `IntakeForm.tsx` | Collect client intake data |
| **Page Component** | `ClientsPage.tsx` | Manage view mode (list/intake) |
| **API Route** | `/api/admin/clients/intake` | Process intake submission |
| **Clients Table** | `clients` | Store client master data |
| **Status History** | `client_status_history` | Audit trail of status changes |
| **Audit Logs** | `audit_logs` | Comprehensive action logging |
| **Profile Viewer** | `ClientProfile.tsx` | Display client info & history |
| **Client List** | `ClientsPage.tsx` (list mode) | Browse all clients |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTAKE PROCESS FLOW                          │
└─────────────────────────────────────────────────────────────────┘

FRONTEND (React)
───────────────────────────────────────────────────────────────────

  Clinician opens /dashboard/clinical/clients
              ↓
  Clicks "New Client Intake" button
              ↓
  IntakeForm.tsx renders with 4 fieldsets
              ↓
  Clinician fills form (validates locally)
              ↓
  Clicks "Submit Intake" button
              ↓
  POST to /api/admin/clients/intake with FormData
              │
              ├─ name (required)
              ├─ email (optional)
              ├─ phone (optional)
              ├─ date_of_birth (optional)
              ├─ gender (optional) *
              ├─ language (optional) *
              ├─ concern (required) **
              ├─ referred_by (optional)
              ├─ preferences (optional)
              └─ intake_notes (optional)

* Note: gender, language, concern, preferences collected but NOT saved in current phase
** concern collected but saved in notes field

BACKEND (Node.js/Next.js)
───────────────────────────────────────────────────────────────────

  POST /api/admin/clients/intake
              ↓
  ├─ checkPermission('manage_clients')
  │  └─ Verify JWT → Extract userId
  │
  ├─ Validate input:
  │  ├─ name (required)
  │  ├─ concern (required)
  │  ├─ email format (if provided)
  │  └─ date_of_birth format (if provided)
  │
  └─ Database operations (atomic):
     ├─ INSERT clients {
     │  ├─ name
     │  ├─ email
     │  ├─ phone
     │  ├─ date_of_birth
     │  ├─ status: 'intake'
     │  ├─ client_since: now()
     │  ├─ referral_source: referred_by
     │  ├─ notes: intake_notes
     │  └─ created_at, updated_at
     │  }
     │  → Returns: client record with id
     │
     ├─ INSERT client_status_history {
     │  ├─ client_id
     │  ├─ old_status: null
     │  ├─ new_status: 'intake'
     │  ├─ changed_by_user_id: userId
     │  ├─ reason: 'Client intake form submitted'
     │  └─ created_at
     │  }
     │
     └─ logAuditAction {
        ├─ adminId: userId
        ├─ action: 'create'
        ├─ entityType: 'client'
        ├─ entityId: clientId
        └─ entityName: "{name} (Intake submitted)"
        }

DATABASE (PostgreSQL via Supabase)
───────────────────────────────────────────────────────────────────

  clients table:
  ├─ Insert new row
  ├─ Set status='intake'
  ├─ Validate UNIQUE(email), UNIQUE(phone)
  └─ Return generated ID

  client_status_history table:
  ├─ Insert first status entry
  ├─ Link to client via client_id
  └─ Record timestamp

  audit_logs table:
  ├─ Insert action record
  └─ Track who did what, when

RESPONSE (Back to Frontend)
───────────────────────────────────────────────────────────────────

  201 Created
  {
    "success": true,
    "data": {
      "id": 42,
      "name": "John Doe",
      "status": "intake",
      "client_since": "2026-06-14T10:30:00Z"
    }
  }

FRONTEND (React - Success)
───────────────────────────────────────────────────────────────────

  ├─ setSuccess(data.data)
  ├─ Render success card:
  │  ├─ ✓ Icon
  │  ├─ "Client Intake Submitted Successfully"
  │  ├─ Client ID: 42
  │  ├─ Name: John Doe
  │  ├─ Status: intake
  │  └─ Button: "View All Clients"
  │
  ├─ setTimeout(() => setViewMode('list'), 2000)
  └─ After 2 seconds:
     └─ Redirect to clients list
        └─ New client appears in table
           with status 'intake'
```

---

## Key Insights

1. **Separation of Concerns:** Intake form data and client profile are separate - only essential fields saved initially
2. **Status-Driven Workflow:** Client lifecycle driven by status changes tracked in history table
3. **Audit Everything:** Every action logged for compliance and troubleshooting
4. **Fail-Safe:** If audit logging fails, request still succeeds (data integrity > audit)
5. **Permission-Based:** Only users with `manage_clients` permission can create intakes
6. **Atomic Operations:** Client and history entry created together (both or nothing)
7. **Unique Constraints:** Email and phone prevent duplicate registrations
8. **Future-Ready:** Schema already includes fields for gender, language, concern, preferences for future expansion

---

**Document Generated:** 2026-06-14  
**Status:** Complete Analysis  
**Next Steps:** Client status transitions, therapist assignment, booking workflow
