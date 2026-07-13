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
  console.log('\n🔧 RESETTING PAYMENT FLAGS FOR CLIENT 1783948747080...\n');

  const { data: client, error: fetchError } = await supabase
    .from('clients')
    .select('id')
    .ilike('name', '%1783948747080%')
    .single();

  if (fetchError || !client) {
    console.log('❌ Client not found');
    return;
  }

  console.log(`Found client ID: ${client.id}`);
  console.log('Resetting payment flags...\n');

  const { data: updated, error: updateError } = await supabase
    .from('clients')
    .update({
      session_payment_received: false,
      session_payment_date: null,
      session_payment_amount: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', client.id)
    .select();

  if (updateError) {
    console.log('❌ Error:', updateError);
    return;
  }

  console.log('✅ PAYMENT FLAGS RESET!\n');
  console.log('Client state after reset:');
  console.log(`  session_payment_received: ${updated[0].session_payment_received}`);
  console.log(`  session_payment_date: ${updated[0].session_payment_date}`);
  console.log(`  session_payment_amount: ${updated[0].session_payment_amount}`);
  console.log(`  Total Paid: ${updated[0].total_amount_paid} EGP\n`);

  console.log('📋 Client is now ready to test:');
  console.log('  1. Go to Clients → Test Recurring Client 1783948747080');
  console.log('  2. Main button should show: "Reschedule or Cancel"');
  console.log('  3. BELOW it: "Verify Payment" button should NOW appear ✓');
  console.log('  4. Click "Verify Payment" to verify the pending session');
  console.log('  5. Total paid should increase: 6000 → 8000 EGP\n');
})();
