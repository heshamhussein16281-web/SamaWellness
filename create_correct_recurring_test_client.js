/**
 * FLEXIBLE TEST CLIENT CREATOR
 *
 * Creates a recurring client with CUSTOMIZABLE PAST SESSIONS
 * Perfect for testing the full workflow without waiting for future dates
 *
 * USAGE:
 *   node create_correct_recurring_test_client.js [daysAgo] [numSessions]
 *
 * EXAMPLES:
 *   node create_correct_recurring_test_client.js
 *     → Creates client with 2 sessions: 14 days ago, 7 days ago
 *
 *   node create_correct_recurring_test_client.js 7 2
 *     → Creates client with 2 sessions: 7 days ago, 14 days ago
 *
 *   node create_correct_recurring_test_client.js 30 3
 *     → Creates client with 3 sessions: 30 days ago, 60 days ago, 90 days ago
 *
 *   node create_correct_recurring_test_client.js 1 5
 *     → Creates client with 5 sessions: 1 day ago, 8 days ago, 15 days ago, etc.
 *
 * DEFAULT: 14 days ago, 2 sessions (4000 EGP total)
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function createCorrectRecurringTestClient() {
  try {
    console.log('\n========================================');
    console.log('🧹 DELETING ALL TEST CLIENTS');
    console.log('========================================\n');

    // Find all test clients
    const { data: testClients } = await supabase
      .from('clients')
      .select('id, name')
      .or('name.ilike.%Test%,name.ilike.%Recurring%,name.ilike.%Fresh%,name.ilike.%Clean%');

    if (testClients && testClients.length > 0) {
      console.log(`Found ${testClients.length} test clients to delete:\n`);

      for (const client of testClients) {
        console.log(`  - Deleting: ${client.name} (ID: ${client.id})`);

        // Delete all related data
        await supabase.from('bookings').delete().eq('client_id', client.id);
        await supabase.from('payment_records').delete().eq('client_id', client.id);
        await supabase.from('payment_history').delete().eq('client_id', client.id);
        await supabase.from('clients').delete().eq('id', client.id);
      }
      console.log(`\n✓ Deleted ${testClients.length} test clients\n`);
    }

    console.log('========================================');
    console.log('✨ CREATING CORRECT RECURRING TEST CLIENT');
    console.log('========================================\n');

    // Find Haidy El Masry therapist
    console.log('🔍 Finding therapist: Haidy El Masry...');
    const { data: therapists } = await supabase
      .from('therapists')
      .select('id, name')
      .ilike('name', '%Haidy%El Masry%');

    if (!therapists || therapists.length === 0) {
      throw new Error('Therapist "Haidy El Masry" not found');
    }

    const therapistId = therapists[0].id;
    console.log(`✓ Found: ${therapists[0].name} (ID: ${therapistId})\n`);

    // Get clinic room
    console.log('🔍 Finding clinic room...');
    const { data: rooms } = await supabase
      .from('clinic_rooms')
      .select('id')
      .limit(1);

    const roomId = rooms[0].id;
    console.log(`✓ Using room ID: ${roomId}\n`);

    const timestamp = Date.now();

    // ============================================
    // CUSTOMIZE TEST DATES HERE
    // ============================================
    // Parse command line arguments for flexible testing
    const daysAgoFirstSession = parseInt(process.argv[2]) || 14; // Default: 14 days ago
    const numSessions = parseInt(process.argv[3]) || 2; // Default: 2 completed sessions

    console.log(`\n📅 Test Configuration:`);
    console.log(`   - Number of sessions: ${numSessions}`);
    console.log(`   - First session: ${daysAgoFirstSession} days ago`);
    console.log(`   - Each session spaced 7 days apart\n`);

    // Create RECURRING client with status 'recurring_client' (READY TO BOOK)
    // NOT 'booking_scheduled' (which means already has a booking)
    console.log('📝 Creating recurring client with completed sessions...');
    const { data: clients } = await supabase
      .from('clients')
      .insert([
        {
          name: `Test Recurring Client ${timestamp}`,
          email: `test-recurring-${timestamp}@example.com`,
          phone: `01009${timestamp % 100000}`,
          therapist_id: therapistId,
          stage: 'active',
          status: 'recurring_client', // ← CORRECT: 'recurring_client' = ready to book, NOT 'booking_scheduled'
          is_recurring: true,
          total_sessions_completed: numSessions,
          total_amount_paid: 2000 * numSessions,  // ← CALCULATED: sessions × 2000
          client_since: new Date().toISOString(),
        }
      ])
      .select();

    const clientId = clients[0].id;
    console.log(`✓ Client created (ID: ${clientId})\n`);

    // Create PAST completed sessions
    console.log(`📝 Creating ${numSessions} completed sessions in the past...`);
    const today = new Date();

    // Build array of sessions dynamically
    const sessionsToCreate = [];
    for (let i = 0; i < numSessions; i++) {
      const sessionDate = new Date(today);
      sessionDate.setDate(sessionDate.getDate() - (daysAgoFirstSession + i * 7)); // Each 7 days apart

      sessionsToCreate.push({
        client_id: clientId,
        therapist_id: therapistId,
        session_date: sessionDate.toISOString(),
        duration_minutes: 60,
        session_type: 'single',
        room_id: roomId,
        booking_status: 'completed',
        payment_status: 'paid',
        notes: `Session ${i + 1} - Completed and Paid (${sessionDate.toDateString()})`,
        created_at: sessionDate.toISOString(),
      });
    }

    const { data: bookings } = await supabase
      .from('bookings')
      .insert(sessionsToCreate)
      .select();

    console.log(`✓ Created ${numSessions} completed sessions\n`);

    console.log('========================================');
    console.log('✅ CORRECT TEST CLIENT READY!');
    console.log('========================================\n');

    console.log('Client Details:');
    console.log(`  ID: ${clientId}`);
    console.log(`  Name: Test Recurring Client ${timestamp}`);
    console.log(`  Email: test-recurring-${timestamp}@example.com`);
    console.log(`  Therapist: Haidy El Masry`);
    console.log(`  Status: recurring_client ✓ (Ready to Book)`);
    console.log(`  Is Recurring: Yes ✓`);
    console.log(`  Total Sessions Completed: ${numSessions} ✓`);
    console.log(`  Total Amount Paid: ${2000 * numSessions} EGP ✓ (from ${numSessions} completed sessions only)\n`);

    console.log('Completed Sessions:');
    bookings.forEach((b, i) => {
      console.log(`  ${i + 1}. Date: ${new Date(b.session_date).toDateString()}`);
      console.log(`     Status: COMPLETED, PAID\n`);
    });

    console.log('Ready to Test Full Workflow:');
    console.log(`  1. Go to Clients list and find: Test Recurring Client ${timestamp}`);
    console.log(`  2. Next Action should show: "Book Session" ✓`);
    console.log(`  3. Click "Book Session" to create the next session`);
    console.log(`  4. After booking: you'll see "Verify Payment" button`);
    console.log(`  5. Click "Verify Payment" for the new session`);
    console.log(`  6. After verification: paid should increase from ${2000 * numSessions} → ${2000 * (numSessions + 1)} EGP`);
    console.log(`  7. Test cancellation, refunds, rescheduling, etc.\n`);

    console.log('💡 Need different test scenarios?');
    console.log(`   Run with custom parameters:`);
    console.log(`     node create_correct_recurring_test_client.js 7 2    (7 days ago, 2 sessions)`);
    console.log(`     node create_correct_recurring_test_client.js 30 3   (30 days ago, 3 sessions)`);
    console.log(`     node create_correct_recurring_test_client.js 1 1    (1 day ago, 1 session)\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createCorrectRecurringTestClient();
