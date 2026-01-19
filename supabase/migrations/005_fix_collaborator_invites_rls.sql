-- Fix RLS for collaborator_invites table
-- The issue is that SECURITY DEFINER functions still have RLS applied when querying other tables
-- Solution: Use SET search_path and ensure the function runs without RLS interference

-- ============================================
-- FIRST: DROP ALL POLICIES THAT DEPEND ON THE FUNCTIONS
-- ============================================

-- Project content policies
DROP POLICY IF EXISTS "Users can view their project content" ON project_content;
DROP POLICY IF EXISTS "Users can insert project content" ON project_content;
DROP POLICY IF EXISTS "Users can update project content" ON project_content;
DROP POLICY IF EXISTS "Users can delete project content" ON project_content;

-- Project integrations policies
DROP POLICY IF EXISTS "Users can view their project integrations" ON project_integrations;
DROP POLICY IF EXISTS "Users can insert project integrations" ON project_integrations;
DROP POLICY IF EXISTS "Users can update project integrations" ON project_integrations;
DROP POLICY IF EXISTS "Users can delete project integrations" ON project_integrations;

-- Collaborators policies
DROP POLICY IF EXISTS "Users can view collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can insert collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can update collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can delete collaborators" ON collaborators;

-- Collaborator invites policies
DROP POLICY IF EXISTS "Users can view invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can insert invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Users can update invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can delete invites" ON collaborator_invites;

-- ============================================
-- DROP AND RECREATE HELPER FUNCTIONS WITH PROPER SETTINGS
-- ============================================

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS public.user_owns_project(UUID, UUID);
DROP FUNCTION IF EXISTS public.user_has_project_access(UUID, UUID);
DROP FUNCTION IF EXISTS public.get_user_project_ids(UUID);

-- Recreate with SECURITY DEFINER and proper search_path
-- The key is to set the search_path to avoid schema injection attacks
-- and ensure the function runs with the owner's privileges

CREATE OR REPLACE FUNCTION public.user_owns_project(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects WHERE id = p_project_id AND user_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_has_project_access(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects WHERE id = p_project_id AND user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.collaborators WHERE project_id = p_project_id AND user_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_project_ids(p_user_id UUID)
RETURNS TABLE(project_id UUID) AS $$
  SELECT id FROM public.projects WHERE user_id = p_user_id
  UNION
  SELECT project_id FROM public.collaborators WHERE user_id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.user_owns_project(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_project_access(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_project_ids(UUID) TO authenticated;

-- ============================================
-- DROP AND RECREATE COLLABORATOR_INVITES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can insert invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Users can update invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can delete invites" ON collaborator_invites;

-- Ensure RLS is enabled
ALTER TABLE collaborator_invites ENABLE ROW LEVEL SECURITY;

-- SELECT: Project owners can see all invites, invited users can see their own
CREATE POLICY "Users can view invites"
  ON collaborator_invites FOR SELECT
  USING (
    public.user_owns_project(project_id, auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- INSERT: Only project owners can create invites
CREATE POLICY "Project owners can insert invites"
  ON collaborator_invites FOR INSERT
  WITH CHECK (
    public.user_owns_project(project_id, auth.uid())
  );

-- UPDATE: Project owners can update any invite, invited users can update their own
CREATE POLICY "Users can update invites"
  ON collaborator_invites FOR UPDATE
  USING (
    public.user_owns_project(project_id, auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- DELETE: Only project owners can delete invites
CREATE POLICY "Project owners can delete invites"
  ON collaborator_invites FOR DELETE
  USING (
    public.user_owns_project(project_id, auth.uid())
  );

-- ============================================
-- ALSO FIX COLLABORATORS TABLE POLICIES (for good measure)
-- ============================================

DROP POLICY IF EXISTS "Users can view collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can insert collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can update collaborators" ON collaborators;
DROP POLICY IF EXISTS "Project owners can delete collaborators" ON collaborators;

-- Ensure RLS is enabled
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborators"
  ON collaborators FOR SELECT
  USING (
    public.user_owns_project(project_id, auth.uid())
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
-- ALTERNATIVE: RPC FUNCTION TO CREATE INVITES (bypasses RLS)
-- Use this if direct insert still fails
-- ============================================

CREATE OR REPLACE FUNCTION public.create_collaborator_invite(
  p_project_id UUID,
  p_email TEXT,
  p_role TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
  v_invite_id UUID;
  v_token UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Verify user owns the project
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id AND user_id = v_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'You do not own this project');
  END IF;

  -- Check if already a collaborator
  IF EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = p_project_id AND email = p_email) THEN
    RETURN json_build_object('success', false, 'error', 'This user is already a collaborator');
  END IF;

  -- Check if already invited (pending)
  IF EXISTS (SELECT 1 FROM public.collaborator_invites WHERE project_id = p_project_id AND email = p_email AND status = 'pending') THEN
    RETURN json_build_object('success', false, 'error', 'This email has already been invited');
  END IF;

  -- Get inviter name
  SELECT raw_user_meta_data->>'name' INTO v_user_name FROM auth.users WHERE id = v_user_id;

  -- Generate token and expiry
  v_token := gen_random_uuid();
  v_expires_at := NOW() + INTERVAL '7 days';

  -- Create the invite
  INSERT INTO public.collaborator_invites (project_id, email, role, status, token, invited_by, invited_by_name, expires_at)
  VALUES (p_project_id, p_email, p_role, 'pending', v_token, v_user_id, COALESCE(v_user_name, 'Unknown'), v_expires_at)
  RETURNING id INTO v_invite_id;

  RETURN json_build_object(
    'success', true,
    'id', v_invite_id,
    'token', v_token,
    'expires_at', v_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.create_collaborator_invite(UUID, TEXT, TEXT) TO authenticated;

-- ============================================
-- RECREATE PROJECT_CONTENT POLICIES
-- ============================================

ALTER TABLE project_content ENABLE ROW LEVEL SECURITY;

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
-- RECREATE PROJECT_INTEGRATIONS POLICIES
-- ============================================

ALTER TABLE project_integrations ENABLE ROW LEVEL SECURITY;

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
-- VERIFY SETUP
-- ============================================

-- This should return the policies we just created
-- SELECT tablename, policyname FROM pg_policies
-- WHERE tablename IN ('collaborator_invites', 'collaborators', 'project_content', 'project_integrations');
