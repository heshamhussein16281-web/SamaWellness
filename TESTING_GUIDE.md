# Testing Guide - Booking & Payment Verification Fixes

**Purpose:** Step-by-step instructions to verify the booking and payment verification fixes work correctly in a live environment.

**Estimated Time:** 15-20 minutes

---

## Pre-Test Checklist

- [ ] Deploy the latest code with all fixes
- [ ] Supabase database is running
- [ ] Test data exists: 1 recurring client, 1 one-time client
- [ ] You have admin credentials to access the dashboard
- [ ] Browser developer console is open (F12 or Cmd+Option+I)
- [ ] Check the browser console for error messages

---

## Test Data Setup

### Recurring Client Test Data

Create or identify a recurring client with:
- `is_recurring` = true
- `status` = 'recurring_client'
- `therapist_id` = (assigned therapist, not NULL)
- `clinic_id` = (valid clinic)

Example SQL:
```sql
INSERT INTO clients (name, email, phone, is_recurring, status, therapist_id, clinic_id)
VALUES ('Test Recurring', 'test@recurring.com', '+1234567890', true, 'recurring_client', 1, 1);
```

### One-Time Client Test Data

Create or identify a one-time client with:
- `is_recurring` = false
- `status` = 'intake'
- `therapist_id` = NULL (or assigned)

Example SQL:
```sql
INSERT INTO clients (name, email, phone, is_recurring, status)
VALUES ('Test One-Time', 'test@onetime.com', '+0987654321', false, 'intake');
```

---

## Test 1: Booking Modal Opens Correctly

### Objective
Verify that the BookingCalendarModal renders with correct validation

### Steps

1. Navigate to the Clients dashboard
2. Wait for the page to fully load (clinic data should load)
3. Find the recurring client in the list
4. Look for the "Book Session" button
5. **Expected**: Button should be enabled
6. Click "Book Session"
7. **Expected**: BookingCalendarModal should open without errors
8. **Do NOT see**: "Missing required fields" error

### Success Criteria
- ✅ Modal opens successfully
- ✅ Calendar view displays
- ✅ Can select date and time
- ✅ No console errors

### Troubleshooting

If modal doesn't open:
1. Check browser console for errors
2. Check that clinic data is loaded (should see in network tab)
3. Verify therapistId is assigned to the client
4. Check that clinicId is a valid number (not null/undefined)

---

## Test 2: Booking Creates Successfully

### Objective
Verify that booking completes without database errors

### Steps

1. In the BookingCalendarModal (from Test 1):
2. Select a future date (not today)
3. Select a time slot
4. Verify a room is selected
5. Click "Confirm Booking"
6. **Expected**: Success message appears
7. Modal closes and returns to client list
8. **Expected**: Page refreshes and shows updated client

### Success Criteria
- ✅ Booking created without errors
- ✅ Success message shown for 1.5 seconds
- ✅ Modal closes automatically
- ✅ Client list refreshes

### Console Logs to Look For
```
[BookingCalendarModal] Booking created successfully
[ClientsPage] fetchClients completed
[ClientsPage] Payment fields for first client: {
  payment_verified_1: false,  // <-- Should be FALSE for recurring!
  ...
}
```

### Troubleshooting

If booking fails:
1. Check console for error message
2. Look for "Failed to create booking" error
3. Check Vercel logs for API errors
4. Verify all required fields were sent (therapist_id, client_id, session_date, duration_minutes)

---

## Test 3: "Verify Payment" Action Shows

### Objective
Verify that the correct action appears after booking

### Steps

1. After booking (from Test 2), client list should show updated client
2. Find the recurring client in the list
3. Look at the "Next Action" column / action button
4. **Expected**: Action shows "Verify Payment" (NOT "Reschedule or Cancel")
5. **Expected**: Button is enabled and clickable

### Success Criteria
- ✅ "Verify Payment" action shows for recurring client
- ✅ NOT "Reschedule or Cancel"
- ✅ Button is clickable

### Console Logs to Look For
```
[ClientActionButton] getNextAction - Client: Test Recurring {
  status: 'booking_scheduled',
  paymentVerified1: false,  // <-- This triggers "Verify Payment"
  ...
}
```

