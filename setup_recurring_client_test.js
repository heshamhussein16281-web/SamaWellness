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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupRecurringClientTest() {
  try {
    console.log('\n========================================');
    console.log('🧹 CLEANING UP TEST CLIENTS');
    console.log('========================================\n');

    // Find and delete all test clients
    const { data: testClients, error: findError } = await supabase
      .from('clients')
      .select('id, name')
      .or('name.ilike.%Test Client%,name.ilike.%Fresh Test%,name.ilike.%RQ Fix%,name.ilike.%React Query%');

    if (findError) throw findError;

    if (testClients && testClients.length > 0) {
      console.log(`Found ${testClients.length} test clients to delete:\n`);

      for (const client of testClients) {
        console.log(`  - Deleting: ${client.name} (ID: ${client.id})`);

        // Delete bookings first
        await supabase
          .from('bookings')
          .delete()
          .eq('client_id', client.id);

        // Delete payment history
        await supabase
          .from('payment_history')
          .delete()
          .eq('client_id', client.id);

        // Delete payment records
        await supabase
          .from('payment_records')
          .delete()
          .eq('client_id', client.id);

        // Delete client
        await supabase
          .from('clients')
          .delete()
          .eq('id', client.id);
      }
      console.log(`\n✓ Deleted ${testClients.length} test clients and all related data\n`);
    } else {
      console.log('No test clients found.\n');
    }

    console.log('========================================');
    console.log('✨ CREATING RECURRING TEST CLIENT');
    console.log('========================================\n');

    const therapistId = 88; // Sara El Shakankiri
    const timestamp = Date.now();

    // Get first clinic room
    console.log('🔍 Finding a clinic room...');
    const { data: rooms, error: roomError } = await supabase
      .from('clinic_rooms')
      .select('id')
      .limit(1);

    if (roomError || !rooms || rooms.length === 0) {
      throw new Error('No clinic rooms found');
    }

    const roomId = rooms[0].id;
    console.log(`✓ Using room ID: ${roomId}\n`);

    console.log('📝 Creating recurring client with 2 completed sessions...');

    // Create the client
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .insert([
        {
          name: `Recurring Test Client ${timestamp}`,
          email: `recurring-test-${timestamp}@example.com`,
          phone: `01009${timestamp % 100000}`,
          therapist_id: therapistId,
          stage: 'active',
          status: 'booking_scheduled',
          is_recurring: true,
          total_sessions_completed: 2,
          total_amount_paid: 4000,
          client_since: '2026-06-15T00:00:00+00:00',
        }
      ])
      .select();

    if (clientError) throw clientError;
    const clientId = clients[0].id;
    console.log(`✓ Client created (ID: ${clientId})\n`);

    // Create 2 completed bookings
    console.log('📝 Creating 2 completed bookings with payment history...');
    const session1Date = '2026-07-01T10:00:00';
    const session2Date = '2026-07-08T10:00:00';

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .insert([
        {
          client_id: clientId,
          therapist_id: therapistId,
          session_date: session1Date,
          duration_minutes: 60,
          session_type: 'single',
          room_id: roomId,
          booking_status: 'completed',
          payment_status: 'paid',
          notes: 'Session 1 - Completed and Paid',
          created_at: '2026-07-01T08:00:00',
        },
        {
          client_id: clientId,
          therapist_id: therapistId,
          session_date: session2Date,
          duration_minutes: 60,
          session_type: 'single',
          room_id: roomId,
          booking_status: 'completed',
          payment_status: 'paid',
          notes: 'Session 2 - Completed and Paid',
          created_at: '2026-07-08T08:00:00',
        }
      ])
      .select();

    if (bookingsError) throw bookingsError;
    console.log(`✓ Created ${bookings?.length || 0} completed bookings\n`);

    // Create payment history entries
    console.log('📝 Creating payment history...');
    const { error: paymentHistoryError } = await supabase
      .from('payment_history')
      .insert([
        {
          client_id: clientId,
          amount: 2000,
          payment_date: '2026-07-01',
          payment_type: 'session',
          verified: true,
          verified_by: '1',
          verified_at: '2026-07-01T09:00:00',
          notes: 'Session 1 payment verification',
        },
        {
          client_id: clientId,
          amount: 2000,
          payment_date: '2026-07-08',
          payment_type: 'session',
          verified: true,
          verified_by: '1',
          verified_at: '2026-07-08T09:00:00',
          notes: 'Session 2 payment verification',
        }
      ]);

    if (paymentHistoryError) {
      console.warn('⚠️  Warning creating payment history:', paymentHistoryError.message);
    } else {
      console.log(`✓ Created payment history entries\n`);
    }

    console.log('========================================');
    console.log('✅ SETUP COMPLETE!');
    console.log('========================================\n');
    console.log('Recurring Client Details:');
    console.log(`  Name: Recurring Test Client ${timestamp}`);
    console.log(`  ID: ${clientId}`);
    console.log(`  Email: recurring-test-${timestamp}@example.com`);
    console.log(`  Phone: 01009${timestamp % 100000}`);
    console.log(`  Therapist: Sara El Shakankiri`);
    console.log(`  Status: booking_scheduled`);
    console.log(`  Is Recurring: Yes`);
    console.log(`  Completed Sessions: 2`);
    console.log(`  Total Paid: EGP 4,000\n`);
    console.log('Ready to test:');
    console.log(`  1. Go to Clients list and find: Recurring Test Client ${timestamp}`);
    console.log(`  2. View client profile and check Payment History tab`);
    console.log(`  3. Create a new booking for this client`);
    console.log(`  4. Verify payment for the new session`);
    console.log(`  5. Check Payment History shows all 3 sessions\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupRecurringClientTest();
