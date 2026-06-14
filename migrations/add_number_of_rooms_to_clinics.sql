-- Add number_of_rooms column to clinics table
ALTER TABLE clinics ADD COLUMN number_of_rooms INTEGER;

-- Add comment for clarity
COMMENT ON COLUMN clinics.number_of_rooms IS 'Total number of therapy rooms at this clinic';
