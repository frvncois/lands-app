-- COMPLETE FIX: Remove all cross-table RLS references that cause recursion
-- Run this in your Supabase SQL Editor

-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================

-- Projects
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Collaborators can view shared projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Collaborator admins can update shared projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Project content
DROP POLICY IF EXISTS "Project owners can view content" ON project_content;
DROP POLICY IF EXISTS "Collaborators can view content" ON project_content;
DROP POLICY IF EXISTS "Project owners can insert content" ON project_content;
DROP POLICY IF EXISTS "Project owners can update content" ON project_content;
DROP POLICY IF EXISTS "Collaborators can update content" ON project_content;
DROP POLICY IF EXISTS "Project owners can delete content" ON project_content;

-- Project integrations
DROP POLICY IF EXISTS "Project owners can view integrations" ON project_integrations;
DROP POLICY IF EXISTS "Collaborators can view integrations" ON project_integrations;
DROP POLICY IF EXISTS "Project owners can insert integrations" ON project_integrations;
DROP POLICY IF EXISTS "Project owners can update integrations" ON project_integrations;
DROP POLICY IF EXISTS "Project owners can delete integrations" ON project_integrations;

-- Collaborators
DROP POLICY IF EXISTS "Users can view collaborators for projects they own or collaborate on" ON collaborators;
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can update collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can delete collaborators" ON collaborators;

-- Collaborator invites
DROP POLICY IF EXISTS "Project owners can view invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Collaborators can view invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Invited users can view their invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can insert invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can update invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Invited users can update their invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can delete invites" ON collaborator_invites;

-- Drop new policy names (in case they exist from previous run)
DROP POLICY IF EXISTS "Users can access their projects" ON projects;
DROP POLICY IF EXISTS "Users can view their project content" ON project_content;
DROP POLICY IF EXISTS "Users can insert project content" ON project_content;
DROP POLICY IF EXISTS "Users can update project content" ON project_content;
DROP POLICY IF EXISTS "Users can delete project content" ON project_content;
DROP POLICY IF EXISTS "Users can view their project integrations" ON project_integrations;
DROP POLICY IF EXISTS "Users can insert project integrations" ON project_integrations;
DROP POLICY IF EXISTS "Users can update project integrations" ON project_integrations;
DROP POLICY IF EXISTS "Users can delete project integrations" ON project_integrations;
DROP POLICY IF EXISTS "Users can view collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can insert collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can update collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can delete collaborators" ON collaborators;
DROP POLICY IF EXISTS "Users can view invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Users can update invites" ON collaborator_invites;

-- ============================================
-- CREATE HELPER FUNCTION TO CHECK PROJECT ACCESS
-- This avoids recursion by using SECURITY DEFINER
-- ============================================

CREATE OR REPLACE FUNCTION public.user_has_project_access(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user owns the project OR is a collaborator
  RETURN EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id AND user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM collaborators WHERE project_id = p_project_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_owns_project(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_project_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
  -- Return all project IDs the user owns
  RETURN QUERY SELECT id FROM projects WHERE user_id = p_user_id;
  -- Also return project IDs where user is a collaborator
  RETURN QUERY SELECT project_id FROM collaborators WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- PROJECTS POLICIES (simple, no cross-table queries)
-- ============================================

-- Users can see projects they own OR collaborate on (using helper function)
CREATE POLICY "Users can access their projects"
  ON projects FOR SELECT
  USING (
    user_id = auth.uid()
    OR id IN (SELECT project_id FROM collaborators WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PROJECT_CONTENT POLICIES
-- ============================================

CREATE POLICY "Users can view their project content"
  ON project_content FOR SELECT
  USING (
    project_id IN (SELECT public.get_user_project_ids(auth.uid()))
  );

CREATE POLICY "Users can insert project content"
  ON project_content FOR INSERT
  WITH CHECK (
    public.user_owns_project(project_id, auth.uid())
  );

CREATE POLICY "Users can update project content"
  ON project_content FOR UPDATE
  USING (
    public.user_has_project_access(project_id, auth.uid())
  );

CREATE POLICY "Users can delete project content"
  ON project_content FOR DELETE
  USING (
    public.user_owns_project(project_id, auth.uid())
  );

-- ============================================
-- PROJECT_INTEGRATIONS POLICIES
-- ============================================

CREATE POLICY "Users can view their project integrations"
  ON project_integrations FOR SELECT
  USING (
    public.user_has_project_access(project_id, auth.uid())
  );

CREATE POLICY "Users can insert project integrations"
  ON project_integrations FOR INSERT
  WITH CHECK (
    public.user_owns_project(project_id, auth.uid())
  );

CREATE POLICY "Users can update project integrations"
  ON project_integrations FOR UPDATE
  USING (
    public.user_owns_project(project_id, auth.uid())
  );

CREATE POLICY "Users can delete project integrations"
  ON project_integrations FOR DELETE
  USING (
    public.user_owns_project(project_id, auth.uid())
  );

-- ============================================
-- COLLABORATORS POLICIES (no self-reference!)
-- ============================================

-- Users can see collaborators if they own the project OR are a collaborator themselves
CREATE POLICY "Users can view collaborators"
  ON collaborators FOR SELECT
  USING (
    -- User owns the project
    public.user_owns_project(project_id, auth.uid())
    -- OR user is this collaborator (can see themselves)
    OR user_id = auth.uid()
  );

CREATE POLICY "Project owners can insert collaborators"
  ON collaborators FOR INSERT
  WITH CHECK (
    public.user_owns_project(project_id, auth.uid())
  );

CREATE POLICY "Project owners can update collaborators"
  ON collaborators FOR UPDATE
  USING (
    public.user_owns_project(project_id, auth.uid())
  );

CREATE POLICY "Project owners can delete collaborators"
  ON collaborators FOR DELETE
  USING (
    public.user_owns_project(project_id, auth.uid())
  );

-- ============================================
-- COLLABORATOR_INVITES POLICIES
-- ============================================

CREATE POLICY "Users can view invites"
  ON collaborator_invites FOR SELECT
  USING (
    -- Project owner
    public.user_owns_project(project_id, auth.uid())
    -- OR invited user can see their own invites
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Project owners can insert invites"
  ON collaborator_invites FOR INSERT
  WITH CHECK (
    public.user_owns_project(project_id, auth.uid())
  );

CREATE POLICY "Users can update invites"
  ON collaborator_invites FOR UPDATE
  USING (
    public.user_owns_project(project_id, auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Project owners can delete invites"
  ON collaborator_invites FOR DELETE
  USING (
    public.user_owns_project(project_id, auth.uid())
  );