### Troubleshooting

If wrong action shows:
1. Check that payment_verified_1 is false in database
2. Check that status is 'booking_scheduled' (not 'assessment_pending')
3. Look at the getNextAction() logic in ClientActionButton.tsx

---

## Test 4: Payment Verification Modal

### Objective
Verify that payment verification doesn't incorrectly change client status

### Steps

1. Click "Verify Payment" button (from Test 3)
2. **Expected**: PaymentVerificationModal opens
3. Check the modal title and payment amount
4. Select today's date (or any date) in the date picker
5. Click "Verify Payment" button in modal
6. **Expected**: Success message appears
7. Modal closes and client list refreshes

### Success Criteria
- ✅ Payment modal opens
- ✅ Can select payment date
- ✅ Can submit payment verification
- ✅ Success message shown

### Console Logs to Look For
```
[PaymentVerificationModal] Recurring client: true
[PaymentVerificationModal] Update data: {
  payment_verified_1: true,
  payment_date_1: "2026-06-25",
  payment_amount_1: 2000
}
[PaymentVerificationModal] Status will change: NO (not included in update)  // <-- IMPORTANT!
```

### Expected Database Changes
```sql
-- Client table should have:
UPDATE clients SET
  payment_verified_1 = true,
  payment_date_1 = '2026-06-25T...',
  payment_amount_1 = 2000,
  status = 'booking_scheduled'  -- <-- UNCHANGED!
WHERE id = {client_id};
```

### Troubleshooting

If status incorrectly changes:
1. Check PaymentVerificationModal logic
2. Verify isRecurring prop is being passed as true
3. Look for the `if (!isRecurring)` check in the code

---

## Test 5: Status Remains "booking_scheduled"

### Objective
Verify that recurring client status doesn't change to 'assessment_pending'

### Steps

1. After payment verification (Test 4)
2. Check the client's Status column in the list
3. **Expected**: Status shows "Booking Scheduled" (NOT "Assessment Pending")
4. **Expected**: Next action shows appropriate action for status

### Success Criteria
- ✅ Status is still "Booking Scheduled"
- ✅ Next action is either "View Session" or auto-transitioned to "Active"
- ✅ Can click to view/complete session

### Console Logs to Look For
```
[ClientsPage] First client status: booking_scheduled  // <-- Correct!
```

### Troubleshooting

If status is "Assessment Pending":
1. PaymentVerificationModal is incorrectly changing status
2. Check that isRecurring=false check is in place
3. Verify the conditional: `if (!isRecurring) { updateData.status = ... }`

---

## Test 6: One-Time Client Workflow (Regression Test)

### Objective
Verify that one-time clients still work correctly (no regressions)

### Steps

1. Navigate to Clients page
2. Find one-time client in 'intake' status
3. **Expected**: Action shows "Verify Payment"
4. Click "Verify Payment"
5. **Expected**: PaymentVerificationModal opens
6. Select payment date and submit
7. **Expected**: Success message
8. **Expected**: Client list refreshes
9. Check client status
10. **Expected**: Status changed to "Assessment Pending" (correct for one-time!)

### Success Criteria
- ✅ One-time client workflow works normally
- ✅ Status correctly changes to "Assessment Pending"
- ✅ Next action is "Select Therapist"
- ✅ No regression in one-time client workflow

### Console Logs to Look For
```
[PaymentVerificationModal] Recurring client: false  // <-- False for one-time
[PaymentVerificationModal] Status will change: assessment_pending  // <-- Should change!
```

### Troubleshooting

If one-time client workflow breaks:
1. Check that isRecurring is correctly set to false
2. Verify conditional status update includes one-time clients
3. Ensure no changes affected one-time client logic

---

## Test 7: Clinic Loading State

### Objective
Verify that button is properly disabled while clinic data loads

### Steps

1. Navigate to Clients page
2. Immediately (before page fully loads), find recurring client
3. Look at "Book Session" button
4. **Expected**: Button should be disabled (grayed out)
5. Wait for page to fully load
6. **Expected**: Button becomes enabled
7. Now can click to book

