-- Fix RLS infinite recursion by dropping and recreating policies
-- Run this if you already applied 001_initial_schema.sql

-- Drop existing policies on projects
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Collaborators can view shared projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Collaborator admins can update shared projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Drop existing policies on project_content
DROP POLICY IF EXISTS "Users can view project content they have access to" ON project_content;
DROP POLICY IF EXISTS "Project owners can view content" ON project_content;
DROP POLICY IF EXISTS "Collaborators can view content" ON project_content;
DROP POLICY IF EXISTS "Users can insert project content for their projects" ON project_content;
DROP POLICY IF EXISTS "Project owners can insert content" ON project_content;
DROP POLICY IF EXISTS "Users can update project content they have access to" ON project_content;
DROP POLICY IF EXISTS "Project owners can update content" ON project_content;
DROP POLICY IF EXISTS "Collaborators can update content" ON project_content;
DROP POLICY IF EXISTS "Users can delete project content for their projects" ON project_content;
DROP POLICY IF EXISTS "Project owners can delete content" ON project_content;

-- Drop existing policies on project_integrations
DROP POLICY IF EXISTS "Users can view integrations for projects they have access to" ON project_integrations;
DROP POLICY IF EXISTS "Project owners can view integrations" ON project_integrations;
DROP POLICY IF EXISTS "Collaborators can view integrations" ON project_integrations;
DROP POLICY IF EXISTS "Project owners can manage integrations" ON project_integrations;
DROP POLICY IF EXISTS "Project owners can insert integrations" ON project_integrations;
DROP POLICY IF EXISTS "Project owners can update integrations" ON project_integrations;
DROP POLICY IF EXISTS "Project owners can delete integrations" ON project_integrations;

-- Drop existing policies on collaborators
DROP POLICY IF EXISTS "Users can view collaborators for projects they have access to" ON collaborators;
DROP POLICY IF EXISTS "Users can view collaborators for projects they own or collaborate on" ON collaborators;
DROP POLICY IF EXISTS "Project owners and admins can manage collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can update collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can delete collaborators" ON collaborators;

-- Drop existing policies on collaborator_invites
DROP POLICY IF EXISTS "Users can view invites for projects they have access to" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can view invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Collaborators can view invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Invited users can view their invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners and admins can manage invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can insert invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can update invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Invited users can update their invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can delete invites" ON collaborator_invites;

-- ============================================
-- RECREATE POLICIES (without recursion)
-- ============================================

-- Projects policies
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

-- Project content policies
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

-- Project integrations policies
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

-- Collaborators policies (avoid self-reference)
CREATE POLICY "Users can view collaborators for projects they own or collaborate on"
  ON collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborators.project_id
      AND projects.user_id = auth.uid()
    )
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

-- Collaborator invites policies
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
