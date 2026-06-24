import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test Data Generator for Recurring Clients
 * Creates mock recurring clients with past and future sessions for testing
 *
 * Usage: Run with npx tsx lib/test-data-generator.ts
 */

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split('=');
      const trimmedKey = key?.trim();
      const value = valueParts.join('=').trim();

      if (trimmedKey && !process.env[trimmedKey]) {
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');
        process.env[trimmedKey] = cleanValue;
      }
    });
  } else {
    console.error('❌ .env.local file not found at:', envPath);
    console.error('Please create .env.local with your Supabase credentials');
    process.exit(1);
  }
}

// Load env before creating client
loadEnv();

// Verify required env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local');
  process.exit(1);
}

console.log('✓ Environment variables loaded');
console.log(`  Supabase URL: ${supabaseUrl.substring(0, 30)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

interface TestDataConfig {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  therapistName: string;
  clinicName: string;
  pastSessionCount: number; // Number of completed sessions in the past
  futureSessionCount: number; // Number of scheduled future sessions
  sessionFrequency: 'weekly' | 'biweekly'; // How often to schedule sessions
}

async function generateTestData(config: TestDataConfig) {
  console.log('🧪 Starting test data generation...');
  console.log('Config:', config);

  try {
    // Step 1: Get or create clinic
    console.log('\n📍 Setting up clinic...');
    const { data: clinics, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('name', config.clinicName)
      .limit(1);

    if (clinicError) throw clinicError;

    let clinicId: number;
    if (clinics && clinics.length > 0) {
      clinicId = clinics[0].id;
      console.log(`✓ Using existing clinic: ${config.clinicName} (ID: ${clinicId})`);
    } else {
      console.log('✗ Clinic not found. Please create clinic first.');
      return;
    }

    // Step 2: Get therapist
    console.log('\n👨‍⚕️ Setting up therapist...');
    const { data: therapists, error: therapistError } = await supabase
      .from('therapists')
      .select('id, hourly_rate')
      .eq('name', config.therapistName)
      .limit(1);

    if (therapistError) throw therapistError;

    let therapistId: number;
    let hourlyRate: number;
    if (therapists && therapists.length > 0) {
      therapistId = therapists[0].id;
      hourlyRate = therapists[0].hourly_rate || 3000;
      console.log(`✓ Using therapist: ${config.therapistName} (ID: ${therapistId}, Rate: ${hourlyRate} EGP/hr)`);
    } else {
      console.log('✗ Therapist not found. Please create therapist first.');
      return;
    }

    // Step 3: Create test client (recurring)
    console.log('\n👤 Creating test recurring client...');
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert([
        {
          name: config.clientName,
          email: config.clientEmail,
          phone: config.clientPhone,
          status: 'active',
          is_recurring: true,
          therapist_id: therapistId,
          total_sessions_completed: config.pastSessionCount,
          last_session_date: new Date().toISOString(),
          client_since: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
          payment_verified_1: true,
          payment_amount_1: 2000,
          payment_verified_2: true,
          payment_amount_2: hourlyRate > 2000 ? hourlyRate - 2000 : 0,
          total_payment_due: hourlyRate,
        },
      ])
      .select()
      .single();

    if (clientError) throw clientError;
    console.log(`✓ Created client: ${newClient.name} (ID: ${newClient.id})`);

    // Step 4: Get clinic rooms
    console.log('\n🏠 Setting up clinic rooms...');
    const { data: rooms, error: roomError } = await supabase
      .from('clinic_rooms')
      .select('id')
      .eq('clinic_id', clinicId)
      .limit(1);

    if (roomError) throw roomError;

    let roomId: string | null = null;
    if (rooms && rooms.length > 0) {
      roomId = rooms[0].id;
      console.log(`✓ Using room: ${roomId}`);
    } else {
      console.log('⚠ No rooms found. Sessions will be created without room assignment.');
    }

    // Step 5: Create past sessions (completed)
    console.log(`\n📅 Creating ${config.pastSessionCount} completed past sessions...`);
    const pastSessions = [];
    const daysBetweenSessions = config.sessionFrequency === 'weekly' ? 7 : 14;

    for (let i = config.pastSessionCount; i > 0; i--) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - i * daysBetweenSessions);
      sessionDate.setHours(10, 0, 0, 0); // 10 AM

      pastSessions.push({
        client_id: newClient.id,
        therapist_id: therapistId,
        session_date: sessionDate.toISOString(),
        duration_minutes: 60,
        session_type: 'single',
        room_id: roomId,
        booking_status: 'completed',
        payment_status: 'paid',
        payment_date: new Date(sessionDate.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Day before
        notes: `Test session on ${sessionDate.toLocaleDateString()}`,
      });
    }

    if (pastSessions.length > 0) {
      const { data: createdPastSessions, error: pastError } = await supabase
        .from('bookings')
        .insert(pastSessions)
        .select();

      if (pastError) throw pastError;
      console.log(`✓ Created ${createdPastSessions?.length || 0} completed sessions`);

      // Add session notes to completed sessions
      if (createdPastSessions && createdPastSessions.length > 0) {
        console.log('  Adding session notes to completed sessions...');
        const sessionNotes = createdPastSessions.map((session: any) => ({
          booking_id: session.id,
          therapist_id: therapistId,
          notes: `Session completed successfully. Client engaged well and showed good progress.`,
          session_outcome: 'positive',
          progress_score: Math.floor(Math.random() * 3) + 3, // 3-5
        }));

        const { error: notesError } = await supabase
          .from('session_notes')
          .insert(sessionNotes);

        if (notesError) {
          console.error('  ⚠ Error adding session notes:', notesError);
        } else {
          console.log(`  ✓ Added notes to ${sessionNotes.length} sessions`);
        }
      }
    }

    // Step 6: Create future sessions (scheduled)
    console.log(`\n📅 Creating ${config.futureSessionCount} future scheduled sessions...`);
    const futureSessions = [];

    for (let i = 1; i <= config.futureSessionCount; i++) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + i * daysBetweenSessions);
      sessionDate.setHours(10, 0, 0, 0); // 10 AM

      futureSessions.push({
        client_id: newClient.id,
        therapist_id: therapistId,
        session_date: sessionDate.toISOString(),
        duration_minutes: 60,
        session_type: 'single',
        room_id: roomId,
        booking_status: 'scheduled',
        payment_status: 'pending',
        payment_deadline: new Date(sessionDate.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Day before
        notes: `Scheduled session for ${sessionDate.toLocaleDateString()}`,
      });
    }

    if (futureSessions.length > 0) {
      const { data: createdFutureSessions, error: futureError } = await supabase
        .from('bookings')
        .insert(futureSessions)
        .select();

      if (futureError) throw futureError;
      console.log(`✓ Created ${createdFutureSessions?.length || 0} scheduled future sessions`);
    }

    console.log('\n✅ Test data generation complete!');
    console.log(`\n📊 Summary:`);
    console.log(`  Client: ${newClient.name} (${newClient.email})`);
    console.log(`  Therapist: ${config.therapistName}`);
    console.log(`  Completed sessions: ${config.pastSessionCount}`);
    console.log(`  Scheduled sessions: ${config.futureSessionCount}`);
    console.log(`\n🧪 You can now test recurring client cycles and session management!`);

  } catch (error) {
    console.error('❌ Error generating test data:', error);
    process.exit(1);
  }
}

// Default test configuration
const defaultConfig: TestDataConfig = {
  clientName: 'Test Recurring Client',
  clientEmail: 'test.recurring@example.com',
  clientPhone: '+20 100 000 0001',
  therapistName: 'Sama Eissa', // Your therapist
  clinicName: 'New giza 031', // Your clinic name (EXACT match)
  pastSessionCount: 5, // 5 completed past sessions
  futureSessionCount: 4, // 4 future scheduled sessions
  sessionFrequency: 'weekly', // Weekly sessions
};

// Run if this is the main module
if (require.main === module) {
  generateTestData(defaultConfig);
}

export { generateTestData, TestDataConfig };
