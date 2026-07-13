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

async function setupRefundTestClients() {
  try {
    console.log('\n========================================');
    console.log('✨ CREATING FRESH REFUND TEST CLIENTS');
    console.log('========================================\n');

    const therapistId = 88; // Sara El Shakankiri
    const timestamp = Date.now();

    // Get clinic room
    const { data: rooms, error: roomError } = await supabase
      .from('clinic_rooms')
      .select('id')
      .limit(1);

    if (roomError || !rooms || rooms.length === 0) {
      throw new Error('No clinic rooms found');
    }

    const roomId = rooms[0].id;

    // Create 3 fresh recurring clients for refund testing
    const clients = [];
    for (let i = 1; i <= 3; i++) {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([
          {
            name: `Refund Test Client ${i} - ${timestamp}`,
            email: `refund-test-${i}-${timestamp}@example.com`,
            phone: `01006${timestamp % 100000}`,
            therapist_id: therapistId,
            stage: 'active',
            status: 'booking_scheduled',
            is_recurring: true,
            total_sessions_completed: 0,
            total_amount_paid: 2000, // Already paid for 1 session
            client_since: '2026-06-15T00:00:00+00:00',
          }
        ])
        .select();

      if (clientError) throw clientError;
      const clientId = clientData[0].id;
      clients.push({ id: clientId, name: clientData[0].name });

      // Create 1 PAID booking ready to cancel and refund
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            client_id: clientId,
            therapist_id: therapistId,
            session_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            duration_minutes: 60,
            session_type: 'single',
            room_id: roomId,
            booking_status: 'scheduled',
            payment_status: 'paid',
            status: 'scheduled',
            notes: `Refund test booking #${i} - Ready to cancel`,
            created_at: new Date().toISOString(),
          }
        ])
        .select();

      if (bookingError) throw bookingError;
      console.log(`✓ Client ${i}: ${clientData[0].name}`);
      console.log(`  ID: ${clientId}`);
      console.log(`  Booking ID: ${bookingData[0].id} (PAID - Ready to cancel)`);
      console.log(`  Total Paid: 2000 EGP\n`);
    }

    console.log('========================================');
    console.log('✅ SETUP COMPLETE!');
    console.log('========================================\n');
    console.log('3 Fresh Recurring Clients Created:\n');
    clients.forEach((client, idx) => {
      console.log(`${idx + 1}. ${client.name}`);
      console.log(`   ID: ${client.id}`);
      console.log(`   Status: booking_scheduled`);
      console.log(`   Total Paid: 2000 EGP`);
      console.log(`   Action: CANCEL the paid booking to test refund\n`);
    });
    console.log('Test Steps:');
    console.log('  1. Go to dashboard → find one of the refund test clients');
    console.log('  2. Find the PAID booking (status should show "paid")');
    console.log('  3. Cancel the booking');
    console.log('  4. Check if Total Paid reduces from 2000 → 0');
    console.log('  5. Check if payment_status changes to "refunded"\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupRefundTestClients();
