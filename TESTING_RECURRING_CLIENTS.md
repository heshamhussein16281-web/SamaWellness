# Testing Recurring Clients - Setup & Usage Guide

This guide explains how to test recurring client cycles and session management using the test data generator.

## Overview

Since all client sessions in production are in the future, we've created a test data generator that allows you to:

1. **Create test recurring clients** with past and future sessions
2. **Mark past sessions as completed** for testing session logs
3. **View session history** with therapist notes and progress tracking
4. **Test recurring client workflows** across multiple session cycles

## Setup

### Prerequisites

- Node.js 18+ installed
- `.env.local` file configured with Supabase credentials
- At least one therapist created in Supabase (e.g., "Sama Eissa")
- At least one clinic created with rooms (e.g., "New Giza" with "Serenity" and "Horizon" rooms)

### Configuration

The test data generator uses default configuration:

```typescript
{
  clientName: 'Test Recurring Client',
  clientEmail: 'test.recurring@example.com',
  clientPhone: '+20 100 000 0001',
  therapistName: 'Sama Eissa',        // ← Change to match your therapist
  clinicName: 'New Giza',              // ← Change to match your clinic
  pastSessionCount: 5,                 // Completed sessions in the past
  futureSessionCount: 4,               // Scheduled sessions in the future
  sessionFrequency: 'weekly',           // Or 'biweekly'
}
```

## Usage

### Step 1: Generate Test Data

Run the test data generator:

```bash
npx tsx lib/test-data-generator.ts
```

**Expected Output:**
```
🧪 Starting test data generation...
✓ Using existing clinic: New Giza (ID: 1)
✓ Using therapist: Sama Eissa (ID: 1, Rate: 3000 EGP/hr)
✓ Created client: Test Recurring Client (ID: 42)
✓ Created 5 completed sessions
  ✓ Added notes to 5 sessions
✓ Created 4 scheduled future sessions

✅ Test data generation complete!

📊 Summary:
  Client: Test Recurring Client (test.recurring@example.com)
  Therapist: Sama Eissa
  Completed sessions: 5
  Scheduled sessions: 4

🧪 You can now test recurring client cycles and session management!
```

### Step 2: View Session History

1. Navigate to the Clients page: `/dashboard/clinical/clients`
2. Find "Test Recurring Client" in the list
3. Click on the client row to view details
4. A button or link should appear to view "Session History" (implementation in progress)

Alternatively, visit:
```
/api/admin/clients/[CLIENT_ID]/sessions?page=1&limit=50
```

This returns completed sessions with notes and outcomes.

## Features

### 1. Session History Component

The `SessionHistory.tsx` component displays:

- **Completed Sessions Tab**
  - Date, time, and duration
  - Therapist name
  - Progress score (1-5 stars)
  - Session outcome (positive/neutral/negative)
  - Therapist notes

- **Scheduled Sessions Tab**
  - Future session dates and times
  - Room assignment
  - Booking status

### 2. API Endpoints

#### Mark Session as Completed

```bash
POST /api/admin/bookings/[BOOKING_ID]/complete-session
Content-Type: application/json

{
  "notes": "Session went well, client discussed important topics",
  "session_outcome": "positive",
  "progress_score": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "booking_status": "completed",
    "updated_at": "2026-06-24T10:30:00Z"
  }
}
```

#### Get Session History

```bash
GET /api/admin/clients/[CLIENT_ID]/sessions?page=1&limit=20
```

**Response:**
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

#### Get Future Bookings

```bash
GET /api/admin/clients/[CLIENT_ID]/bookings?status=scheduled
```

**Response:**
```json
{
  "data": [
    {
      "id": 124,
      "session_date": "2026-07-01T10:00:00Z",
      "duration_minutes": 60,
      "therapist_name": "Sama Eissa",
      "room_name": "Serenity",
      "booking_status": "scheduled",
      "payment_status": "pending",
      "amount": 0
    }
  ]
}
```

## Testing Scenarios

### Scenario 1: Complete a Past Session

1. Generate test data (5 past sessions, 4 future)
2. Use the API to mark the first past session as completed:
   ```bash
   POST /api/admin/bookings/1/complete-session
   {
     "notes": "First session notes",
     "session_outcome": "positive",
     "progress_score": 3
   }
   ```
3. Verify the session now appears with completed status

### Scenario 2: Add Session Notes to Completed Session

1. Use the existing endpoint:
   ```bash
   POST /api/admin/bookings/[BOOKING_ID]/session-notes
   {
     "notes": "Client showed improvement in xyz",
     "session_outcome": "positive",
     "progress_score": 4
   }
   ```
2. Verify notes appear in the session history

### Scenario 3: Test Recurring Client Workflow

1. Generate test recurring client
2. View client status: should show "active" with therapist assigned
3. Check next action button: should show "Book Session" (since payment verified)
4. Mark sessions as completed to simulate therapy progress
5. View session log to see accumulated client history

## Customizing Test Data

To create different test scenarios, edit `lib/test-data-generator.ts`:

```typescript
const config: TestDataConfig = {
  clientName: 'My Custom Test Client',
  clientEmail: 'custom@example.com',
  clientPhone: '+20 100 000 0002',
  therapistName: 'Another Therapist',
  clinicName: 'Your Clinic Name',
  pastSessionCount: 10,       // More past sessions
  futureSessionCount: 8,      // More future sessions
  sessionFrequency: 'biweekly', // Bi-weekly instead of weekly
};
```

Then run:
```bash
npx tsx lib/test-data-generator.ts
```

## Troubleshooting

### "Clinic not found"
- Verify the clinic name matches exactly (case-sensitive)
- Check Supabase: `SELECT id, name FROM clinics;`

### "Therapist not found"
- Verify the therapist name matches exactly
- Check Supabase: `SELECT id, name, hourly_rate FROM therapists;`

### "No rooms found"
- Sessions will be created without room assignment (which is okay for testing)
- To add rooms: visit `/dashboard/clinical/clinics` and add rooms to the clinic

### Test data doesn't appear
- Check browser console for errors
- Verify authentication token in cookies
- Check Supabase permissions for the clinic_users table

## Next Steps

1. **View session history in UI** - Implement SessionHistory modal in ClientActionButton
2. **Therapist session log** - Create a therapist-specific session view
3. **Session notes form** - Build a form to add notes to completed sessions
4. **Progress tracking** - Display progress charts for recurring clients
5. **Session analytics** - Session count, average duration, outcome trends

## Files Created/Modified

- ✅ `lib/test-data-generator.ts` - Test data generator
- ✅ `app/api/admin/bookings/[id]/complete-session/route.ts` - Mark session as completed
- ✅ `app/dashboard/clinical/clients/SessionHistory.tsx` - Session history UI component
- ✅ `app/api/admin/clients/[id]/bookings/route.ts` - Updated to include room details
- ✅ `TESTING_RECURRING_CLIENTS.md` - This file
