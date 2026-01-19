-- Create project_settings table for extended project configuration
CREATE TABLE IF NOT EXISTS project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- SEO settings
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT,
  og_image TEXT,
  favicon TEXT,
  -- Publish settings
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'password')),
  password TEXT,
  published_at TIMESTAMPTZ,
  -- Analytics settings (Umami)
  umami_site_id TEXT,
  umami_enabled BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Create index for project_id
CREATE INDEX IF NOT EXISTS idx_project_settings_project_id ON project_settings(project_id);

-- Enable RLS
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_settings
-- Users can view settings for their own projects or projects they collaborate on
CREATE POLICY "Users can view project settings"
  ON project_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_settings.project_id
      AND projects.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.project_id = project_settings.project_id
      AND collaborators.user_id = auth.uid()
    )
  );

-- Users can insert settings for their own projects
CREATE POLICY "Users can insert project settings"
  ON project_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_settings.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update settings for their own projects or as admin collaborator
CREATE POLICY "Users can update project settings"
  ON project_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_settings.project_id
      AND projects.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.project_id = project_settings.project_id
      AND collaborators.user_id = auth.uid()
      AND collaborators.role = 'admin'
    )
  );

-- Users can delete settings for their own projects
CREATE POLICY "Users can delete project settings"
  ON project_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_settings.project_id
      AND projects.user_id = auth.uid()
    )
  );
