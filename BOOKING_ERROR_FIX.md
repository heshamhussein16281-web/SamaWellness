# Booking Error Investigation & Fix

**Date:** 2026-07-08  
**Issue:** "Missing required fields: therapist_id, client_id, session_date, duration_minutes" error when booking session  
**Root Cause:** Modal render condition required therapistId for recurring clients, but recurring clients don't have therapists assigned

---

## Root Cause Analysis

### The Problem

In `ClientActionButton.tsx`, two conflicting logic patterns existed:

**Button disable logic (line 460-464):**
```typescript
const isDisabledForBooking = nextAction.type === 'booking' && (
  clinicLoading ||
  typeof clinicId !== 'number' ||
  (!isRecurring && typeof therapistId !== 'number') // ← Only require therapist for NON-recurring
);
```

**Modal render condition (line 605) [BEFORE FIX]:**
```typescript
{activeModal === 'booking' && typeof clinicId === 'number' && typeof therapistId === 'number' && (
  <BookingCalendarModal ... />
)}
```

### Why This Caused the Error

1. **Recurring clients** have a different workflow:
   - Don't require therapist assignment before booking
   - Can book directly from `completed` or `recurring_client` status
   - Therapist is already in the system but not assigned to the client

2. **The mismatch:**
   - Button enabled when: `clinicId` exists (therapistId NOT required for recurring clients)
   - Modal renders when: BOTH `clinicId` AND `therapistId` exist
   - Result: Button clickable but modal never renders → API never called → "missing fields" error

3. **User experience:**
   - Click "Book Session" → Button highlights as clicked
   - No modal appears (silently fails the render condition)
   - User confused, no visual feedback
   - If they check console, they see the API validation error (but the API was never called)

---

## Fix Applied

**File:** `ClientActionButton.tsx` line 605

**Changed from:**
```typescript
{activeModal === 'booking' && typeof clinicId === 'number' && typeof therapistId === 'number' && (
```

**Changed to:**
```typescript
{activeModal === 'booking' && typeof clinicId === 'number' && (isRecurring || typeof therapistId === 'number') && (
```

**Logic:** 
- For **recurring clients**: Only need `clinicId` (therapist optional)
- For **non-recurring clients**: Need both `clinicId` AND `therapistId`

This aligns the modal render condition with the button disable logic.

---

## Testing the Fix

### Setup Test Data

Use the test utility page at: `http://localhost:3000/api/admin/test`

**Steps:**
1. Click "Create Fresh Recurring Client" → Creates test recurring client with:
   - Status: `completed` (ready to book next session)
   - Therapist: Pre-assigned (from any available therapist)
   - History: 2 completed bookings in past

2. Navigate to Clients list

3. Find the created "Test Recurring - [timestamp]" client

4. Click "Book Session" button → Should now render BookingCalendarModal

5. Select date, time, and room → Click "Confirm Booking"

6. Check response:
   - Success message: "Session Booked ✓"
   - Client status updates to: `booking_scheduled`
   - "Verify Payment" button appears below main action button

7. Click "Verify Payment" → PaymentVerificationModal appears

8. Select payment date → Click "Confirm Payment"

9. Verify success message appears

### Expected Flow After Fix

```
Recurring Client (status: completed, therapist_id: 5, clinicId: 1)
  ↓ Click "Book Session"
  ↓ Modal renders (clinicId ✓, isRecurring ✓)
  ↓ Select date/time/room
  ↓ Submit booking
  ↓ API creates booking, updates client status → booking_scheduled
  ↓ "Verify Payment" button appears
  ↓ Click "Verify Payment"
  ↓ Payment modal renders with session payment type
  ↓ Verify payment → bookings.payment_status = 'paid'
  ✓ Flow complete
```

---

## Fields Involved

### Booking API (`POST /api/admin/bookings`)

**Required fields validated at line 60-65:**
```typescript
if (!therapist_id || !client_id || !session_date || !duration_minutes) {
  return NextResponse.json({
    error: 'Missing required fields: therapist_id, client_id, session_date, duration_minutes'
  }, { status: 400 });
}
```

**Note:** `clinic_id` is optional (treated as reference only)

### BookingCalendarModal submission (line 286-295)

```typescript
body: JSON.stringify({
  client_id: clientId,              // ✓ From component props
  therapist_id: therapistId,         // ✓ From component props
  session_date: `${selectedDate}T${String(selectedTime).padStart(2, '0')}:00:00`,  // ✓ From user selection
  duration_minutes: 60,              // ✓ Hardcoded (50-60 min default)
  session_type: 'single',            // ✓ Hardcoded
  clinic_id: clinicId,               // Provided for reference
  room_id: selectedRoom?.id,         // ✓ From user selection
  notes: selectedRoom ? `Booked for ${selectedRoom.room_name}` : null,
})
```

**Before fix:** Modal never rendered, so none of these fields were ever sent to API

---

## Files Modified

- `/app/dashboard/clinical/clients/ClientActionButton.tsx` - Line 605: Fixed modal render condition

---

## Verification Checklist

- [ ] Build succeeds: `npm run build`
- [ ] Dev server runs: `npm run dev`
- [ ] Create fresh recurring client via test utility
- [ ] "Book Session" button renders modal (not blocked)
- [ ] Can select date/time/room in calendar
- [ ] Booking submission succeeds (201 response)
- [ ] Client status updates to `booking_scheduled`
- [ ] "Verify Payment" button appears after booking
- [ ] Can verify payment (creates payment_history record)
- [ ] Console shows no errors related to modal render

---

## Next Steps

1. **Verify the fix** - Run test flow above
2. **Set up proper test data** - Use recurring clients with clinic assigned
3. **Phase 2 Planning** - Ready to proceed with payment schema refactoring
   - Data migration to move deprecated fields
   - Remove deprecated field usage from 11 files
   - Create comprehensive test suite
   - Timeline: 4-6 days

---

**Status:** ✅ Fix applied, awaiting build verification
