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

async function deleteTestClient() {
  try {
    const clientId = 73;
    
    console.log(`\n🗑️  Deleting all bookings for client ${clientId}...`);
    const { data: deletedBookings, error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .eq('client_id', clientId)
      .select();

    if (bookingsError) throw bookingsError;
    console.log(`✓ Deleted ${deletedBookings?.length || 0} bookings`);

    console.log(`\n🗑️  Deleting client ${clientId}...`);
    const { data: deletedClient, error: clientError } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .select();

    if (clientError) throw clientError;
    console.log(`✓ Deleted client`);

    console.log('\n✅ TEST CLIENT DELETED!\n');
    console.log('Next steps:');
    console.log('  1. Create a fresh test client');
    console.log('  2. Test the complete workflow: book → reschedule → cancel');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteTestClient();
