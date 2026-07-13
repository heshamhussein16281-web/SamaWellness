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
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .ilike('name', '%1783948747080%')
    .single();

  if (!client) {
    console.log('Client not found');
    return;
  }

  console.log('\n📋 CLIENT STATE:');
  console.log(`  ID: ${client.id}`);
  console.log(`  Name: ${client.name}`);
  console.log(`  Status: ${client.status}`);
  console.log(`  Total Amount Paid: ${client.total_amount_paid} EGP`);
  console.log(`  Is Recurring: ${client.is_recurring}`);
  console.log('\n💳 PAYMENT FLAGS (Critical for "Verify Payment" button):');
  console.log(`  session_payment_received: ${client.session_payment_received}`);
  console.log(`  session_payment_date: ${client.session_payment_date}`);
  console.log(`  session_payment_amount: ${client.session_payment_amount}`);

  if (client.session_payment_received === false) {
    console.log('\n✅ Flags are RESET - "Verify Payment" button should appear now!');
  } else {
    console.log('\n❌ Flags NOT reset - "Verify Payment" button won\'t appear');
    console.log('\nWould you like me to manually reset them? (They should have been reset by the cancellation)');
  }

  // Also check bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, session_date, booking_status, payment_status')
    .eq('client_id', client.id)
    .order('session_date', { ascending: false })
    .limit(5);

  console.log('\n📅 RECENT BOOKINGS:');
  bookings.forEach((b, i) => {
    const date = new Date(b.session_date).toDateString();
    console.log(`  ${i + 1}. ${date} - Status: ${b.booking_status}, Payment: ${b.payment_status}`);
  });
})();
