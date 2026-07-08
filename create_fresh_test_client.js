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

async function createFreshTestClient() {
  try {
    const therapistId = 88; // Sara El Shakankiri
    const timestamp = Date.now();
    
    // Get first clinic room
    console.log('🔍 Finding a clinic room...');
    const { data: rooms, error: roomError } = await supabase
      .from('clinic_rooms')
      .select('id')
      .limit(1);

    if (roomError || !rooms || rooms.length === 0) {
      throw new Error('No clinic rooms found');
    }

    const roomId = rooms[0].id;
    console.log(`✓ Using room ID: ${roomId}`);
    
    console.log('\n📝 Creating fresh test client...');
    
    // Create the client
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .insert([
        {
          name: `Fresh Test Client ${timestamp}`,
          email: `fresh-test-${timestamp}@example.com`,
          phone: `01005${timestamp % 100000}`,
          therapist_id: therapistId,
          stage: 'intake',
          status: 'booking_scheduled',
          is_recurring: true,
          total_sessions_completed: 2,
          total_amount_paid: 4000,
          client_since: '2026-06-15T00:00:00+00:00',
        }
      ])
      .select();

    if (clientError) throw clientError;
    const clientId = clients[0].id;
    console.log(`✓ Client created (ID: ${clientId})`);

    // Create 2 completed bookings
    console.log('📝 Creating 2 completed bookings...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .insert([
        {
          client_id: clientId,
          therapist_id: therapistId,
          session_date: '2026-06-20T10:00:00',
          duration_minutes: 60,
          session_type: 'single',
          room_id: roomId,
          booking_status: 'completed',
          payment_status: 'paid',
          notes: 'Session 1 - Completed',
          created_at: '2026-06-20T08:00:00',
        },
        {
          client_id: clientId,
          therapist_id: therapistId,
          session_date: '2026-06-27T10:00:00',
          duration_minutes: 60,
          session_type: 'single',
          room_id: roomId,
          booking_status: 'completed',
          payment_status: 'paid',
          notes: 'Session 2 - Completed',
          created_at: '2026-06-27T08:00:00',
        }
      ])
      .select();

    if (bookingsError) throw bookingsError;
    console.log(`✓ Created ${bookings?.length || 0} completed bookings`);

    console.log('\n✅ FRESH TEST CLIENT CREATED!\n');
    console.log('Client Details:');
    console.log(`  Name: Fresh Test Client ${timestamp}`);
    console.log(`  ID: ${clientId}`);
    console.log(`  Email: fresh-test-${timestamp}@example.com`);
    console.log(`  Phone: 01005${timestamp % 100000}`);
    console.log('  Therapist: Sara El Shakankiri');
    console.log('  Completed Sessions: 2 (Jun 20, Jun 27)');
    console.log('  Total Paid: EGP 4,000 (2 × EGP 2,000)\n');
    console.log('Ready to test the complete workflow:');
    console.log(`  1. Go to Clients > Fresh Test Client ${timestamp}`);
    console.log('  2. Click "MANAGE BOOKING"');
    console.log('  3. Reschedule the booking to a new date');
    console.log('  4. Verify the correct date shows in the View Profile');
    console.log('  5. Test cancelling the booking');
    console.log('  6. Verify the cancelled booking appears in history\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createFreshTestClient();
