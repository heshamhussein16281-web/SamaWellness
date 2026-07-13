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

async function setupCleanRecurringClient() {
  try {
    console.log('\n========================================');
    console.log('🧹 CLEANING UP OLD TEST CLIENTS');
    console.log('========================================\n');

    // Find and delete all test clients
    const { data: testClients, error: findError } = await supabase
      .from('clients')
      .select('id, name')
      .or('name.ilike.%Clean Recurring Test%,name.ilike.%Refund Test%');

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
      console.log('No old test clients found.\n');
    }

    console.log('========================================');
    console.log('✨ CREATING CLEAN RECURRING TEST CLIENT');
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

    // Create the client with 2 completed sessions and 4000 paid
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .insert([
        {
          name: `Clean Recurring Test ${timestamp}`,
          email: `clean-recurring-${timestamp}@example.com`,
          phone: `01009${timestamp % 100000}`,
          therapist_id: therapistId,
          stage: 'active',
          status: 'booking_scheduled',
          is_recurring: true,
          total_sessions_completed: 2,
          total_amount_paid: 4000, // ← 2 sessions × 2000 each
          client_since: new Date().toISOString(),
        }
      ])
      .select();

    if (clientError) throw clientError;
    const clientId = clients[0].id;
    console.log(`✓ Client created (ID: ${clientId})\n`);

    console.log('📝 Creating 2 completed bookings and 1 future booking (for testing)...');

    // Create 2 past completed bookings + 1 future booking
    const session1Date = '2026-07-05T10:00:00';
    const session2Date = '2026-07-12T10:00:00';
    const futureSessionDate = '2026-07-25T14:00:00';

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
          notes: 'Session 1 - Completed',
          created_at: '2026-07-05T08:00:00',
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
          notes: 'Session 2 - Completed',
          created_at: '2026-07-12T08:00:00',
        },
        {
          client_id: clientId,
          therapist_id: therapistId,
          session_date: futureSessionDate,
          duration_minutes: 60,
          session_type: 'single',
          room_id: roomId,
          booking_status: 'scheduled',
          payment_status: 'pending',
          notes: 'Session 3 - Pending Payment Verification (for testing)',
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (bookingsError) throw bookingsError;
    const futureBookingId = bookings.find(b => b.session_date.includes('2026-07-25')).id;
    console.log(`✓ Created 2 completed bookings + 1 future booking (ID: ${futureBookingId})\n`);

    console.log('========================================');
    console.log('✅ SETUP COMPLETE!');
    console.log('========================================\n');
    console.log('Recurring Client Details:');
    console.log(`  Name: Clean Recurring Test ${timestamp}`);
    console.log(`  ID: ${clientId}`);
    console.log(`  Email: clean-recurring-${timestamp}@example.com`);
    console.log(`  Phone: 01009${timestamp % 100000}`);
    console.log(`  Therapist: Sara El Shakankiri`);
    console.log(`  Status: booking_scheduled`);
    console.log(`  Is Recurring: Yes`);
    console.log(`  Total Sessions Completed: 2 ✓`);
    console.log(`  Total Amount Paid: EGP 4,000 ✓\n`);
    console.log('Completed Bookings:');
    console.log(`  - Session 1: Jul 5, 10:00 AM (COMPLETED, PAID)`);
    console.log(`  - Session 2: Jul 12, 10:00 AM (COMPLETED, PAID)\n`);
    console.log('Test Booking (for verification/refund testing):');
    console.log(`  Booking ID: ${futureBookingId}`);
    console.log(`  Session Date: Jul 25, 2026 @ 2:00 PM`);
    console.log(`  Payment Status: PENDING\n`);
    console.log('Ready to test:');
    console.log(`  1. Verify payment for Session 3 (should change total_amount_paid from 4000 → 6000)`);
    console.log(`  2. Cancel Session 3 and verify refund (should change total_amount_paid from 6000 → 4000)`);
    console.log(`  3. Create Session 4 and verify payment works again\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupCleanRecurringClient();
