# API Reference: Session Management

Quick reference for all session-related API endpoints.

## Authentication

All requests require authentication via cookie. Make sure your request includes:
```
Cookie: auth_token=YOUR_JWT_TOKEN
```

Or include credentials in fetch:
```javascript
fetch(url, { credentials: 'include' })
```

## Endpoints Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/bookings/[id]/complete-session` | Mark session as completed |
| GET | `/api/admin/clients/[id]/sessions` | Get completed sessions (history) |
| GET | `/api/admin/clients/[id]/bookings` | Get all bookings (past & future) |
| POST | `/api/admin/bookings/[id]/session-notes` | Add notes to a booking |
| GET | `/api/admin/bookings/[id]/session-notes` | Get notes for a booking |
| GET | `/api/admin/bookings/[id]` | Get booking details |

---

## 1. Mark Session as Completed

**Endpoint:** `POST /api/admin/bookings/[id]/complete-session`

**Purpose:** Mark a booking as completed and optionally add session notes.

### Request
```bash
curl -X POST "http://localhost:3000/api/admin/bookings/123/complete-session" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "notes": "Client showed excellent engagement and progress",
    "session_outcome": "positive",
    "progress_score": 4
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('/api/admin/bookings/123/complete-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    notes: 'Session went well',
    session_outcome: 'positive',
    progress_score: 4
  })
});

const data = await response.json();
```

### Request Body
```json
{
  "notes": "Optional: Session notes/summary",
  "session_outcome": "Optional: positive|neutral|negative",
  "progress_score": "Optional: 1-5 integer"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "id": 123,
    "client_id": 42,
    "therapist_id": 1,
    "session_date": "2026-06-17T10:00:00Z",
    "booking_status": "completed",
    "updated_at": "2026-06-24T14:30:00Z"
  }
}
```

### Response (Error - 400/404/500)
```json
{
  "error": "Failed to complete booking"
}
```

---

## 2. Get Completed Sessions (Session History)

**Endpoint:** `GET /api/admin/clients/[id]/sessions`

**Purpose:** Fetch all completed sessions for a client with therapist notes and outcomes.

### Request
```bash
curl "http://localhost:3000/api/admin/clients/42/sessions?page=1&limit=20" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### JavaScript/Fetch
```javascript
const response = await fetch(
  '/api/admin/clients/42/sessions?page=1&limit=20',
  { credentials: 'include' }
);

const { data, pagination } = await response.json();
console.log('Completed sessions:', data);
```

### Query Parameters
- `page` (default: 1) - Page number for pagination
- `limit` (default: 20, max: 100) - Items per page

### Response (Success - 200)
```json
{
  "data": [
    {
      "session_date": "2026-06-17T10:00:00Z",
      "duration_minutes": 60,
      "therapist_name": "Sama Eissa",
      "session_outcome": "positive",
      "progress_score": 4,
      "notes": "Client engaged well"
    },
    {
      "session_date": "2026-06-10T10:00:00Z",
      "duration_minutes": 60,
      "therapist_name": "Sama Eissa",
      "session_outcome": "positive",
      "progress_score": 3,
      "notes": "Good progress"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

---

## 3. Get All Bookings (Past & Future)

**Endpoint:** `GET /api/admin/clients/[id]/bookings`

**Purpose:** Fetch all bookings for a client, optionally filtered by status.

### Request
```bash
# All bookings
curl "http://localhost:3000/api/admin/clients/42/bookings" \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Only scheduled sessions
curl "http://localhost:3000/api/admin/clients/42/bookings?status=scheduled" \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Only completed sessions
curl "http://localhost:3000/api/admin/clients/42/bookings?status=completed" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### JavaScript/Fetch
```javascript
// Get future sessions
const response = await fetch(
  '/api/admin/clients/42/bookings?status=scheduled',
  { credentials: 'include' }
);

const { data } = await response.json();
```

### Query Parameters
- `status` (optional) - Filter by status: `scheduled|confirmed|completed|cancelled|expired`

### Response (Success - 200)
```json
{
  "data": [
    {
      "id": 125,
      "session_date": "2026-07-01T10:00:00Z",
      "duration_minutes": 60,
      "therapist_name": "Sama Eissa",
      "room_name": "Serenity",
      "booking_status": "scheduled",
      "payment_status": "pending",
      "amount": 0
    },
    {
      "id": 124,
      "session_date": "2026-06-24T10:00:00Z",
      "duration_minutes": 60,
      "therapist_name": "Sama Eissa",
      "room_name": "Horizon",
      "booking_status": "scheduled",
      "payment_status": "pending",
      "amount": 0
    }
  ]
}
```

---

## 4. Add Session Notes

**Endpoint:** `POST /api/admin/bookings/[id]/session-notes`

**Purpose:** Add detailed notes to a booking session.

### Request
```bash
curl -X POST "http://localhost:3000/api/admin/bookings/123/session-notes" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "notes": "Client discussed anxiety management strategies...",
    "session_outcome": "positive",
    "progress_score": 4
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('/api/admin/bookings/123/session-notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    notes: 'Detailed session notes here',
    session_outcome: 'positive',
    progress_score: 4
  })
});

