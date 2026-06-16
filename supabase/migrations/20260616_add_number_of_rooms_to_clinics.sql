-- Add number_of_rooms column to clinics table
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS number_of_rooms INT DEFAULT 1;

-- Set number_of_rooms based on actual room count
UPDATE clinics SET number_of_rooms = (
  SELECT COUNT(*) FROM clinic_rooms WHERE clinic_rooms.clinic_id = clinics.id
) WHERE id IN (SELECT DISTINCT clinic_id FROM clinic_rooms);
