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

async function checkPaymentRecords() {
  try {
    console.log('\n========================================');
    console.log('🔍 CHECKING PAYMENT RECORDS TABLE');
    console.log('========================================\n');

    // Try to fetch payment records
    const { data: records, error } = await supabase
      .from('payment_records')
      .select('*')
      .limit(3);

    if (error) {
      console.error('❌ Error fetching payment_records:', error);
      console.log('\nTable might not exist or have schema issues.');
      return;
    }

    console.log(`✓ Payment records table exists`);
    console.log(`✓ Found ${records?.length || 0} records\n`);

    if (records && records.length > 0) {
      console.log('Sample record:');
      console.log(JSON.stringify(records[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPaymentRecords();
