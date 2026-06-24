# Recurring Client Testing Suite

Complete guide for testing recurring client workflows and building session logs.

## 🎯 What's Been Created

### 1. **Test Data Generator** (`lib/test-data-generator.ts`)
- Automatically creates test recurring clients
- Generates past completed sessions with notes
- Schedules future sessions
- Includes therapist notes, progress scores, and outcomes
- Fully customizable

### 2. **Session History Component** (`app/dashboard/clinical/clients/SessionHistory.tsx`)
- Beautiful modal UI for viewing session history
- Two tabs: Completed Sessions | Scheduled Sessions
- Shows therapist notes, progress scores, and outcomes
- Displays session timing, duration, and room assignment
- Responsive design with sorting and filtering

### 3. **API Endpoints**
- ✅ `POST /api/admin/bookings/[id]/complete-session` - Mark session as completed
- ✅ `GET /api/admin/clients/[id]/sessions` - Fetch completed sessions with notes
- ✅ `GET /api/admin/clients/[id]/bookings?status=scheduled` - Fetch future bookings
- ✅ `POST /api/admin/bookings/[id]/session-notes` - Add notes to sessions (existing)

### 4. **Quick Start Script** (`scripts/generate-test-client.sh`)
- One-command test data generation
- Automatic validation of setup
- Clear success/error messages

### 5. **Documentation**
- `TESTING_RECURRING_CLIENTS.md` - Complete testing guide
- `INTEGRATION_SESSION_HISTORY.md` - How to integrate into UI
- `RECURRING_CLIENT_TEST_SUITE.md` - This file

## 🚀 Quick Start (30 seconds)

### Option 1: Using the Script
```bash
# Make sure you're in the project root
bash scripts/generate-test-client.sh
```

### Option 2: Manual Command
```bash
npx tsx lib/test-data-generator.ts
```

### Expected Output
```
🧪 Starting test data generation...
✓ Using existing clinic: New Giza (ID: 1)
✓ Using therapist: Sama Eissa (ID: 1, Rate: 3000 EGP/hr)
✓ Created client: Test Recurring Client (ID: 42)
✓ Created 5 completed sessions
✓ Added notes to 5 sessions
✓ Created 4 scheduled future sessions

✅ Test data generation complete!
```

## 📊 Test Data Structure

When you run the generator, it creates:

**Test Client:**
- Name: "Test Recurring Client"
- Email: "test.recurring@example.com"
- Status: `active` (fully set up)
- Is Recurring: `true`
- Payment Verified: Both tiers verified
- Sessions: 5 past + 4 future

**Past Sessions (Completed):**
- Status: `booking_status = 'completed'`
- Scheduled weekly (7 days apart)
- With therapist notes (randomly generated)
- Progress scores (3-5 stars)
- Session outcomes (positive)
- Going back in time from today

**Future Sessions (Scheduled):**
- Status: `booking_status = 'scheduled'`
- Payment status: `pending`
- Scheduled weekly going forward
- From tomorrow onwards
- Assigned to therapist

## 🧪 Testing Scenarios

### Scenario 1: View Session History
```bash
1. Run: bash scripts/generate-test-client.sh
2. Navigate to: /dashboard/clinical/clients
3. Find "Test Recurring Client"
4. Click to view details
5. [Future] Click "View Session History" button
6. See 5 completed sessions + 4 future sessions
```

### Scenario 2: Mark Session as Completed
```bash
# Get a booking ID from the test client
curl "http://localhost:3000/api/admin/clients/42/bookings?status=scheduled" \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Mark first future session as completed
curl -X POST "http://localhost:3000/api/admin/bookings/123/complete-session" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "notes": "Great session! Client showed significant progress.",
    "session_outcome": "positive",
    "progress_score": 5
  }'
```

### Scenario 3: Add Session Notes
```bash
# Add notes to a completed session
curl -X POST "http://localhost:3000/api/admin/bookings/123/session-notes" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "notes": "Discussed coping strategies for anxiety...",
    "session_outcome": "positive",
    "progress_score": 4
  }'
```

### Scenario 4: Test Recurring Client Workflow
1. Generate test data
2. View client status: should be "active"
3. Next action: "Book Session" (payment already verified)
4. Mark sessions as completed in sequence
5. Verify session count increments
6. Check session history for progression

## 📁 File Structure

```
SamaWellness-website/
├── lib/
│   └── test-data-generator.ts          ← Test data generator
├── app/
│   ├── dashboard/clinical/clients/
│   │   ├── SessionHistory.tsx          ← Session history modal
│   │   └── ClientActionButton.tsx      ← [Update needed]
│   └── api/admin/
│       ├── bookings/[id]/
│       │   ├── complete-session/
│       │   │   └── route.ts            ← Mark session completed
│       │   └── session-notes/
│       │       └── route.ts            ← Add notes (existing)
│       └── clients/[id]/
│           ├── sessions/
│           │   └── route.ts            ← Get completed sessions
│           └── bookings/
│               └── route.ts            ← Get all bookings [UPDATED]
├── scripts/
│   └── generate-test-client.sh         ← Quick start script
├── TESTING_RECURRING_CLIENTS.md        ← Testing guide
├── INTEGRATION_SESSION_HISTORY.md      ← Integration guide
└── RECURRING_CLIENT_TEST_SUITE.md      ← This file
```

