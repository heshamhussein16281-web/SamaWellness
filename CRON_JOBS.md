# Cron Jobs Documentation

This document describes the three automated background jobs implemented for clinical operations.

## Overview

Three cron endpoints have been implemented to automate key clinical management tasks:

1. **Payment Deadline Checker** - Monitors and expires overdue payment deadlines
2. **Recurring Client Updater** - Identifies and marks recurring clients
3. **Inactive Client Marker** - Marks clients with prolonged inactivity

All endpoints require authentication via `X-Cron-Secret` header and are designed for manual testing and integration with external cron services.

---

## 1. Payment Deadline Checker

**Endpoint**: `POST /api/cron/check-payment-deadlines`

**Recommended Schedule**: Every 15 minutes

### Purpose
Automatically marks bookings as expired when their payment deadline passes, ensuring timely payment follow-up and preventing lost revenue.

### Logic
```
1. Find bookings with:
   - booking_status = 'scheduled'
   - payment_status = 'pending'
   - payment_deadline <= current_time

2. For each expired booking:
   - Update booking_status to 'expired'
   - Log status change in client_status_history
   - Create notification record (optional, if table exists)

3. Return summary of processed bookings
```

### Request
```bash
curl -X POST http://localhost:3000/api/cron/check-payment-deadlines \
  -H "X-Cron-Secret: your-cron-secret" \
  -H "Content-Type: application/json"
```

### Response
```json
{
  "success": true,
  "count": 5,
  "failed": 0,
  "message": "Processed 5 bookings: 5 marked expired, 0 failed"
}
```

### Response on Error
```json
{
  "success": false,
  "count": 3,
  "failed": 2,
  "message": "Processed 5 bookings: 3 marked expired, 2 failed",
  "errors": [
    "Booking 123: Database error",
    "Booking 456: Permission denied"
  ]
}
```

### Database Impact
- Updates `bookings.booking_status` to `'expired'`
- Creates record in `client_status_history` with reason='Payment deadline expired'
- Optionally creates notification in `notifications` table (if available)

### Performance
- Processes up to 1000 bookings per run (batch limit)
- Uses indexed queries on `payment_deadline`, `booking_status`, `payment_status`
- Expected execution time: < 5 seconds for typical workloads

---

## 2. Recurring Client Updater

**Endpoint**: `POST /api/cron/update-recurring-clients`

**Recommended Schedule**: Daily at 1:00 AM UTC

### Purpose
Identifies clients who have completed one or more sessions and marks them as recurring, enabling targeted retention marketing and tracking client value.

### Logic
```
1. Find all completed bookings (booking_status = 'completed')
2. Extract unique client IDs from completed bookings
3. For each client:
   - Count total completed sessions
   - Sum total amount paid from payment_records
   - If completed_sessions >= 1:
     - Set is_recurring = true
   - Update total_sessions_completed
   - Update total_amount_paid
4. Return summary of updated clients
```

### Request
```bash
curl -X POST http://localhost:3000/api/cron/update-recurring-clients \
  -H "X-Cron-Secret: your-cron-secret" \
  -H "Content-Type: application/json"
```

### Response
```json
{
  "success": true,
  "count": 42,
  "failed": 0,
  "message": "Updated 42 clients: 42 successful, 0 failed"
}
```

### Database Impact
- Updates `clients.is_recurring` to `true` for clients with >= 1 completed session
- Updates `clients.total_sessions_completed` with count from bookings table
- Updates `clients.total_amount_paid` with sum from payment_records table

### Performance
- Processes up to 1000 unique clients per run
- Uses indexed queries on `booking_status`, `client_id`, `charge_status`
- Expected execution time: < 10 seconds for typical workloads

### Edge Cases Handled
- Clients with no payment records: `total_amount_paid` defaults to 0
- Clients with no completed bookings: Not updated in this run
- Decimal precision: Maintained to 2 decimal places

---

## 3. Inactive Client Marker

**Endpoint**: `POST /api/cron/mark-inactive-clients`

**Recommended Schedule**: Daily at 2:00 AM UTC

### Purpose
Automatically identifies and marks clients who haven't had a session in 90 days as inactive, enabling proper client lifecycle management and resource allocation.

### Logic
```
1. Find clients with:
   - status = 'active'
   - last_session_date < (current_time - 90 days)

2. For each client:
   - Update status to 'inactive'
   - Log status change in client_status_history

3. Return summary of marked inactive
```

