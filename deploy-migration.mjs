#!/usr/bin/env node
/**
 * Deploy migration: Add clinic_id to bookings and reset test data
 * Usage: node deploy-migration.mjs
 *
 * This script:
 * 1. Adds clinic_id column to bookings table
 * 2. Creates indexes for efficient clinic queries
 * 3. Deletes all test clients (cascade deletes bookings, etc.)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: {
    schema: "public",
  },
});

async function deploy() {
  console.log("🚀 Deploying migration: Add clinic_id to bookings\n");

  try {
    // 1. Add clinic_id column
    console.log("1️⃣  Adding clinic_id column to bookings...");
    const { error: addColumnError } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS clinic_id BIGINT REFERENCES clinics(id) ON DELETE CASCADE;",
    });

    if (addColumnError && !addColumnError.message?.includes("already exists")) {
      throw addColumnError;
    }
    console.log("   ✅ clinic_id column added\n");

    // 2. Create indexes
    console.log("2️⃣  Creating indexes for clinic queries...");
    const { error: indexError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_bookings_clinic_id ON bookings(clinic_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_clinic_date ON bookings(clinic_id, session_date, booking_status);
      `,
    });

    if (indexError && !indexError.message?.includes("already exists")) {
      throw indexError;
    }
    console.log("   ✅ Indexes created\n");

    // 3. Delete all clients
    console.log("3️⃣  Deleting all test clients (cascade delete bookings)...");
    const { data: clientCountBefore } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true });

    const { error: deleteError } = await supabase.from("clients").delete().neq("id", -1);

    if (deleteError) throw deleteError;

    const { data: clientCountAfter } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true });

    const { data: bookingCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    console.log(`   ✅ Deleted ${clientCountBefore?.count || 0} clients\n`);

    // 4. Verify
    console.log("📊 Verification:");
    console.log(`   Total clients: ${clientCountAfter?.count || 0}`);
    console.log(`   Total bookings: ${bookingCount?.count || 0}\n`);

    console.log("✅ Migration deployed successfully!");
    console.log("\n🎉 Ready for testing with clean data!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

deploy();
