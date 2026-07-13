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

(async () => {
  const clientId = 123;
  const therapistId = 88;

  console.log('\n========================================');
  console.log('📝 CREATING NEW PENDING PAYMENT BOOKING');
  console.log('========================================\n');

  // Get clinic room
  const { data: rooms } = await supabase
    .from('clinic_rooms')
    .select('id')
    .limit(1);

  const roomId = rooms[0].id;

  // Create a future booking with PENDING payment status
  const futureDate = '2026-07-28T15:00:00'; // Future date for testing

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert([
      {
        client_id: clientId,
        therapist_id: therapistId,
        session_date: futureDate,
        duration_minutes: 60,
        session_type: 'single',
        room_id: roomId,
        booking_status: 'scheduled',
        payment_status: 'pending',  // ← NOT YET PAID
        notes: 'Session 4 - Pending Payment Verification (for testing)',
        created_at: new Date().toISOString(),
      }
    ])
    .select();

  if (error) {
    console.error('❌ Error creating booking:', error);
    return;
  }

  console.log('✅ NEW BOOKING CREATED!');
  console.log('');
  console.log('Client Details:');
  console.log('  ID: 123');
  console.log('  Name: Recurring Test Client 1783929501938');
  console.log('  Current Total Paid: 6000 EGP');
  console.log('  Current Sessions Completed: 2');
  console.log('');
  console.log('New Booking Details:');
  console.log(`  ID: ${booking.id}`);
  console.log(`  Date: Jul 28, 2026 @ 3:00 PM`);
  console.log(`  Payment Status: PENDING (ready for verification)`);
  console.log('');
  console.log('Ready to Test:');
  console.log(`  1. Go to Clients list and find: Recurring Test Client 1783929501938`);
  console.log(`  2. Click "Verify Payment" button`);
  console.log(`  3. Confirm payment for booking ${booking.id}`);
  console.log(`  4. Check that total_amount_paid changes from 6000 → 8000 EGP`);
  console.log('');
})();
