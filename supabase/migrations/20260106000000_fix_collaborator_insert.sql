-- Fix: Allow collaborators to INSERT project_content
-- Issue: Collaborators could UPDATE but not INSERT, causing RLS violations when saving

-- Add INSERT policy for collaborators on project_content
CREATE POLICY "Collaborators can insert content"
  ON project_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.project_id = project_content.project_id
      AND collaborators.user_id = auth.uid()
      AND collaborators.role IN ('editor', 'admin')
    )
  );
