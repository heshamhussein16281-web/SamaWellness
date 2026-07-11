# Payment Verification Diagnostic Test

## Prerequisites
- Dev server running on localhost:3001
- Browser DevTools open (F12)
- Console tab visible

## Step 1: Navigate to Clients List
```
1. Go to http://localhost:3001/dashboard/clinical/clients
2. Click on a client that has a booking with pending payment
3. Open DevTools Console (F12 → Console tab)
```

## Step 2: Click "Verify Payment" Button
```
1. In the clients list, find a row with a booking needing payment
2. Click the "Verify Payment" button (or similar action button)
3. PaymentVerificationModal should open
```

## Step 3: Monitor Console Logs
```
Watch for these console.log messages:

✅ You should see: "[PaymentVerificationModal] handleSubmit - Payment Type Evaluation:"
✅ You should see: "[PaymentVerificationModal] Recording session payment for booking: ###"
✅ You should see: "[PaymentVerificationModal] Current total_amount_paid: 4000"
✅ You should see: "[PaymentVerificationModal] Session amount: 2000"
✅ You should see: "[PaymentVerificationModal] New total will be: 6000"
✅ You should see: "[PaymentVerificationModal] API response status: 200"
✅ You should see: "[PaymentVerificationModal] Payment record created successfully"
✅ **CRITICAL**: "[PaymentVerificationModal] Invalidating React Query caches for client: 102"
✅ **CRITICAL**: "[PaymentVerificationModal] React Query caches invalidated - queries will refetch"
```

## Step 4: Monitor Network Requests
```
1. Open DevTools Network tab
2. Filter by "XHR/Fetch"
3. Verify these API calls are made:
   - PUT /api/admin/clients/102 → Status 200 (updates client)
   - PATCH /api/admin/bookings/172 → Status 200 (updates booking)
   - POST /api/admin/payment-records → Status 201/200 (creates record)
```

## Step 5: Verify Success Message
```
1. After filling date and clicking "Verify", success message should appear
2. Check console for: "[PaymentVerificationModal] Success timeout - calling onSuccess"
```

## Step 6: Check Data Updated
```
Option A - Direct ClientProfile Check:
1. Reload the page (F5)
2. Go to same client's profile
3. Check:
   - "Total Paid" stat should show 6000 EGP
   - "Payments" tab should show new payment record
   - "Bookings" tab should show payment_status = "paid"

Option B - Real-Time Monitoring (Better):
1. DON'T reload page
2. With DevTools still open, trigger payment verification
3. Watch Console for invalidation logs
4. Manually navigate to ClientProfile for that same client
5. Data should update WITHOUT page reload (stale-while-revalidate)
```

## Expected Results if Fix is Working ✅

```
Console Shows:
✅ Invalidation logs appear
✅ No errors in console
✅ All 3 API calls succeed

Network Shows:
✅ PUT /api/admin/clients → 200
✅ PATCH /api/admin/bookings → 200
✅ POST /api/admin/payment-records → 200

UI Shows:
✅ Total Paid updates to 6000
✅ Payments tab shows new record
✅ Booking status shows "paid"
```

## Expected Results if Fix is NOT Working ❌

```
Console Shows:
❌ Invalidation logs DON'T appear
❌ Error: "useQueryClient is not available" or similar
❌ API calls fail (not 200)

Network Shows:
❌ One or more API calls fail
❌ Network errors in console

UI Shows:
❌ Total Paid stays at 4000
❌ Payments tab stays empty
❌ Booking status stays "pending"
```

## If Fix is NOT Working - Gather Evidence

### Check 1: Is useQueryClient causing an error?
```
Console should NOT show:
- "Cannot read property 'invalidateQueries' of undefined"
- "useQueryClient is not a function"
- Any React Query errors
```

### Check 2: Are API calls actually succeeding?
```
Network Tab → Click each request → Response tab
Verify response includes updated data:
- total_amount_paid: 6000
- payment_status: "paid"
```

### Check 3: Is QueryClientProviderWrapper in layout?
```
Should see in app/layout.tsx:
- import { QueryClientProviderWrapper } from "@/lib/providers";
- <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
```

## Debugging Commands

Run these in browser console to check React Query state:

```javascript
// Check if React Query is initialized
window.__REACT_QUERY_DEVTOOLS_PANEL__ // Should exist if provider is working

// Check query cache (if React Query DevTools installed)
// Look in: Application → Local Storage → React Query DevTools
```

## Next Steps if Issue Persists

If the fix doesn't work after following these steps:

1. ✅ Collect console logs (screenshot or copy-paste)
2. ✅ Collect network request details (request/response bodies)
3. ✅ Check server logs for errors
4. ✅ Verify API responses contain updated data
5. ✅ Report findings with evidence

---

**Run this diagnostic test and report back with:**
- What console logs appeared
- What API calls were made and their status codes
- Whether data updated or not
- Any error messages
