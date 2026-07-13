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

async function testInsert() {
  try {
    console.log('\n========================================');
    console.log('🧪 TESTING PAYMENT RECORD INSERT');
    console.log('========================================\n');

    // Try to insert a test record
    const { data, error } = await supabase
      .from('payment_records')
      .insert([
        {
          client_id: 117,
          payment_date: '2026-07-13',
          amount_paid: 2000,
          actual_cost: 2000,
          refund_amount: 0,
          additional_charge: 0,
          charge_status: 'completed',
          marked_by_user_id: '1',
        }
      ])
      .select();

    if (error) {
      console.error('❌ Insert failed:');
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
      console.error('  Details:', error.details);
      console.error('  Hint:', error.hint);
      return;
    }

    console.log('✓ Insert successful!');
    console.log('Record:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testInsert();
