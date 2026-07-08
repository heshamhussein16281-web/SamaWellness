# Phase 2 Quick Test Guide (30 minutes)

**Goal:** Verify Phase 2 changes work correctly  
**Time:** 30 minutes  
**Prerequisite:** Dev server running on http://localhost:3004

---

## Quick Test Flow

### Step 1: Verify API Endpoint (5 min)
```bash
# Start dev server in new terminal
npm run dev

# In another terminal, test the API:
curl -X GET http://localhost:3004/api/admin/clients \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  | jq '.data[0]' | grep -E "payment_verified_|payment_amount_|payment_date_|total"

# Expected output shows:
# "payment_verified_1": false/true
# "payment_amount_1": number
# "payment_verified_2": false/true
# "payment_amount_2": number
# "total_payment_due": number
# "total_amount_paid": number

# Should NOT show:
# "payment_verified" (old field)
# "payment_date" (old field)
```

### Step 2: Book a Session (10 min)
1. Open browser: http://localhost:3004/dashboard/clinical/clients
2. Find "Test Recurring - 1783538310810" (Client ID 90)
3. Click "Book Session" button
4. Verify modal appears (this was the Phase 1 fix)
5. Fill form:
   - Date: Pick tomorrow
   - Time: Pick any available time
   - Room: Pick any room
6. Click "Confirm"
7. Verify success message appears

**What this tests:**
✅ Modal renders correctly (Phase 1 fix verified)  
✅ Booking creates successfully  
✅ New API endpoint works

### Step 3: Verify Payment (10 min)
1. In same client profile, click "Verify Payment" button
2. Select payment date (today)
3. Click "Confirm"
4. Verify success message "Payment Verified ✅"

**Database check:**
```sql
-- Open database query tool (Supabase dashboard)
SELECT payment_verified_1, payment_amount_1, payment_date_1
FROM clients WHERE id = 90;

-- Should show:
-- payment_verified_1: true
-- payment_amount_1: 2000
-- payment_date_1: today's date with time
```

### Step 4: Verify No Old Fields Used (5 min)
```sql
-- Check that payment fields are updated correctly
SELECT id, 
  payment_verified_1, payment_amount_1, payment_date_1,
  payment_verified_2, payment_amount_2, payment_date_2
FROM clients WHERE id = 90;

-- All new fields should be present
-- Old payment_verified and payment_date should still exist
--   but not be updated by our new code
```

---

## Success Criteria

✅ Test passes if:
1. API endpoint returns new field names (payment_verified_1, etc.)
2. Booking modal renders and booking completes
3. Payment verification modal works
4. Database shows new fields updated
5. No console errors in browser or server

❌ Test fails if:
1. Old field names still returned by API
2. Booking modal doesn't render
3. Payment verification fails
4. Database shows old field names updated
5. Console shows errors

---

## Quick Troubleshooting

**If booking modal doesn't render:**
- Clear browser cache (Cmd+Shift+R)
- Restart dev server
- Check ClientActionButton.tsx line 605 is correct

**If payment verification fails:**
- Check test client has therapist assigned (ID 88)
- Check payment amount is correct (2000 EGP)
- Verify booking completed successfully first

**If API returns old field names:**
- Check clients/route.ts GET endpoint (should select new fields)
- Verify migration ran successfully
- Restart dev server

---

## Test Report Template

```
Phase 2 Quick Test Report
Date: [TODAY]
Tester: [YOUR NAME]

Results:
- API endpoint test: ✓/✗
- Booking flow test: ✓/✗
- Payment verification test: ✓/✗
- Database verification: ✓/✗
- No console errors: ✓/✗

Overall: PASS/FAIL

Issues found (if any):
[List any issues]

Notes:
[Any observations]
```

---

**Ready to test?** Start with Step 1 and proceed through all steps.  
**Takes about 30 minutes total.**  
**All tests should pass before proceeding to staging deployment.**
