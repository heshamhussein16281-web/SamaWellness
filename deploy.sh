#!/bin/bash

# Phase 4 & 5 Automated Deployment Script
# This script deploys all Phase 4 & 5 migrations to Supabase

set -e

PROJECT_REF="aelgbqybcvmuzlbmkwia"
MIGRATION_DIR="./supabase/migrations"

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║   Phase 4 & 5: Clinical Operations - Automated Deployment         ║"
echo "║   Project: $PROJECT_REF"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if migrations exist
echo "📋 Verifying migration files..."
if [ ! -f "$MIGRATION_DIR/20260609_create_clinics_table.sql" ]; then
    echo "❌ Error: 20260609_create_clinics_table.sql not found"
    exit 1
fi
if [ ! -f "$MIGRATION_DIR/20260611_add_therapist_hourly_rate.sql" ]; then
    echo "❌ Error: 20260611_add_therapist_hourly_rate.sql not found"
    exit 1
fi
if [ ! -f "$MIGRATION_DIR/20260611_phase4_clinical_scheduling.sql" ]; then
    echo "❌ Error: 20260611_phase4_clinical_scheduling.sql not found"
    exit 1
fi
echo "✅ All migration files verified"
echo ""

# Deploy using Supabase CLI
echo "🚀 Starting deployment..."
echo ""

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing via npx..."
    SUPABASE_CMD="npx supabase"
else
    SUPABASE_CMD="supabase"
fi

echo "Using command: $SUPABASE_CMD"
echo ""

# Link to project (if needed)
echo "🔗 Linking to Supabase project..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local found"
else
    echo "❌ .env.local not found. Please create it with SUPABASE_URL and SUPABASE_ANON_KEY"
    exit 1
fi

# Deploy migrations
echo ""
echo "📦 Deploying migrations..."
$SUPABASE_CMD db push

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify database in Supabase dashboard"
echo "2. Configure cron jobs (see CRON_JOBS.md)"
echo "3. Deploy to production: vercel deploy --prod"
echo ""
