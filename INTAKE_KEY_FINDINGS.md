# Intake Section - Key Findings & Recommendations

**Date:** 2026-06-14  
**Status:** Analysis Complete  
**Documents Produced:**
- INTAKE_LOGIC_DEEP_DIVE.md (comprehensive technical analysis)
- INTAKE_CLIENT_JOURNEY_MAP.md (step-by-step timeline & scenarios)
- This document (executive summary & action items)

---

## Quick Facts

| Aspect | Value |
|--------|-------|
| **Form Fields Collected** | 10 (name, email, phone, DOB, gender, language, concern, referred_by, preferences, intake_notes) |
| **Form Fields Saved** | 6 (name, email, phone, DOB, referral_source, notes) |
| **Fields Collected but Lost** | 4 ❌ (gender, language, concern, preferences) |
| **Required Fields** | 2 (name, concern) |
| **DB Tables Modified** | 3 (clients, client_status_history, audit_logs) |
| **Status After Intake** | intake |
| **is_recurring Flag** | FALSE (updated by cron job after 1st session) |
| **Therapist Assigned** | NO (done later) |
| **Booking Created** | NO (done later) |
| **Time to First Session** | 7-30 days (typical) |

---

## The 3 Biggest Issues

### 🔴 Issue #1: Critical Data Loss (Gender, Language, Concern, Preferences)

