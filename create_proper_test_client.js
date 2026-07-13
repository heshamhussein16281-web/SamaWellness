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

async function createProperTestClient() {
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
    console.log('✨ CREATING PROPER TEST CLIENT');
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

    // Create client with EXACTLY 2 sessions paid (4000 EGP total)
    console.log('📝 Creating recurring client with 2 completed sessions...');
    const { data: clients } = await supabase
      .from('clients')
      .insert([
        {
          name: `Test Recurring Client ${timestamp}`,
          email: `test-recurring-${timestamp}@example.com`,
          phone: `01009${timestamp % 100000}`,
          therapist_id: therapistId,
          stage: 'active',
          status: 'booking_scheduled',
          is_recurring: true,
          total_sessions_completed: 2,
          total_amount_paid: 4000,  // ← EXACTLY 2 sessions × 2000
          client_since: new Date().toISOString(),
        }
      ])
      .select();

    const clientId = clients[0].id;
    console.log(`✓ Client created (ID: ${clientId})\n`);

    // Create 2 PAST completed sessions
    console.log('📝 Creating 2 completed sessions in the past...');
    const today = new Date();
    const session1Date = new Date(today);
    session1Date.setDate(session1Date.getDate() - 14); // 14 days ago

    const session2Date = new Date(today);
    session2Date.setDate(session2Date.getDate() - 7); // 7 days ago

    const { data: bookings } = await supabase
      .from('bookings')
      .insert([
        {
          client_id: clientId,
          therapist_id: therapistId,
          session_date: session1Date.toISOString(),
          duration_minutes: 60,
          session_type: 'single',
          room_id: roomId,
          booking_status: 'completed',
          payment_status: 'paid',
          notes: 'Session 1 - Completed and Paid',
          created_at: session1Date.toISOString(),
        },
        {
          client_id: clientId,
          therapist_id: therapistId,
          session_date: session2Date.toISOString(),
          duration_minutes: 60,
          session_type: 'single',
          room_id: roomId,
          booking_status: 'completed',
          payment_status: 'paid',
          notes: 'Session 2 - Completed and Paid',
          created_at: session2Date.toISOString(),
        }
      ])
      .select();

    console.log(`✓ Created 2 completed sessions\n`);

    console.log('========================================');
    console.log('✅ PROPER TEST CLIENT READY!');
    console.log('========================================\n');

    console.log('Client Details:');
    console.log(`  ID: ${clientId}`);
    console.log(`  Name: Test Recurring Client ${timestamp}`);
    console.log(`  Email: test-recurring-${timestamp}@example.com`);
    console.log(`  Therapist: Haidy El Masry`);
    console.log(`  Status: booking_scheduled ✓`);
    console.log(`  Is Recurring: Yes ✓`);
    console.log(`  Total Sessions Completed: 2 ✓`);
    console.log(`  Total Amount Paid: 4000 EGP ✓ (from 2 completed sessions only)\n`);

    console.log('Completed Sessions:');
    bookings.forEach((b, i) => {
      console.log(`  ${i + 1}. Date: ${new Date(b.session_date).toDateString()}`);
      console.log(`     Status: COMPLETED, PAID\n`);
    });

    console.log('Ready to Test:');
    console.log(`  1. Go to Clients list and find: Test Recurring Client ${timestamp}`);
    console.log(`  2. Verify you see: status=booking_scheduled, paid=4000`);
    console.log(`  3. Click "Verify Payment" for the next session`);
    console.log(`  4. After verification: paid should be 6000 (4000 + 2000)\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createProperTestClient();
