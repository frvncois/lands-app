-- Simple RLS fix: Use direct user_id check without helper functions
-- This avoids any potential recursion or SECURITY DEFINER issues

-- ============================================
-- DROP COLLABORATOR_INVITES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can insert invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Users can update invites" ON collaborator_invites;
DROP POLICY IF EXISTS "Project owners can delete invites" ON collaborator_invites;

-- ============================================
-- CREATE SIMPLE POLICIES (no function calls)
-- ============================================

-- SELECT: User owns the project OR is the invited email
CREATE POLICY "Users can view invites"
  ON collaborator_invites FOR SELECT
  USING (
    -- User owns the project (direct subquery, no function)
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborator_invites.project_id
      AND projects.user_id = auth.uid()
    )
    -- OR user is the invited person
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- INSERT: User must own the project
CREATE POLICY "Project owners can insert invites"
  ON collaborator_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborator_invites.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- UPDATE: User owns project OR is invited email
CREATE POLICY "Users can update invites"
  ON collaborator_invites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborator_invites.project_id
      AND projects.user_id = auth.uid()
    )
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- DELETE: User must own the project
CREATE POLICY "Project owners can delete invites"
  ON collaborator_invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = collaborator_invites.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFY: Check that policies were created
-- ============================================
-- Run this to verify:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'collaborator_invites';