**What's happening:**
- Form shows fields for gender, language, concern, and preferences
- User fills them in
- API receives them
- **API ignores them** (doesn't save to database)

**Why it matters:**
- Therapist expects detailed client information from intake
- Therapist will ask "Where is the client's primary concern documented?"
- Data is completely lost without error message
- Violates UX principle: "Show data you don't save"

**How to fix (pick ONE):**

Option A: Save the fields ✅ (Recommended)
```typescript
// In POST /api/admin/clients/intake
{
  ...existingFields,
  gender: form.gender,
  language: form.language,
  concern: form.concern,        // ← Missing field in clients table!
  preferences: form.preferences, // ← Missing field in clients table!
}
```

**Database schema adjustment needed:**
- clients table needs: `gender VARCHAR(50)`, `language VARCHAR(255)`, `concern TEXT`, `preferences TEXT`

Option B: Remove fields from form (If not needed)
```typescript
// Delete from IntakeForm.tsx:
// - Gender field
// - Language field  
// - Concern field
// - Preferences field
// Move concern to a separate "Clinical Details" form
```

Option C: Add warning message
```
"Clinical details (gender, language, concern, preferences) 
will be collected in the next step with the therapist"
```

---

### 🔴 Issue #2: Concern Field Semantics Mismatch

**What's happening:**
- "Concern" is marked as REQUIRED in the form
- User sees: "Primary Concern *" (red asterisk = required)
- Form validation enforces: "Primary concern is required"
- **But it's never saved to the database**

**Why it's a problem:**
- Required field implies it's important and will be used
- Data loss without warning
- Suggests a bug rather than intentional design

**How to fix:**

Either save it OR don't require it:

**Option A: Make it optional (less work)**
```typescript
// Remove the required asterisk
<label htmlFor="concern" className="intake-form-label">
  Primary Concern  {/* Remove: <span className="intake-form-required">*</span> */}
</label>
```

**Option B: Save it (recommended)**
```typescript
// Add to clients table:
ALTER TABLE clients ADD COLUMN concern TEXT;

// Update API:
concern: form.concern || null,
```

---

### 🟡 Issue #3: Missing Failure Handling in Edge Cases

**Scenarios not handled:**

1. **Payment deadline missed**
   ```
   Status: payment_pending
   Session time arrives, payment not received
   What happens? System doesn't define this.
   
   Should: Auto-cancel booking OR block session start
   ```

2. **Assessment fails**
   ```
   Status: assessment_pending
   Therapist decides: "Not suitable for therapy"
   Action: Change to 'completed' status
   Problem: Implies success (name is confusing)
   
   Better: Create 'assessment_rejected' status
   ```

3. **Client drops out**
   ```
   Status: active, is_recurring: TRUE
   Client quits mid-therapy
   Action: Change to 'inactive'
   
   Question: What happens to future bookings? Auto-cancel?
   ```

4. **Duplicate email, different phone**
   ```
   First client: sarah@gmail.com, +1-555-0001
   Second attempt: sarah@gmail.com, +1-555-0002
   
   API rejects: "Client with this email already exists"
   Current behavior: ✓ Correct (UNIQUE on email works)
   ```

---

## Design Decisions & Trade-offs

| Decision | Current | Implication |
|----------|---------|-------------|
| **When is is_recurring determined?** | Daily cron at 1 AM UTC | 1-day delay between session completion and status change |
| **Can therapist override is_recurring?** | NO (cron-only) | Therapist can't manually mark client as recurring |
| **Therapist assigned in intake?** | NO | Flexibility but requires extra step |
| **Email verification required?** | NO | Faster intake but could have typos |
| **Password set during intake?** | NO | ✓ Correct (B2B, therapist-managed) |
| **Unique constraint on email?** | YES | Prevents accidental duplicates |
| **Unique constraint on phone?** | YES | May be too strict (two people can share phone) |

---

## What Works Well ✅

1. **Clear status progression** — Logical flow from intake → assessment → booking → active
2. **Immutable audit trail** — Every transition logged with who/what/when
3. **Authentication gate** — Only users with `manage_clients` permission can intake
4. **Atomic transactions** — Client and history created together (fail-safe)
5. **Flexible recovery** — Therapist can change status manually if workflow needs adjustment
6. **Recurring client detection** — Automatic via cron (no manual flag-setting)
7. **Clear post-success UX** — Success card shows client ID and next steps

---

## What Needs Attention ⚠️

1. **Data loss on 4 fields** — Most urgent
2. **Concern field semantics** — Second priority
3. **Missing edge case handling** — Payment timeout, assessment rejection
4. **Schema alignment** — Add missing columns to clients table
5. **Clarify two-phase design** — Document if intake is intentionally minimal
6. **Status naming** — "completed" should distinguish success vs. failure

---

## Recommendations by Priority

### Priority 1: Data Loss (Do This First)

**Action:** Decide on gender, language, concern, preferences handling

**Options:**
- [ ] **Option A (Recommended):** Save to database
  - Time: 30 minutes
  - Files: `route.ts`, potentially database migration
  - Risk: Low
  
- [ ] **Option B:** Remove from form
  - Time: 20 minutes
  - Files: `IntakeForm.tsx`
  - Risk: Low

- [ ] **Option C:** Add warning message
  - Time: 10 minutes
  - Files: `IntakeForm.tsx`
  - Risk: Low

**Decision:** Should these fields be captured in a separate "Clinical Details" form instead?

---

### Priority 2: Concern Field Fix

**Action:** Make concern field optional OR save it

**Recommended approach:**

If saving:
```sql
ALTER TABLE clients ADD COLUMN concern TEXT;
```

```typescript
// In route.ts
const { concern, ... } = body;
const { data: client, error } = await supabase
  .from('clients')
  .insert([{
    ...otherFields,
    concern: concern || null,
  }])
```

If removing from required:
```typescript
// In IntakeForm.tsx
- Remove required asterisk from concern label
- Keep field in form (users can fill if they want)
- Change client-side validation to make it optional
```

**Decision:** Which approach aligns with your clinical workflow?

---

### Priority 3: Edge Case Handling

**Action:** Define behavior for these scenarios:

**Scenario A: Payment deadline missed**
```
Define: If status='payment_pending' and session_time <= NOW():
  - Cancel booking automatically?
  - Send urgent reminder?
  - Require manual therapist intervention?
```

**Scenario B: Assessment rejection**
```
Create new status: 'assessment_rejected'
OR use 'inactive' with a reason field
```

**Scenario C: Recurring client override**
```
Should therapist be able to manually change is_recurring?
Currently: NO (only cron job can)
Proposed: Maybe YES for edge cases
```

---

### Priority 4: Schema & Documentation

**Action:** Update database schema documentation

Files to create/update:
- [ ] Database schema diagram (show all 9 client statuses)
- [ ] Field mapping document (form field → DB column)
- [ ] Status transition rules (when can each status change)
- [ ] Cron job documentation (what happens at 1 AM UTC)

---

## Implementation Checklist

### If you choose Option A (Save the missing fields):

- [ ] **Database:** Create migration to add gender, language, concern, preferences columns
  ```sql
  ALTER TABLE clients ADD COLUMN gender VARCHAR(50);
  ALTER TABLE clients ADD COLUMN language VARCHAR(255);
  ALTER TABLE clients ADD COLUMN concern TEXT;
  ALTER TABLE clients ADD COLUMN preferences TEXT;
  ```

- [ ] **API:** Update POST /api/admin/clients/intake to save all fields
  ```typescript
  // Around line 100-114 in route.ts
  const { data: client, error } = await supabase
    .from('clients')
    .insert([{
      // ... existing fields
      gender: gender || null,
      language: language || null,
      concern: concern || null,        // NEW
      preferences: preferences || null, // NEW
    }])
  ```

- [ ] **Testing:** Test form submission with all fields
  - Create test client with all fields filled
  - Verify all data appears in database
  - Verify in client profile view

- [ ] **Docs:** Update CLAUDE.md or schema docs

---

### If you choose Option B (Remove from form):

- [ ] **Frontend:** Remove fields from IntakeForm.tsx
  - Remove gender field group
  - Remove language field group
  - Remove preferences field group
  - Keep concern as optional field

- [ ] **API:** No changes needed (API already ignores these)

- [ ] **Plan:** Where will these fields be collected?
  - Separate "Clinical Details" form?
  - During assessment call?
  - Never?

- [ ] **Docs:** Update form documentation

---

### If you choose Option C (Add warning):

- [ ] **Frontend:** Add informational message
  ```typescript
  // After the form sections:
  <div className="info-message">
    Note: Clinical details (gender, language, primary concern, preferences)
    will be collected during your assessment call with the therapist.
  </div>
  ```

- [ ] **Testing:** Verify message displays correctly

---

## Questions to Answer

Before implementing, discuss these questions with the team:

1. **What's the intended design?**
   - Is intake meant to be minimal (just contact info)?
   - Or comprehensive (all clinical data)?

2. **Why are gender/language/concern/preferences in the form but not saved?**
   - Bug?
   - Intentional (will be collected elsewhere)?
   - Placeholder for future?

3. **Who's collecting the missing data?**
   - Will therapist collect during assessment?
   - Will client fill a separate form?
   - Not needed?

4. **What about the cron job behavior?**
   - Is 1 AM UTC the right time? 
   - Should therapist be able to override is_recurring?

5. **Edge case handling?**
   - How should payment timeouts be handled?
   - How should failed assessments be marked?
   - Can status transitions be reverted?

---

## Files Analyzed

| File | Size | Lines | Key Findings |
|------|------|-------|--------------|
| IntakeForm.tsx | ~10 KB | 332 | Form collects 10 fields, validates 4 |
| route.ts | ~5 KB | 173 | API saves only 6/10 fields |
| page.tsx (clients) | ~5 KB | 175 | View mode toggle, simple list view |
| INTAKE_WORKFLOW_ANALYSIS.md | ~60 KB | 1011 | Comprehensive analysis (already existed) |
| NEW_VS_RECURRING_CLIENTS_GUIDE.md | ~20 KB | 300+ | Client classification rules |

---

## Next Steps

1. **Decision:** Which option for missing fields? (A, B, or C)
2. **Clarification:** Ask team about intended design (minimal vs. comprehensive intake)
3. **Implementation:** If Option A, create database migration
4. **Testing:** Verify data flow end-to-end
5. **Documentation:** Update schema docs and field mapping

---

## Summary Table

| Aspect | Current | Issue? | Fix |
|--------|---------|--------|-----|
| Form fields collected | 10 | N/A | - |
| Fields saved to DB | 6 | 🔴 | Save 4 missing OR remove from form |
| Required field handling | name, concern | 🔴 | concern not saved but required |
| Client journey | 8 statuses | ✅ | Clear and logical |
| Audit trail | Complete | ✅ | All changes logged |
| is_recurring logic | Cron-based | ⚠️ | 1-day delay, can't override |
| Edge cases | Not defined | ⚠️ | Define payment timeout, rejection flow |
| Security | JWT-based | ✅ | Permission checks in place |

---

**End of Analysis**

Three documents created:
1. **INTAKE_LOGIC_DEEP_DIVE.md** — Technical details, code flow, security
2. **INTAKE_CLIENT_JOURNEY_MAP.md** — Timeline, state transitions, scenarios
3. **INTAKE_KEY_FINDINGS.md** — This document (summary & action items)

Use these to guide implementation decisions and client flow design.
