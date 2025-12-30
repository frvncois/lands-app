-- Add tour_completed column to project_settings table
ALTER TABLE project_settings
ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT false;
