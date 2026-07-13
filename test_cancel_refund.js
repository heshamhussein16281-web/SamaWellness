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

async function testRefund() {
  try {
    console.log('\n========================================');
    console.log('🧪 TESTING REFUND DEDUCTION');
    console.log('========================================\n');

    // Get client 118's current state
    const { data: clientBefore, error: clientError } = await supabase
      .from('clients')
      .select('id, name, total_amount_paid, is_recurring')
      .eq('id', 118)
      .single();

    if (clientError) throw clientError;
    console.log('Before cancellation:');
    console.log(`  Client: ${clientBefore.name}`);
    console.log(`  Total Paid: ${clientBefore.total_amount_paid}\n`);

    // Get a paid booking for this client
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, session_date, payment_status, booking_status, therapist_id, duration_minutes')
      .eq('client_id', 118)
      .eq('payment_status', 'paid')
      .limit(1);

    if (bookingsError) throw bookingsError;
    if (!bookings || bookings.length === 0) {
      console.log('❌ No paid bookings found for client 118');
      console.log('Need to test with a client that has paid bookings.');
      return;
    }

    const booking = bookings[0];
    console.log(`Found paid booking to cancel:`);
    console.log(`  Booking ID: ${booking.id}`);
    console.log(`  Payment Status: ${booking.payment_status}`);
    console.log(`  Duration: ${booking.duration_minutes} min`);
    console.log(`  Therapist ID: ${booking.therapist_id}\n`);

    // Get therapist rate
    const { data: therapist, error: therapistError } = await supabase
      .from('therapists')
      .select('id, hourly_rate')
      .eq('id', booking.therapist_id)
      .single();

    let refundAmount = 2000;
    if (!therapistError && therapist) {
      const hourlyRate = therapist.hourly_rate || 2000;
      refundAmount = Math.round((hourlyRate / 60) * booking.duration_minutes);
      console.log(`Therapist rate: ${hourlyRate}/hour`);
      console.log(`Expected refund: ${refundAmount} EGP\n`);
    }

    // Now DELETE (cancel) the booking via API
    console.log('Calling DELETE to cancel booking and process refund...\n');
    const response = await fetch(`http://localhost:3000/api/admin/bookings/${booking.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason: 'Test cancellation' })
    });

    const result = await response.json();
    console.log(`API Response: ${response.status}`);
    if (!response.ok) {
      console.log('Error:', result.error);
      return;
    }
    console.log('Booking cancelled successfully\n');

    // Check client's new state
    const { data: clientAfter, error: clientAfterError } = await supabase
      .from('clients')
      .select('id, total_amount_paid')
      .eq('id', 118)
      .single();

    if (clientAfterError) throw clientAfterError;
    console.log('After cancellation:');
    console.log(`  Total Paid: ${clientAfter.total_amount_paid}`);
    console.log(`  Expected: ${clientBefore.total_amount_paid - refundAmount}`);
    console.log(`  Match: ${clientAfter.total_amount_paid === (clientBefore.total_amount_paid - refundAmount) ? '✅ YES' : '❌ NO'}\n`);

    if (clientAfter.total_amount_paid === clientBefore.total_amount_paid) {
      console.log('⚠️  PROBLEM: Refund was NOT deducted from client total!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRefund();