const data = await response.json();
```

### Request Body
```json
{
  "notes": "Required: Session notes (max 5000 chars)",
  "session_outcome": "Optional: positive|neutral|negative (max 1000 chars)",
  "progress_score": "Optional: 1-5 integer"
}
```

### Response (Success - 201)
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "booking_id": 123,
    "therapist_id": 1,
    "notes": "Client discussed anxiety management strategies...",
    "session_outcome": "positive",
    "progress_score": 4,
    "created_at": "2026-06-24T14:30:00Z"
  }
}
```

---

## 5. Get Session Notes

**Endpoint:** `GET /api/admin/bookings/[id]/session-notes`

**Purpose:** Retrieve all notes for a specific booking.

### Request
```bash
curl "http://localhost:3000/api/admin/bookings/123/session-notes" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### JavaScript/Fetch
```javascript
const response = await fetch(
  '/api/admin/bookings/123/session-notes',
  { credentials: 'include' }
);

const { data } = await response.json();
console.log('Session notes:', data);
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "therapist_id": 1,
      "therapist_name": "Sama Eissa",
      "therapist_email": "sama@example.com",
      "notes": "Client showed improvement in anxiety management",
      "session_outcome": "positive",
      "progress_score": 4,
      "created_at": "2026-06-24T14:30:00Z"
    }
  ]
}
```

---

## 6. Get Booking Details

**Endpoint:** `GET /api/admin/bookings/[id]`

**Purpose:** Fetch complete details of a single booking.

### Request
```bash
curl "http://localhost:3000/api/admin/bookings/123" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### JavaScript/Fetch
```javascript
const response = await fetch('/api/admin/bookings/123', {
  credentials: 'include'
});

const { data: booking } = await response.json();
```

### Response (Success - 200)
```json
{
  "data": {
    "id": 123,
    "client_id": 42,
    "therapist_id": 1,
    "session_date": "2026-06-17T10:00:00Z",
    "duration_minutes": 60,
    "session_type": "single",
    "clinic_id": 1,
    "room_id": "uuid-room",
    "notes": "Booked for Serenity",
    "payment_status": "paid",
    "payment_date": "2026-06-16T12:00:00Z",
    "payment_deadline": "2026-06-16T10:00:00Z",
    "booking_status": "completed",
    "clients": { "id": 42, "name": "Test Client", "email": "...", "phone": "..." },
    "therapists": { "id": 1, "name": "Sama Eissa", "email": "..." },
    "clinic_rooms": { "id": "uuid", "room_name": "Serenity", "room_type": "standard" },
    "created_at": "2026-06-10T09:00:00Z",
    "updated_at": "2026-06-17T15:30:00Z"
  }
}
```

---

## Common Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Booking updated, data returned |
| 201 | Created | Session note created |
| 400 | Bad Request | Invalid parameters, missing fields |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Booking/client doesn't exist |
| 500 | Server Error | Database error, unexpected issue |

---

## Testing Workflow

### Step 1: Generate Test Data
```bash
npx tsx lib/test-data-generator.ts
# Creates client ID 42 with multiple sessions
```

### Step 2: Get Bookings
```bash
curl "http://localhost:3000/api/admin/clients/42/bookings?status=scheduled" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### Step 3: Mark Session Complete
```bash
# Use booking ID from step 2 (e.g., 124)
curl -X POST "http://localhost:3000/api/admin/bookings/124/complete-session" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "notes": "Great session!",
    "session_outcome": "positive",
    "progress_score": 5
  }'
```

### Step 4: View Session History
```bash
curl "http://localhost:3000/api/admin/clients/42/sessions?page=1&limit=20" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### Step 5: Get Session Notes
```bash
# Use booking ID from step 3
curl "http://localhost:3000/api/admin/bookings/124/session-notes" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

---

## Error Handling

Always check response status and handle errors:

```javascript
try {
  const response = await fetch('/api/admin/bookings/123/complete-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      notes: 'Session notes',
      progress_score: 4
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error.error);
    return;
  }

  const data = await response.json();
  console.log('Success:', data);
} catch (error) {
  console.error('Request failed:', error);
}
```

---

## Limits & Constraints

| Field | Limit | Note |
|-------|-------|------|
| notes | 5000 chars | Per session note |
| session_outcome | 1000 chars | Short description |
| progress_score | 1-5 | Integer only |
| page | No limit | But API defaults to 20 items |
| limit | 1-100 | Max 100 items per page |

---

## Required Permissions

All endpoints require one of these permissions:

- `view_bookings` - For GET endpoints
- `create_booking` - For POST endpoints

Check your user permissions in the clinic_users table.

---

## Related Endpoints

- Payment marking: `PUT /api/admin/bookings/[id]`
- Booking cancellation: `DELETE /api/admin/bookings/[id]`
- Client updates: `PUT /api/admin/clients/[id]`
- Therapist details: `GET /api/admin/therapists/[id]`