### Request
```bash
curl -X POST http://localhost:3000/api/cron/mark-inactive-clients \
  -H "X-Cron-Secret: your-cron-secret" \
  -H "Content-Type: application/json"
```

### Response
```json
{
  "success": true,
  "count": 8,
  "failed": 0,
  "message": "Processed 8 clients: 8 marked inactive, 0 failed"
}
```

### Database Impact
- Updates `clients.status` to `'inactive'`
- Creates record in `client_status_history` with reason='No activity for 90 days'

### Performance
- Processes up to 1000 clients per run (batch limit)
- Uses indexed queries on `status` and `last_session_date`
- Expected execution time: < 5 seconds for typical workloads

### Edge Cases Handled
- NULL `last_session_date`: Not matched (won't be marked inactive)
- Very recent inactivity marking: Only applied after exactly 90 days
- Status already inactive: Won't be processed again

---

## Authentication

### X-Cron-Secret Header
All cron endpoints require the `X-Cron-Secret` header:

```
X-Cron-Secret: <value of CRON_SECRET env var>
```

### Setup
1. Generate a secure random secret (e.g., 32+ character string)
2. Set environment variable:
   ```bash
   CRON_SECRET=your-generated-secret
   ```
3. Include the same value in all cron requests via `X-Cron-Secret` header

### Error Responses

**Missing Header** (401):
```json
{
  "success": false,
  "error": "Unauthorized: Invalid or missing cron secret"
}
```

**Invalid Secret** (401):
```json
{
  "success": false,
  "error": "Unauthorized: Invalid or missing cron secret"
}
```

**Missing Environment Variable** (401):
```json
{
  "success": false,
  "error": "Unauthorized: Invalid or missing cron secret"
}
```

---

## Partial Success Handling

All cron endpoints support partial success - they will process as many records as possible even if some fail.

### Example Partial Success Response
```json
{
  "success": false,
  "count": 48,
  "failed": 2,
  "message": "Processed 50 bookings: 48 marked expired, 2 failed",
  "errors": [
    "Booking 789: Database constraint violation",
    "Booking 790: Foreign key mismatch"
  ]
}
```

The `"success"` field is `true` only when `failed === 0`.

---

## Error Handling

### Try-Catch Wrapping
All endpoints have comprehensive error handling:
- Database connection errors
- Query execution errors
- Record processing errors
- Unexpected exceptions

### Logging
All operations are logged to stdout:
```
[check-payment-deadlines] Processed 5 bookings: 5 marked expired, 0 failed
[update-recurring-clients] Updated 42 clients: 42 successful, 0 failed
[mark-inactive-clients] Processed 8 clients: 8 marked inactive, 0 failed
```

### Error Logs
```
Error fetching expired bookings: PGRST116 Jwt expired
Failed to update booking 123: Database constraint violation
Error processing client 456: Network timeout
```

---

## Integration with External Cron Services

### AWS EventBridge
```yaml
Name: sama-wellness-cron-payment-checker
Schedule: rate(15 minutes)
Target:
  HttpParameters:
    HeaderParameters:
      X-Cron-Secret: "{{ CRON_SECRET }}"
    PathParameterValues: []
  RoleArn: arn:aws:iam::ACCOUNT:role/EventBridgeRole
  Arn: https://app.example.com/api/cron/check-payment-deadlines
  HttpMethod: POST
```

### Google Cloud Scheduler
```yaml
name: projects/PROJECT_ID/locations/us-central1/jobs/sama-wellness-cron-payment
schedule: '*/15 * * * *'  # Every 15 minutes
timezone: UTC
httpTarget:
  uri: https://app.example.com/api/cron/check-payment-deadlines
  httpMethod: POST
  headers:
    X-Cron-Secret: "{{ CRON_SECRET }}"
    Content-Type: application/json
```

### Vercel Cron
```json
{
  "crons": [
    {
      "path": "/api/cron/check-payment-deadlines",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/update-recurring-clients",
      "schedule": "0 1 * * *"
    },
    {
      "path": "/api/cron/mark-inactive-clients",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### EasyCron or similar services
```
POST http://your-app.com/api/cron/check-payment-deadlines
Headers:
  X-Cron-Secret: your-secret
```

---

## Performance Optimization

### Batch Size Limits
- Default BATCH_SIZE: 1000 records per execution
- Prevents timeout issues on large datasets
- Can be adjusted if needed in route files

### Index Usage
All queries use indexes created in the database schema:

**check-payment-deadlines**:
- idx_bookings_booking_status
- idx_bookings_payment_status
- idx_bookings_payment_deadline

**update-recurring-clients**:
- idx_bookings_booking_status
- idx_payment_records_client_id
- idx_payment_records_charge_status

**mark-inactive-clients**:
- idx_clients_status
- idx_clients_last_session_date

### Execution Time Expectations
- Payment deadline checker: 2-5 seconds (typical)
- Recurring client updater: 5-10 seconds (typical)
- Inactive client marker: 2-5 seconds (typical)

---

## Testing

### Manual Testing
Test each endpoint locally:

```bash
# Set environment variable
export CRON_SECRET="test-secret-12345"

# Test payment deadline checker
curl -X POST http://localhost:3000/api/cron/check-payment-deadlines \
  -H "X-Cron-Secret: test-secret-12345" \
  -H "Content-Type: application/json"

# Test recurring client updater
curl -X POST http://localhost:3000/api/cron/update-recurring-clients \
  -H "X-Cron-Secret: test-secret-12345" \
  -H "Content-Type: application/json"

# Test inactive client marker
curl -X POST http://localhost:3000/api/cron/mark-inactive-clients \
  -H "X-Cron-Secret: test-secret-12345" \
  -H "Content-Type: application/json"
```

### Testing Invalid Authentication
```bash
# Missing header
curl -X POST http://localhost:3000/api/cron/check-payment-deadlines

# Wrong secret
curl -X POST http://localhost:3000/api/cron/check-payment-deadlines \
  -H "X-Cron-Secret: wrong-secret"
```

### Verifying Database Changes
After running the cron jobs, verify the database was updated:

```sql
-- Check expired bookings
SELECT COUNT(*) FROM bookings WHERE booking_status = 'expired' AND payment_status = 'pending';

-- Check recurring clients
SELECT COUNT(*) FROM clients WHERE is_recurring = true;

-- Check inactive clients
SELECT COUNT(*) FROM clients WHERE status = 'inactive';

-- Check status history logs
SELECT * FROM client_status_history WHERE reason IN ('Payment deadline expired', 'No activity for 90 days') ORDER BY created_at DESC LIMIT 10;
```

---

## Troubleshooting

### "Unauthorized: Invalid or missing cron secret"
**Solution**: Verify the `CRON_SECRET` environment variable is set and matches the header value.

```bash
# Check env var
echo $CRON_SECRET

# Verify header matches
curl -H "X-Cron-Secret: $CRON_SECRET" ...
```

### "No results processed"
**Possible causes**:
1. No records match the filter conditions
2. All matching records already processed
3. Filter criteria may be too restrictive

**Solution**: Check database for matching records:
```sql
-- For payment checker
SELECT COUNT(*) FROM bookings 
WHERE booking_status='scheduled' AND payment_status='pending' AND payment_deadline <= now();

-- For recurring updater
SELECT COUNT(*) FROM bookings WHERE booking_status='completed';

-- For inactive marker
SELECT COUNT(*) FROM clients 
WHERE status='active' AND last_session_date < now() - interval '90 days';
```

### "Database error: PGRST..."
**Solution**: Check Supabase service credentials and ensure tables exist with correct schema.

### "Network timeout"
**Solution**: Verify your network can reach the app endpoint. Consider increasing cron interval or reducing batch size if processing > 1000 records.

---

## File Locations

```
/app/api/cron/
├── check-payment-deadlines/
│   └── route.ts
├── update-recurring-clients/
│   └── route.ts
└── mark-inactive-clients/
    └── route.ts
```

## Dependencies

- Next.js 14 (API Routes)
- Supabase JS client
- `lib/supabase-service.ts` (getServiceClient)

## Future Enhancements

Potential improvements for Phase 6+:
1. Add webhook notifications for important events
2. Implement retry logic with exponential backoff
3. Add rate limiting to prevent abuse
4. Create admin dashboard for cron job monitoring
5. Add support for pause/resume via admin panel
6. Implement detailed execution history tracking
7. Add email notifications for job failures
8. Create metrics collection (success rate, execution time)

---

## Support

For issues or questions, refer to:
- Database schema: `/supabase/migrations/20260611_phase4_clinical_scheduling.sql`
- Auth system: `/lib/auth.ts`
- Service client: `/lib/supabase-service.ts`
