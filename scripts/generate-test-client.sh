#!/bin/bash

# Quick Start: Generate Test Recurring Client
# Usage: ./scripts/generate-test-client.sh
# Or: bash scripts/generate-test-client.sh

set -e

echo "🧪 Generating test recurring client..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Run the test data generator
npx tsx lib/test-data-generator.ts

echo ""
echo "✅ Test data generation complete!"
echo ""
echo "📖 Next steps:"
echo "  1. Open your app: http://localhost:3000/dashboard/clinical/clients"
echo "  2. Find 'Test Recurring Client' in the list"
echo "  3. Click the client to view details"
echo "  4. Use the API to mark sessions as completed:"
echo "     POST /api/admin/bookings/[BOOKING_ID]/complete-session"
echo ""
echo "📚 For more details, see: TESTING_RECURRING_CLIENTS.md"
