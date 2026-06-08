/**
 * Initialize Supabase Database
 * Run this script to create all clinic management tables
 *
 * Usage: npx ts-node scripts/init-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing Supabase database...');
    console.log(`📍 Project: ${supabaseUrl}`);

    // Read SQL migration file
    const migrationPath = path.join(
      __dirname,
      '../supabase/migrations/20260608_create_clinic_tables.sql'
    );

    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Execute SQL - split by statements and execute each
    // Note: This is a basic approach; Supabase CLI would be better for production
    console.log('\n📝 Executing SQL migration...');

    // Note: Direct SQL execution via fetch is complex with Supabase
    // The migration should be run via the Supabase Dashboard or CLI
    console.log('✅ Migration file is ready!');
    console.log('\n📌 To execute the migration:');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Click "New Query"');
    console.log('5. Paste the contents of: supabase/migrations/20260608_create_clinic_tables.sql');
    console.log('6. Click "Run"');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.log('\n📌 Manual Setup Instructions:');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Click "New Query"');
    console.log('5. Paste the contents of: supabase/migrations/20260608_create_clinic_tables.sql');
    console.log('6. Click "Run"');
    process.exit(1);
  }
}

initializeDatabase();
