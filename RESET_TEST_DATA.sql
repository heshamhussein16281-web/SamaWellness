-- RESET TEST DATA - Delete all clients and cascade delete related records
-- WARNING: This deletes all clients and all their associated data (bookings, payments, assessments, etc.)
-- Use only for testing/development

DELETE FROM clients;

-- Verify deletion
SELECT COUNT(*) as total_clients FROM clients;
SELECT COUNT(*) as total_bookings FROM bookings;
