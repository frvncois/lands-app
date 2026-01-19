-- ✅ SECURITY FIX: Fix publish_logs RLS policies
-- Replace overly permissive service_role policy with proper user-based policies

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Service role can view all publish logs" ON publish_logs;

-- Allow users to view their own publish logs (as project owners)
CREATE POLICY "Users can view their own publish logs"
  ON publish_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own publish logs
CREATE POLICY "Users can insert their own publish logs"
  ON publish_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow collaborators to view publish logs for projects they have access to
CREATE POLICY "Collaborators can view project publish logs"
  ON publish_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.project_id = publish_logs.project_id
        AND collaborators.user_id = auth.uid()
        
    )
  );

-- Optional: Allow viewing logs for projects the user owns (via project ownership)
-- This is redundant with "Users can view their own publish logs" but more explicit
CREATE POLICY "Project owners can view publish logs"
  ON publish_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = publish_logs.project_id
        AND projects.user_id = auth.uid()
    )
  );