## 🔧 Configuration

Edit the test data generator to customize:

```typescript
// lib/test-data-generator.ts

const defaultConfig: TestDataConfig = {
  clientName: 'Test Recurring Client',
  clientEmail: 'test.recurring@example.com',
  clientPhone: '+20 100 000 0001',
  therapistName: 'Sama Eissa',           // ← Change to your therapist
  clinicName: 'New Giza',                 // ← Change to your clinic
  pastSessionCount: 5,                    // ← Number of completed sessions
  futureSessionCount: 4,                  // ← Number of future sessions
  sessionFrequency: 'weekly',             // ← Or 'biweekly'
};
```

Then run the generator again to create a new client with your settings.

## 📊 Session Status Flow

```
Client States:
├── intake → assessment_pending → ready_for_booking → booking_scheduled → active → completed/inactive
└── For recurring: active → booking_scheduled → active (repeats)

Session/Booking Statuses:
├── scheduled  → Payment pending, waiting for session time
├── confirmed  → Payment received, ready for session
├── completed  → Session has occurred, notes recorded
├── cancelled  → Client cancelled
└── expired    → Booking expired without payment

Payment Statuses:
├── pending    → Not yet paid
├── paid       → Payment received
├── refunded   → Payment refunded
├── charged    → Additional charge (if therapist rate > initial payment)
└── cancelled  → Booking cancelled
```

## 🎓 Learning Paths

### Path 1: Basic Testing (15 minutes)
1. Run test data generator
2. View test client in clients list
3. Check client status and next action
4. View test data in Supabase

### Path 2: Full Workflow (45 minutes)
1. Run test data generator
2. View test client details
3. Mark several past sessions as complete
4. Add session notes to completed sessions
5. View session history with notes
6. Verify progress tracking

### Path 3: Advanced Integration (2 hours)
1. Complete "Full Workflow" path
2. Integrate SessionHistory modal into UI
3. Create custom test scenarios
4. Build therapist session log view
5. Add progress tracking dashboards

## 🐛 Troubleshooting

### Test data not appearing
**Solution:**
1. Check if clinic and therapist exist: `SELECT * FROM clinics; SELECT * FROM therapists;`
2. Verify therapist has `hourly_rate` set
3. Check Supabase for created records
4. Review console output for error messages

### API endpoints return 404
**Solution:**
1. Verify booking IDs exist in database
2. Check authentication token in cookies
3. Confirm client has sessions in database
4. Check Supabase Row Level Security policies

### SessionHistory component doesn't show
**Solution:**
1. Verify component is imported in ClientActionButton
2. Check that state for showing modal is managed
3. Verify props are passed correctly
4. Check browser console for React errors

## 📈 Testing Metrics

Track these metrics when testing recurring clients:

```
Performance:
- Time to generate test data: < 5 seconds
- Session history load time: < 1 second
- API response time: < 500ms

Coverage:
- Past sessions with complete notes
- Future sessions scheduled correctly
- Progress tracking accuracy
- Payment status transitions
- Client status updates

Validation:
- Session dates are correct (past is past, future is future)
- Therapist rates calculated correctly
- Payment amounts accurate
- Notes stored and retrieved properly
- Progress scores within valid range (1-5)
```

## 🎯 Next Steps

### Immediate (This Sprint)
- [ ] Integrate SessionHistory modal into ClientActionButton
- [ ] Test session completion workflow
- [ ] Verify progress tracking in UI

### Short-term (Next Sprint)
- [ ] Add form to mark sessions complete from UI
- [ ] Create therapist session log view
- [ ] Build session analytics dashboard
- [ ] Add session attendance tracking

### Medium-term (Future)
- [ ] Session video/notes attachment support
- [ ] Client feedback/satisfaction ratings
- [ ] Automated session reminders
- [ ] Progress reports generation
- [ ] Multi-client therapist schedule view

## 📞 Support

### Common Questions

**Q: Can I run the test generator multiple times?**
A: Yes! Each run creates a new test client. You can customize the config and create different scenarios.

**Q: What if I want to delete test data?**
A: In Supabase, delete from `bookings` and `clients` tables directly, or filter in queries by email domain.

**Q: Can I use this in production?**
A: No, it's strictly for development/testing. Test data is identifiable by the ".example.com" email domain.

**Q: How do I get real client session data?**
A: Create actual clients through the normal intake process, and they'll appear in session history once sessions occur.

## 📚 Resources

- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs
- React Hooks: https://react.dev/reference/react/hooks
- TypeScript: https://www.typescriptlang.org/docs/

## 📝 Summary

You now have a complete testing infrastructure for recurring clients:

✅ Automated test data generation
✅ Beautiful session history UI
✅ Comprehensive API endpoints
✅ Complete documentation
✅ Multiple testing scenarios
✅ Integration guides

Ready to test recurring client workflows and build out your session management system!
