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
  // Find client by name pattern
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .ilike('name', '%Recurring Test Client 1783929501938%');

  if (!clients || clients.length === 0) {
    console.log('❌ Client not found');
    return;
  }

  const client = clients[0];
  console.log('\n📋 CLIENT FOUND:');
  console.log('  ID:', client.id);
  console.log('  Name:', client.name);
  console.log('  Status:', client.status);
  console.log('  Is Recurring:', client.is_recurring);
  console.log('  Therapist ID:', client.therapist_id);
  console.log('  Total Sessions Completed:', client.total_sessions_completed);
  console.log('  Total Amount Paid:', client.total_amount_paid);
  console.log('  Session Payment Received:', client.session_payment_received);
  console.log('  Session Payment Amount:', client.session_payment_amount);
  console.log('');

  // Get all bookings for this client
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, session_date, booking_status, payment_status')
    .eq('client_id', client.id);

  console.log('📋 BOOKINGS:');
  if (bookings && bookings.length > 0) {
    bookings.forEach((b, i) => {
      console.log(`  ${i + 1}. ID: ${b.id}`);
      console.log(`     Date: ${b.session_date}`);
      console.log(`     Booking Status: ${b.booking_status}`);
      console.log(`     Payment Status: ${b.payment_status}`);
    });
  } else {
    console.log('  No bookings found');
  }
  console.log('');

  // Check if there's a pending payment booking available for testing
  const pendingPaymentBooking = bookings?.find(b => b.payment_status === 'pending');
  if (pendingPaymentBooking) {
    console.log('✅ READY FOR TESTING:');
    console.log(`   Booking ID ${pendingPaymentBooking.id} has pending payment status`);
    console.log(`   Session Date: ${pendingPaymentBooking.session_date}`);
  } else {
    console.log('⚠️  No bookings with pending payment status');
    console.log('   You may need to create a new booking for this client first');
  }
})();
