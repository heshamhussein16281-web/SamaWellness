# Design Spec: Clinic Rooms Management & Therapist Availability

**Date:** 2026-06-14  
**Author:** Claude Code  
**Status:** Draft

---

## Overview

Add two new features to the admin/clinical dashboard:

1. **Clinic Rooms Management** — Allow admins to specify how many therapy rooms each clinic has
2. **Therapist Availability Scheduling** — Allow clinicians to set which days each therapist works at each clinic, with support for exceptions (vacation, days off)

These features enable the booking system to calculate available appointment slots based on therapist working hours and clinic room capacity.

---

## Feature 1: Clinic Rooms Management

### Scope

- Add a "Rooms" tab to the clinic edit modal (in `/dashboard/admin/clinics`)
- Allow admins to specify the total number of therapy rooms at each clinic
- Store the room count in the `clinics` table

### User Experience

1. Admin opens clinic list (`/dashboard/admin/clinics`)
2. Clicks "Edit" on a clinic → modal opens
3. Two tabs: "Basic Info" and "Rooms"
4. "Basic Info" tab: existing fields (name, location, phone, email)
5. "Rooms" tab: single input field asking "Total Number of Rooms" with a number input (minimum 1)
6. Click "Save" to persist

### Data Model

**Table:** `clinics` (existing)

**New column:**
- `number_of_rooms` (integer, nullable, default null)

The available slots endpoint already fetches clinic rooms from `clinic_rooms` table. This feature populates basic capacity info that can be used to validate against the number_of_rooms limit if needed in future iterations.

### API Changes

**Update:** `PUT /api/admin/clinics/:id`

Add `number_of_rooms` to the request body and response.

```json
{
  "name": "Main Clinic",
  "location": "Cairo",
  "phone": "+20XXX",
  "email": "clinic@example.com",
  "number_of_rooms": 5
}
```

---

## Feature 2: Therapist Availability Scheduling

### Scope

- Display a 7-day availability calendar on the therapist list page
- Add a "📅 Schedule" button next to each therapist to open a modal
- Allow setting working days (Mon-Sun) per therapist per clinic
- Support exceptions: vacation periods and specific days off
- Store data in the existing `therapist_availability` table

### User Experience

**On Therapist List Page** (`/dashboard/clinical/therapists`):

1. Each therapist row shows:
   - Name, email, hourly rate
   - "Availability at [Clinic Name]:" label with a 7-day calendar grid
   - Calendar shows: M, T, W, T, F, S, S (day abbreviations)
   - Green boxes = working days
   - Gray boxes = off days
2. Two action buttons per therapist:
   - "✎ Edit" (existing, to edit therapist info)
   - "📅 Schedule" (new, to open availability modal)

**Schedule Availability Modal** (opens on "📅 Schedule" click):

1. Modal title: "Set Availability for [Therapist Name] at [Clinic Name]"
2. Section 1: "Select Working Days" — checkboxes for Mon–Sun
   - Check = works that day
   - Uncheck = off that day
3. Section 2: "Exceptions" — list existing exceptions with remove buttons
   - Shows: "Vacation: June 15-25, 2026" (example)
   - Button: "+ Add Exception"
4. Clicking "+ Add Exception" opens a sub-form to:
   - Choose exception type (Vacation, Day Off)
   - Enter date range (start–end for vacation, single date for day off)
   - Save/cancel
5. Modal buttons: "Save" (blue) and "Cancel"

### Data Model

**Table:** `therapist_availability` (existing)

**Columns used:**
- `therapist_id` (foreign key)
- `clinic_id` (foreign key)
- `day_of_week` (Monday–Sunday)
- `status` (working, vacation, off)
- `created_at`, `updated_at`

**For exceptions**, a new table may be needed if not already present:

**Table:** `therapist_exceptions` (new, if needed)
- `id` (uuid)
- `therapist_id` (foreign key)
- `clinic_id` (foreign key)
- `exception_type` (enum: vacation, day_off)
- `start_date` (date)
- `end_date` (date, nullable — null if single day off)
- `notes` (text, optional)
- `created_at`, `updated_at`

**Alternative:** Store exceptions as JSON in a `exceptions` column in `therapist_availability` if simpler.

### API Changes

**Existing:** `POST /api/admin/therapists/:id/availability`

Current behavior: accepts array of availability slots (day_of_week, start_time, end_time, clinic_id, status).