### Success Criteria
- ✅ Button disabled while clinic loading
- ✅ Button enabled after clinic loads
- ✅ Prevents clicking before data ready

### Troubleshooting

If button doesn't disable:
1. Check that clinicLoading prop is passed correctly
2. Verify button disabled logic includes: `clinicLoading || ...`
3. Ensure clinic data is actually being fetched

---

## Test 8: Database Error Handling

### Objective
Verify that booking API fails properly if client update fails

### Steps

**Note**: This requires simulating a database error

1. Manually corrupt data or use test database trigger
2. Attempt to create a booking
3. API should attempt to update client but fail
4. **Expected**: Modal shows error message
5. **Expected**: Error message mentions "Failed to update client status"
6. **Expected**: Booking is NOT created (or is rolled back)

### Console Logs to Look For
```
[bookings] Error updating client status: {
  error: { message: "...", ... },
  ...
}
```

### Browser Error
```
Modal error: "Failed to create booking"
Details: "Failed to update client status after booking"
Code: "..."
```

### Success Criteria
- ✅ User sees clear error message
- ✅ Not a "Missing required fields" error
- ✅ Error indicates what went wrong
- ✅ No silent failures

### Troubleshooting

This test is optional and requires database setup. If you can't test it, the fix is still valid - the code now fails explicitly instead of silently.

---

## Summary Checklist

| Test | Description | Status |
|------|-------------|--------|
| 1 | BookingCalendarModal opens | ✅/❌ |
| 2 | Booking creates successfully | ✅/❌ |
| 3 | "Verify Payment" action shows | ✅/❌ |
| 4 | Payment verification modal works | ✅/❌ |
| 5 | Status remains "booking_scheduled" | ✅/❌ |
| 6 | One-time client workflow works | ✅/❌ |
| 7 | Clinic loading state works | ✅/❌ |
| 8 | Database error handling works | ✅/❌ |

---

## Logging Reference

### Key Console Messages to Monitor

**Successful Booking:**
```
[BookingCalendarModal] Booking created successfully
[ClientsPage] fetchClients completed - got X clients
[ClientsPage] Payment fields for first client: { payment_verified_1: false, ... }
[ClientActionButton] getNextAction - Client: ... { status: 'booking_scheduled', paymentVerified1: false }
```

**Successful Payment Verification (Recurring):**
```
[PaymentVerificationModal] Recurring client: true
[PaymentVerificationModal] Status will change: NO (not included in update)
[PUT /api/admin/clients/[id]] Successfully updated client: X
[ClientsPage] fetchClients completed
```

**API Errors:**
```
[PaymentVerificationModal] API error: 500 { error: "...", details: "..." }
[BookingCalendarModal] Booking creation error: { error: "...", details: "..." }
```

---

## FAQ

### Q: Why does the booking modal appear empty?
A: The clinic data may not have loaded. Wait for the page to fully load or check network tab to see if clinic API call succeeded.

### Q: Why is "Book Session" button disabled?
A: Either clinic is still loading, or clinicId/therapistId are not valid numbers. Wait for clinic to load.

### Q: Why do I see "Assessment Pending" status for recurring client?
A: The PaymentVerificationModal is not respecting the isRecurring prop. Check the code for the `if (!isRecurring)` check.

### Q: Why does my payment verification show "Reschedule or Cancel"?
A: Status is not 'booking_scheduled' or paymentVerified1 is not false. Check database values.

### Q: How do I check the database values?
```sql
SELECT id, name, is_recurring, status, payment_verified_1, therapist_id
FROM clients
WHERE name = 'Test Recurring';
```

---

## After Testing

1. **If all tests pass**: The fixes are working correctly!
2. **If tests fail**: Document the failure and check the "Troubleshooting" section for that test
3. **Create issues** for any failures found
4. **Review logs** for error messages and stack traces
5. **Check database** to verify data was updated correctly

---

## Contact

For issues or questions about these tests, refer to `FIXES_VERIFICATION.md` for detailed root cause analysis and code changes.
