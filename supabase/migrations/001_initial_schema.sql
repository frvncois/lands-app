-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_url TEXT,
  custom_domain TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_content table
CREATE TABLE IF NOT EXISTS project_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  blocks JSONB DEFAULT '[]'::jsonb,
  page_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Create project_integrations table
CREATE TABLE IF NOT EXISTS project_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, provider)
);

-- Create collaborators table
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create collaborator_invites table
CREATE TABLE IF NOT EXISTS collaborator_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(project_id, email)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_project_content_project_id ON project_content(project_id);
CREATE INDEX IF NOT EXISTS idx_project_integrations_project_id ON project_integrations(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_project_id ON collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_invites_project_id ON collaborator_invites(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_invites_email ON collaborator_invites(email);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for projects
-- Using security_barrier to prevent infinite recursion with collaborators table
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Collaborators can view shared projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.project_id = projects.id
      AND collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Collaborator admins can update shared projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.project_id = projects.id
      AND collaborators.user_id = auth.uid()
      AND collaborators.role = 'admin'
    )
  );

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for project_content
CREATE POLICY "Project owners can view content"
  ON project_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can view content"
  ON project_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.project_id = project_content.project_id
      AND collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can insert content"
  ON project_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update content"
  ON project_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can update content"
  ON project_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.project_id = project_content.project_id
      AND collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete content"
  ON project_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for project_integrations
CREATE POLICY "Project owners can view integrations"
  ON project_integrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_integrations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can view integrations"
  ON project_integrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.project_id = project_integrations.project_id
      AND collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can insert integrations"
  ON project_integrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_integrations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update integrations"
  ON project_integrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_integrations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete integrations"
  ON project_integrations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_integrations.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for collaborators
-- Note: We avoid self-referencing the collaborators table to prevent infinite recursion
CREATE POLICY "Users can view collaborators for projects they own or collaborate on"
  ON collaborators FOR SELECT
  USING (
    -- User owns the project
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborators.project_id
      AND projects.user_id = auth.uid()
    )
    -- Or user is a collaborator on this project (direct check, no subquery on same table)
    OR collaborators.user_id = auth.uid()
  );

CREATE POLICY "Project owners can manage collaborators"
  ON collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborators.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update collaborators"
  ON collaborators FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborators.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete collaborators"
  ON collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborators.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for collaborator_invites
CREATE POLICY "Project owners can view invites"
  ON collaborator_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborator_invites.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can view invites"
  ON collaborator_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.project_id = collaborator_invites.project_id
      AND collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Invited users can view their invites"
  ON collaborator_invites FOR SELECT
  USING (
    collaborator_invites.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Project owners can insert invites"
  ON collaborator_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborator_invites.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update invites"
  ON collaborator_invites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborator_invites.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Invited users can update their invites"
  ON collaborator_invites FOR UPDATE
  USING (
    collaborator_invites.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Project owners can delete invites"
  ON collaborator_invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborator_invites.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_content_updated_at
  BEFORE UPDATE ON project_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_integrations_updated_at
  BEFORE UPDATE ON project_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
