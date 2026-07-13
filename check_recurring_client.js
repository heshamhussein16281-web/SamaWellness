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

async function checkClient() {
  try {
    console.log('\n========================================');
    console.log('🔍 CHECKING RECURRING CLIENT DATA');
    console.log('========================================\n');

    // Get client 116
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', 116)
      .single();

    if (clientError) throw clientError;

    console.log('📋 Client Data:');
    console.log(JSON.stringify(client, null, 2));

    // Get bookings for client 116
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('client_id', 116);

    if (bookingsError) throw bookingsError;

    console.log('\n📅 Bookings:');
    console.log(JSON.stringify(bookings, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkClient();
