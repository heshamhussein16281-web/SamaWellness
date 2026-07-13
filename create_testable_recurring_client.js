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

/**
 * FLEXIBLE TEST CLIENT CREATOR
 *
 * This creates a recurring client with customizable past sessions
 * so you can test the full workflow immediately without waiting for future dates.
 *
 * USAGE:
 *   node create_testable_recurring_client.js [daysAgo] [numSessions]
 *
 * EXAMPLES:
 *   node create_testable_recurring_client.js 7 2
 *     → Creates client with 2 sessions: 7 days ago and 14 days ago
 *
 *   node create_testable_recurring_client.js 30 3
 *     → Creates client with 3 sessions: 30, 60, 90 days ago
 *
 *   node create_testable_recurring_client.js
 *     → Uses defaults: 7 days ago, 2 sessions
 */

// Parse command line arguments
const daysAgoFirstSession = parseInt(process.argv[2]) || 7;
const numSessions = parseInt(process.argv[3]) || 2;

console.log(`\n📅 Creating test client with:`);
console.log(`   - ${numSessions} completed sessions`);
console.log(`   - First session: ${daysAgoFirstSession} days ago`);
console.log(`   - Spaced 7 days apart`);
console.log('');

async function createTestableRecurringClient() {
  try {
    console.log('========================================');
    console.log('🧹 CLEANING UP OLD TEST CLIENTS');
    console.log('========================================\n');

    // Find all test clients
    const { data: testClients } = await supabase
      .from('clients')
      .select('id, name')
      .or('name.ilike.%Test%,name.ilike.%Recurring%,name.ilike.%Fresh%,name.ilike.%Clean%,name.ilike.%Testable%');

    if (testClients && testClients.length > 0) {
      console.log(`Found ${testClients.length} test clients to delete:\n`);

      for (const client of testClients) {
        console.log(`  - Deleting: ${client.name} (ID: ${client.id})`);
        await supabase.from('bookings').delete().eq('client_id', client.id);
        await supabase.from('payment_records').delete().eq('client_id', client.id);
        await supabase.from('payment_history').delete().eq('client_id', client.id);
        await supabase.from('clients').delete().eq('id', client.id);
      }
      console.log(`\n✓ Deleted ${testClients.length} test clients\n`);
    }

    console.log('========================================');
    console.log('✨ CREATING TESTABLE RECURRING CLIENT');
    console.log('========================================\n');

    // Find Haidy El Masry therapist
    console.log('🔍 Finding therapist: Haidy El Masry...');
    const { data: therapists } = await supabase
      .from('therapists')
      .select('id, name, rate')
      .ilike('name', '%Haidy%El Masry%');

    if (!therapists || therapists.length === 0) {
      throw new Error('Therapist "Haidy El Masry" not found');
    }

    const therapistId = therapists[0].id;
    const therapistRate = therapists[0].rate || 2000;
    console.log(`✓ Found: ${therapists[0].name} (ID: ${therapistId}, Rate: ${therapistRate} EGP)\n`);

    // Get clinic room
    console.log('🔍 Finding clinic room...');
    const { data: rooms } = await supabase
      .from('clinic_rooms')
      .select('id')
      .limit(1);

    const roomId = rooms[0].id;
    console.log(`✓ Using room ID: ${roomId}\n`);

    const timestamp = Date.now();
    const totalPaid = therapistRate * numSessions;

    // Create recurring client ready to book
    console.log(`📝 Creating recurring client (status: recurring_client)...`);
    const { data: clients } = await supabase
      .from('clients')
      .insert([
        {
          name: `Testable Client ${timestamp}`,
          email: `testable-${timestamp}@example.com`,
          phone: `01009${timestamp % 100000}`,
          therapist_id: therapistId,
          stage: 'active',
          status: 'recurring_client', // ← Ready to book next session
          is_recurring: true,
          total_sessions_completed: numSessions,
          total_amount_paid: totalPaid, // ← All sessions already paid
          client_since: new Date().toISOString(),
        }
      ])
      .select();

    const clientId = clients[0].id;
    console.log(`✓ Client created (ID: ${clientId})\n`);

    // Create past completed sessions
    console.log(`📝 Creating ${numSessions} completed sessions in the past...\n`);

    const bookingsToCreate = [];
    const today = new Date();

    for (let i = 0; i < numSessions; i++) {
      const sessionDate = new Date(today);
      // Each session is 7 days apart, starting from daysAgoFirstSession
      sessionDate.setDate(sessionDate.getDate() - (daysAgoFirstSession + i * 7));

      bookingsToCreate.push({
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
      .insert(bookingsToCreate)
      .select();

    console.log(`✓ Created ${numSessions} completed sessions\n`);

    console.log('========================================');
    console.log('✅ TESTABLE CLIENT READY!');
    console.log('========================================\n');

    console.log('Client Details:');
    console.log(`  ID: ${clientId}`);
    console.log(`  Name: Testable Client ${timestamp}`);
    console.log(`  Email: testable-${timestamp}@example.com`);
    console.log(`  Therapist: Haidy El Masry (${therapistRate} EGP/session)`);
    console.log(`  Status: recurring_client ✓ (Ready to Book)`);
    console.log(`  Is Recurring: Yes ✓`);
    console.log(`  Total Sessions Completed: ${numSessions} ✓`);
    console.log(`  Total Amount Paid: ${totalPaid} EGP ✓\n`);

    console.log('Completed Sessions:');
    bookings.forEach((b, i) => {
      const dateStr = new Date(b.session_date).toDateString();
      const timeStr = new Date(b.session_date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      console.log(`  ${i + 1}. Date: ${dateStr} @ ${timeStr}`);
      console.log(`     Status: COMPLETED, PAID\n`);
    });

    console.log('🎯 NOW YOU CAN TEST THE FULL FLOW:');
    console.log(`  1. Go to Clients → Testable Client ${timestamp}`);
    console.log(`  2. Next Action: "Book Session" (will create 3rd booking)`);
    console.log(`  3. Click "Book Session" to create the next session`);
    console.log(`  4. After booking: "Verify Payment" button appears`);
    console.log(`  5. Click "Verify Payment" for the new session`);
    console.log(`  6. Paid amount should increase from ${totalPaid} → ${totalPaid + therapistRate} EGP`);
    console.log(`  7. Test cancellation, refunds, rescheduling, etc.`);
    console.log(`\n💡 Need more test scenarios?`);
    console.log(`   - Run again with different parameters:`);
    console.log(`     node create_testable_recurring_client.js 14 3`);
    console.log(`     (Creates 3 sessions starting 14 days ago)\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestableRecurringClient();
