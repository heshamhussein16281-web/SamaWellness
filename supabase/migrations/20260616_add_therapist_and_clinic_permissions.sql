-- Add missing therapist and clinic permissions for sidebar granular access control

-- Insert therapist permissions if they don't exist
INSERT INTO permissions (key, name, description, category) VALUES
  ('view_therapists', 'View Therapists', 'View therapist list and details', 'Therapists'),
  ('manage_therapists', 'Manage Therapists', 'Create, edit, and delete therapists', 'Therapists')
ON CONFLICT (key) DO NOTHING;
