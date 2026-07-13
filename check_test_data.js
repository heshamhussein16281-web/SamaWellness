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
  // Get client 125
  const { data: client } = await supabase.from('clients').select('*').eq('id', 125).single();
  console.log('\n📋 CLIENT 125:');
  console.log('  ID:', client.id);
  console.log('  Name:', client.name);
  console.log('  Status:', client.status);
  console.log('  Is Recurring:', client.is_recurring);
  console.log('  Total Sessions Completed:', client.total_sessions_completed);
  console.log('  Total Amount Paid:', client.total_amount_paid);
  console.log('  Session Payment Received:', client.session_payment_received);
  console.log('  Session Payment Amount:', client.session_payment_amount);
  console.log('  Session Payment Date:', client.session_payment_date);
  console.log('');

  // Get booking 216
  const { data: booking } = await supabase.from('bookings').select('*').eq('id', 216).single();
  console.log('📋 BOOKING 216:');
  console.log('  ID:', booking.id);
  console.log('  Session Date:', booking.session_date);
  console.log('  Booking Status:', booking.booking_status);
  console.log('  Payment Status:', booking.payment_status);
  console.log('');

  // Get all bookings for client 125
  const { data: allBookings } = await supabase.from('bookings').select('id,session_date,booking_status,payment_status').eq('client_id', 125);
  console.log('📋 ALL BOOKINGS FOR CLIENT 125:');
  allBookings.forEach(b => {
    console.log(`  - ID ${b.id}: ${b.session_date} | Status: ${b.booking_status} | Payment: ${b.payment_status}`);
  });
  console.log('');
})();
