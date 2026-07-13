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

async function setupNewRecurringClient() {
  try {
    console.log('\n========================================');
    console.log('🗑️  DELETING OLD RECURRING CLIENT (116)');
    console.log('========================================\n');

    // Delete bookings for client 116
    await supabase
      .from('bookings')
      .delete()
      .eq('client_id', 116);

    // Delete payment records
    await supabase
      .from('payment_records')
      .delete()
      .eq('client_id', 116);

    // Delete client 116
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', 116);

    if (!deleteError) {
      console.log('✓ Deleted client 116 and all related data\n');
    }

    console.log('========================================');
    console.log('✨ CREATING NEW RECURRING CLIENT');
    console.log('========================================\n');

    const therapistId = 88; // Sara El Shakankiri
    const timestamp = Date.now();

    // Get clinic room
    console.log('🔍 Finding clinic room...');
    const { data: rooms, error: roomError } = await supabase
      .from('clinic_rooms')
      .select('id')
      .limit(1);

    if (roomError || !rooms || rooms.length === 0) {
      throw new Error('No clinic rooms found');
    }

    const roomId = rooms[0].id;
    console.log(`✓ Using room ID: ${roomId}\n`);

    // Create recurring client
    console.log('📝 Creating new recurring client...');
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .insert([
        {
          name: `Recurring Client ${timestamp}`,
          email: `recurring-${timestamp}@example.com`,
          phone: `01008${timestamp % 100000}`,
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
    console.log('📝 Creating 2 past completed sessions...');
    const { data: pastBookings, error: pastBookingsError } = await supabase
      .from('bookings')
      .insert([
        {
          client_id: clientId,
          therapist_id: therapistId,
          session_date: '2026-07-01T10:00:00',
          duration_minutes: 60,
          session_type: 'single',
          room_id: roomId,
          booking_status: 'completed',
          payment_status: 'paid',
          status: 'scheduled',
          notes: 'Session 1 - Completed',
          created_at: '2026-07-01T08:00:00',
        },
        {
          client_id: clientId,
          therapist_id: therapistId,
          session_date: '2026-07-08T10:00:00',
          duration_minutes: 60,
          session_type: 'single',
          room_id: roomId,
          booking_status: 'completed',
          payment_status: 'paid',
          status: 'scheduled',
          notes: 'Session 2 - Completed',
          created_at: '2026-07-08T08:00:00',
        }
      ])
      .select();

    if (pastBookingsError) throw pastBookingsError;
    console.log(`✓ Created 2 past completed bookings\n`);

    // Create NEW pending booking for payment testing
    console.log('📝 Creating NEW pending booking...');
    const { data: newBooking, error: newBookingError } = await supabase
      .from('bookings')
      .insert([
        {
          client_id: clientId,
          therapist_id: therapistId,
          session_date: '2026-07-15T14:00:00',
          duration_minutes: 60,
          session_type: 'single',
          room_id: roomId,
          booking_status: 'scheduled',
          payment_status: 'pending',
          status: 'scheduled',
          notes: 'Session 3 - Ready for payment verification',
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (newBookingError) throw newBookingError;
    const bookingId = newBooking[0].id;
    console.log(`✓ Created pending booking (ID: ${bookingId})\n`);

    console.log('========================================');
    console.log('✅ SETUP COMPLETE!');
    console.log('========================================\n');
    console.log('Recurring Client Details:');
    console.log(`  Name: Recurring Client ${timestamp}`);
    console.log(`  ID: ${clientId}`);
    console.log(`  Email: recurring-${timestamp}@example.com`);
    console.log(`  Phone: 01008${timestamp % 100000}`);
    console.log(`  Therapist: Sara El Shakankiri`);
    console.log(`  Status: booking_scheduled`);
    console.log(`  Is Recurring: Yes`);
    console.log(`  Completed Sessions: 2`);
    console.log(`  Total Paid: EGP 4,000\n`);
    console.log('New Pending Booking:');
    console.log(`  Booking ID: ${bookingId}`);
    console.log(`  Session Date: Jul 15, 2026 at 14:00`);
    console.log(`  Status: scheduled`);
    console.log(`  Payment Status: pending\n`);
    console.log('Ready to test:');
    console.log(`  1. Go to Clients dashboard`);
    console.log(`  2. Find "Recurring Client ${timestamp}" (ID: ${clientId})`);
    console.log(`  3. Scroll to Bookings section`);
    console.log(`  4. Find the PENDING booking (Jul 15)`);
    console.log(`  5. Click "Verify Payment"`);
    console.log(`  6. Enter date and confirm`);
    console.log(`  7. Check Total Paid updates to EGP 6,000`);
    console.log(`  8. Check Payment History shows all sessions\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupNewRecurringClient();