**Modification:** 
- Simplify to accept array of: `{ day_of_week, clinic_id, status }`
- Remove `start_time` and `end_time` from requirement (optional for now)
- Add support for exceptions in the request body or via separate endpoints

**New endpoints (optional):**
- `POST /api/admin/therapists/:id/exceptions` — add exception
- `DELETE /api/admin/therapists/:id/exceptions/:exceptionId` — remove exception

### Display Logic

**Calendar Grid on Therapist List:**

1. Query `therapist_availability` for the therapist's clinic
2. Group by `day_of_week`
3. For each day:
   - If status = "working" → green box
   - If status = "vacation" or "off" → gray box
4. Show clinic name above the grid (e.g., "Availability at Main Clinic")
5. If therapist has multiple clinics, show separate grids per clinic (or show a primary clinic)

**Modal Population:**

1. Fetch all `therapist_availability` records for therapist + clinic
2. Populate checkboxes based on status
3. Fetch all exceptions (from `therapist_exceptions` or equivalent)
4. List existing exceptions

---

## Components to Build/Modify

### Frontend

**New Components:**
- `ClincRoomsTab.tsx` — Room management interface inside clinic edit modal
- `TherapistAvailabilityCalendar.tsx` — 7-day calendar display (read-only, on list)
- `ScheduleAvailabilityModal.tsx` — Modal for editing availability
- `AddExceptionForm.tsx` — Sub-form for adding vacation/day off

**Modified Components:**
- `ClinicsList.tsx` — Add "Rooms" tab to the edit modal
- `TherapistsList.tsx` — Add calendar grid display, "Schedule" button, integrate modal

### Backend

**Modified APIs:**
- `PUT /api/admin/clinics/:id` — Accept and store `number_of_rooms`
- `POST /api/admin/therapists/:id/availability` — Simplify to accept day_of_week + status (no times)

**New APIs (if using separate exception endpoints):**
- `POST /api/admin/therapists/:id/exceptions` — Create exception
- `DELETE /api/admin/therapists/:id/exceptions/:exceptionId` — Delete exception
- `GET /api/admin/therapists/:id/exceptions` — Fetch exceptions for therapist

### Database Migrations

1. Add `number_of_rooms` column to `clinics` table
2. Create `therapist_exceptions` table (if using separate table for exceptions)

---

## Data Flow

### Setting Clinic Rooms

```
Clinic Edit Modal
  → User clicks "Rooms" tab
  → Input: number_of_rooms value
  → Click "Save"
  → PUT /api/admin/clinics/:id { number_of_rooms: 5 }
  → Update clinics table
  → Success message, modal closes
```

### Setting Therapist Availability

```
Therapist List
  → User clicks "Schedule" button next to therapist
  → ScheduleAvailabilityModal opens
  → Fetch current availability + exceptions
  → User checks/unchecks working days
  → User adds/removes exceptions
  → Click "Save"
  → POST /api/admin/therapists/:id/availability [{ day_of_week, clinic_id, status }, ...]
  → Create/update therapist_availability records
  → POST/DELETE exceptions as needed
  → Success message, modal closes
  → Calendar grid on therapist list refreshes
```

---

## Error Handling

**Clinic Rooms:**
- Minimum 1 room (input validation)
- Handle save failures gracefully (show error message)

**Therapist Availability:**
- Validate at least one working day is selected (UI validation)
- Handle exception date validation (start ≤ end)
- Show error if save fails
- Clear modal on successful save

---

## Success Criteria

1. ✅ Admin can view and edit clinic room count
2. ✅ Clinician can see therapist working days at a glance (7-day calendar)
3. ✅ Clinician can set working days for each therapist at each clinic
4. ✅ Clinician can add/remove exceptions (vacation, days off)
5. ✅ Calendar grid updates after saving changes
6. ✅ Data persists in database

---

## Future Enhancements (Out of Scope)

- Time slots per day (e.g., 9am–5pm) — currently simple working days only
- Therapist-specific room assignments (e.g., Dr. Smith always uses Room A)
- Bulk availability import from CSV
- Recurring exceptions (e.g., "every second Friday off")
- Mobile responsiveness for availability modal (assume desktop-first for now)

---

## Technical Notes

- The existing `therapist_availability` table structure supports this design; no breaking changes needed
- The available slots endpoint already filters by clinic rooms; this feature just populates room count metadata
- Calendar grid is simple CSS: 7 boxes in a flex row, no complex date logic
- Use existing modal patterns from clinic edit modal for consistency
