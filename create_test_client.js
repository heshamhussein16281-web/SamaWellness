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

async function createTestClient() {
  try {
    // Get a valid user ID first
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (userError || !users || users.length === 0) {
      throw new Error('Could not find a valid user');
    }

    const markedByUserId = users[0].id;
    const clientId = 73;
    const therapistId = 88;
    
    const { error: paymentError } = await supabase
      .from('payment_records')
      .insert([
        {
          client_id: clientId,
          therapist_id: therapistId,
          booking_id: 99,
          amount_paid: 2000,
          payment_date: '2026-06-20T14:00:00',
          marked_by_user_id: markedByUserId,
        },
        {
          client_id: clientId,
          therapist_id: therapistId,
          booking_id: 100,
          amount_paid: 2000,
          payment_date: '2026-06-27T14:00:00',
          marked_by_user_id: markedByUserId,
        }
      ]);

    if (paymentError) throw paymentError;
    
    console.log('\n✅ TEST CLIENT SETUP COMPLETE!\n');
    console.log('Client Details:');
    console.log('  Name: Fresh Test Client (ID: 73)');
    console.log('  Phone: 0100555666');
    console.log('  Email: fresh-test@example.com');
    console.log('  Therapist: Sara El Shakankiri');
    console.log('  Status: booking_scheduled');
    console.log('  Completed Sessions: 2 (Jun 20, Jun 27)');
    console.log('  Total Paid: $4,000 (2 × $2,000)\n');
    console.log('Ready to test the full cycle:');
    console.log('  1. Click "Fresh Test Client" in the Clients list');
    console.log('  2. Click "RESCHEDULE OR CANCEL" to book a new session');
    console.log('  3. Verify booking amount shows $2,000');
    console.log('  4. Reschedule the booking');
    console.log('  5. Check booking history in View Profile');
    console.log('  6. Cancel another booking');
    console.log('  7. Verify cancellation shows in history');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestClient();
