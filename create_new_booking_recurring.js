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

async function createNewBooking() {
  try {
    console.log('\n========================================');
    console.log('📅 CREATING NEW BOOKING FOR RECURRING CLIENT');
    console.log('========================================\n');

    const clientId = 116;
    const therapistId = 88;

    // Get clinic room
    const { data: rooms, error: roomError } = await supabase
      .from('clinic_rooms')
      .select('id')
      .limit(1);

    if (roomError || !rooms || rooms.length === 0) {
      throw new Error('No clinic rooms found');
    }

    const roomId = rooms[0].id;

    // Create a new booking for July 15 (future date)
    const { data: booking, error: bookingError } = await supabase
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

    console.log('✅ NEW BOOKING CREATED!\n');
    console.log('Booking Details:');
    console.log(`  Booking ID: ${booking[0].id}`);
    console.log(`  Client ID: ${clientId}`);
    console.log(`  Therapist ID: ${therapistId}`);
    console.log(`  Session Date: 2026-07-15 at 14:00`);
    console.log(`  Status: scheduled`);
    console.log(`  Payment Status: pending\n`);
    console.log('Ready to test:');
    console.log(`  1. Go to dashboard and view Recurring Test Client 116`);
    console.log(`  2. Scroll to Bookings section`);
    console.log(`  3. Find the pending booking (Jul 15)`);
    console.log(`  4. Click "Verify Payment"`);
    console.log(`  5. Enter date and confirm`);
    console.log(`  6. Check Total Paid updates and Payment History shows 3 sessions\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createNewBooking();
