# Assumptions vs. Actual App Requirements

This document compares what I assumed during implementation with what's actually documented in the app.

---

## FIXED MONTHLY COSTS

### What Build Notes Say
| Item | Amount |
|------|--------|
| Rent | 35,000 EGP |
| Reception salary | 15,000 EGP |
| CAPEX amortization | 12,000 EGP |
| **Total fixed** | **62,000 EGP** |

### What's Currently in Clinic App
(Need you to check and report)

**Questions for you:**
- [ ] Are the fixed costs showing correctly in the Expenses section?
- [ ] What amounts are currently displayed as fixed costs?
- [ ] Are there additional fixed costs not in the build notes?
- [ ] Should the total be 62,000 EGP or something else?

---

## CLIENT INTAKE FLOW

### What Build Notes Say

**Two paths:**
1. **Direct booking** 
   - Client has preferred therapist
   - Stage 1 → verify payment → Stage 3a → book session

2. **Assessment path**
   - No preferred therapist
   - Stage 1 → verify payment → Stage 2 → Sama logs assessment → Stage 3b → book session

### Key Rules
- Fee minimum: 2,000 EGP (if client refuses, call ends, no registration)
- Duplicate name check on registration
- Form clears 2 seconds after successful registration
- Assessment-path first session payment is **non-refundable**

---

## PAYMENT & BOOKING RULES

### What Build Notes Say

**Booking Status Values:**
- `B` = Unpaid booking (payment required within 24h of session)
- `BP` = Booked and paid
- `cancelled` = Cancelled booking
- `reschedule-pending` = Pending reschedule

**24-hour Rule:**
- Payment must be verified at least 24h before session
- After deadline: Cancel & free room button appears
- Reception blocked from reschedule/cancel within 24h of BP session
- Admin can override with warning

**Credit Balance:**
- When BP session cancelled: modal asks Refund or Keep as credit
- Assessment-path clients: first session refund locked (non-refundable)
- Credit auto-applies to next booking as BP (no new verification needed)
- Credit badge shown on pipeline card

---

## CLIENT PIPELINE STAGES

### What Build Notes Say

| Stage | Meaning |
|-------|---------|
| 1 | Registered — awaiting payment |
| 2 | Payment verified — awaiting assessment assignment |
| 3a | Direct path — therapist assigned, ready to book |
| 3b | Assessment path — Sama assigned therapist |
| 4 | Active — has confirmed BP session |
| pay-pending | Has B session, payment not yet verified |
| ended | Refused fee on intake call |

---

## SATISFACTION KPI

### What Build Notes Say
- Computed automatically from BP session count per client-therapist pair
- KPI only activates 2+ months after first session with therapist
- **6+ sessions** → High
- **2–5 sessions** → Average
- **<2 sessions** → Poor
- Manual override: flag for reassignment button

---

## THERAPIST DATA

### What Build Notes Say

| Name | Rate | Day | Senior |
|------|------|-----|--------|
| Sama Eissa | 3,000 EGP | Mon | Yes |
| Dr Sara | 2,000 EGP | Tue | No |
| Sandy | 2,000 EGP | Tue | No |
| Marina | 2,000 EGP | Tue/Wed | No |
| Heidy | 2,000 EGP | Thu | No |
| Aliaa | 2,000 EGP | Thu | No |
| Mohamed | 2,000 EGP | Sun | No |

**Questions for you:**
- [ ] Are all therapists showing with correct rates?
- [ ] Are availability days (Mon, Tue, Wed, etc.) correct?
- [ ] Is the "Senior" status working correctly?

---

## ROOM & SCHEDULING

### What Build Notes Say
- 2 rooms: Room 1, Room 2
- Clinic opens: 15 May 2026
- Hours: 11 AM – 9 PM (9 hours)
- Calendar shows: weeks with 7 days × 2 rooms
- Sessions shown as 1-hour blocks
- Colors: Green (BP paid), Amber (B pending), Grey (therapist busy elsewhere)

**Questions for you:**
- [ ] Are both rooms showing in calendar?
- [ ] Are session hours 11 AM – 9 PM correct?
- [ ] Are colors displaying correctly?
- [ ] Is date handling working properly (avoiding UTC offset bug)?

---

## FINANCIAL REPORTS

### What Build Notes Say

**P&L Structure:**
1. Gross revenue = sum of all BP booking fees
2. Structure: Gross → 40% clinic share → less expenses → operating profit → 15% tax → net

**Revenue Split:**
- 60% therapist / 40% clinic
- 15% tax on operating profit

**Therapist Payouts:**
- 60% of session rate per session
- Mark paid per therapist per month

**Expenses:**
- Fixed costs: auto-populated (Rent, Reception, CAPEX)
- Variable costs: entered manually per month
- Month selector for actuals entry

---

## NEW PAYMENT VERIFICATION SYSTEM (What I Added)

### What I Assumed
- New clients = first-time clients (is_new_client flag)
- Booking hold = "H" status with 24h expiry
- Receptionist confirmation required before auto-cancel
- After first payment, client becomes recurring (is_new_client = false)

### What's Implemented
- API endpoints for hold bookings
- Modal system with payment/cancel confirmation
- Periodic checks every 30s for pending expiries
- Alert banner on dashboard
- Audit trail (who confirmed, when)

**Questions for you:**
- [ ] Is this the correct behavior you wanted?
- [ ] Should new client definition be different?
- [ ] Are there other hold/payment scenarios not covered?

---

## ISSUES TO FIX

Please fill in what's wrong with the fixed expenses:

### Fixed Expense Issue

**Currently Showing:**
- [ ] Rent: _________ EGP (should be 35,000)
- [ ] Reception salary: _________ EGP (should be 15,000)
- [ ] CAPEX amortization: _________ EGP (should be 12,000)
- [ ] Total: _________ EGP (should be 62,000)

**What's Wrong:**
(Please describe what's showing incorrectly)

**Additional Issues Found:**
(Any other expenses that need fixing)

---

## ACTION ITEMS

After you review and fill in the above:

1. **Fixed Expenses**
   - [ ] Confirm current values
   - [ ] Identify what needs to be corrected
   - [ ] Fix in clinic app

2. **Therapist Data**
   - [ ] Verify all therapists showing
   - [ ] Check rates are correct
   - [ ] Verify availability days

3. **Payment Verification**
   - [ ] Confirm new client definition is correct
   - [ ] Test hold/confirmation workflow
   - [ ] Review modal behavior

4. **Other Assumptions**
   - [ ] Review any other discrepancies found

---

Please fill this out and I'll fix all the issues!
