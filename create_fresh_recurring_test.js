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

async function createFreshRecurring() {
  try {
    console.log('\n========================================');
    console.log('✨ CREATING FRESH RECURRING CLIENT FOR TESTING');
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

    // Create recurring client
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .insert([
        {
          name: `Fresh Recurring Test ${timestamp}`,
          email: `fresh-recurring-${timestamp}@example.com`,
          phone: `01007${timestamp % 100000}`,
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

    // Create 2 past completed bookings
    await supabase
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
      ]);

    // Create NEW pending booking
    const { data: newBooking, error: bookingError } = await supabase
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

    if (bookingError) throw bookingError;
    const bookingId = newBooking[0].id;

    console.log('✅ NEW FRESH RECURRING CLIENT CREATED!\n');
    console.log('Client Details:');
    console.log(`  Name: Fresh Recurring Test ${timestamp}`);
    console.log(`  ID: ${clientId}`);
    console.log(`  Email: fresh-recurring-${timestamp}@example.com`);
    console.log(`  Phone: 01007${timestamp % 100000}`);
    console.log(`  Therapist: Sara El Shakankiri`);
    console.log(`  Is Recurring: Yes`);
    console.log(`  Total Paid: EGP 4,000`);
    console.log(`  Completed Sessions: 2\n`);
    console.log('Pending Booking:');
    console.log(`  Booking ID: ${bookingId}`);
    console.log(`  Session: Jul 15, 2026 at 14:00`);
    console.log(`  Payment Status: PENDING\n`);
    console.log('Ready to test payment verification!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createFreshRecurring();
