# API Caching Issue - Prevention Guide

## The Problem (Happened Multiple Times)

**Symptom:** After updating data via PUT/PATCH, the GET request returns **stale cached data** instead of the updated values.

**Example that happened:**
- User verified payment → booking marked as paid ✅
- But total_amount_paid didn't increase → dashboard shows old 4000 instead of new 6000 ❌

**Root Cause:** Next.js 15+ caches API responses by default. Without `unstable_noStore()`, GET endpoints return cached responses even though the underlying data changed.

---

## Why This Keeps Happening

### Issue 1: Pattern Not Centralized
Each endpoint needs `unstable_noStore()` manually added:
```typescript
// Easy to forget in new endpoints ❌
export async function GET(request, { params }) {
  unstable_noStore();  // Had to add manually 8 times
  // ... handler
}
```

### Issue 2: New Endpoints Inherit the Bug
When you create a new GET endpoint, easy to forget the `unstable_noStore()` call, reintroducing the bug.

### Issue 3: No Enforcement
- No linter rules
- No type checking
- No automated detection

---

## Prevention Strategy

### ✅ For New Endpoints

When creating a **new GET endpoint** that reads data:

```typescript
import { withNoStore } from '@/lib/api-handlers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withNoStore(async () => {
    // Check auth
    const auth = await checkPermission(request, 'view_data');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Fetch data
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  });
}
```

### ✅ For Existing Endpoints

Endpoints that already have `unstable_noStore()` are fine - no change needed. They will continue to work.

### ✅ Checklist for Every New GET Endpoint

When creating a new `/api/admin/...` endpoint:

- [ ] Does this endpoint READ from the database?
- [ ] Can this data be modified elsewhere (PUT/PATCH/DELETE)?
- [ ] Will users see stale data if not fresh?
  - If ANY of these are YES → **MUST use `withNoStore()` or add `unstable_noStore()`**

---

## Affected Endpoints (Fixed in Previous Sessions)

These already have `unstable_noStore()` applied:

✅ `/api/admin/clients/[id]` - Returns client data
✅ `/api/admin/clients/[id]/profile` - Returns full profile
✅ `/api/admin/clients/[id]/bookings` - Returns client bookings
✅ `/api/admin/clients/[id]/payments` - Returns payment history
✅ `/api/admin/clients/[id]/sessions` - Returns completed sessions
✅ `/api/admin/bookings/[id]` - Returns booking details
✅ `/api/admin/clinics/[id]` - Returns clinic data
✅ `/api/admin/therapists/[id]` - Returns therapist data
✅ `/api/clinic/therapists/[id]` - Returns therapist schedule

If you see stale data from these endpoints → check if `unstable_noStore()` is present.

---

## Why This Matters

### Without unstable_noStore()
```
User Action          Database Change      GET Request      Dashboard Shows
-----------          ----------------      -----------      ---------------
Verify Payment  →    total_amount_paid: 6000  GET client  →  STALE: 4000 ❌
```

### With unstable_noStore()
```
User Action          Database Change      GET Request      Dashboard Shows
-----------          ----------------      -----------      ---------------
Verify Payment  →    total_amount_paid: 6000  GET client  →  FRESH: 6000 ✅
```

---

## Long-Term Solution

In the future, consider:

1. **Middleware for all /api/admin/* routes**
   - Apply `unstable_noStore()` to ALL GET endpoints automatically
   - No manual per-endpoint work

2. **Environment-based caching control**
   - Disable caching entirely in dev/staging
   - Only cache in production if needed

3. **TypeScript enforcement**
   - Type-level guarantee that GET endpoints have `unstable_noStore()`

---

## Testing

After applying the fix to any endpoint:

```bash
# 1. Start dev server
npm run dev

# 2. Make a modification (PUT/PATCH)
# Example: Verify a payment for a client

# 3. Check if GET returns the updated data
# Open browser DevTools → Network tab
# Make a fresh request to /api/admin/clients/[id]
# Should see the updated total_amount_paid

# 4. If still showing old data:
# - Check if unstable_noStore() is actually there
# - Check if there's Response caching from browsers (clear cache)
# - Check Network Response Headers for Cache-Control
```

---

## Related Files

- `lib/api-handlers.ts` - Centralized handler utilities
- This file: API Caching Guide
- Individual endpoint files: `app/api/admin/.../route.ts`
