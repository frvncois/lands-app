-- Add token column to collaborator_invites for secure invite links
-- Run this in your Supabase SQL Editor

-- ============================================
-- ADD TOKEN COLUMN
-- ============================================

-- Add token column if it doesn't exist
ALTER TABLE collaborator_invites
ADD COLUMN IF NOT EXISTS token UUID DEFAULT uuid_generate_v4() UNIQUE;

-- Update existing rows to have tokens (if any exist without one)
UPDATE collaborator_invites SET token = uuid_generate_v4() WHERE token IS NULL;

-- Make token NOT NULL after populating existing rows
ALTER TABLE collaborator_invites ALTER COLUMN token SET NOT NULL;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_collaborator_invites_token ON collaborator_invites(token);

-- ============================================
-- CREATE FUNCTION TO ACCEPT INVITE BY TOKEN
-- This bypasses normal RLS since we verify via token
-- ============================================

CREATE OR REPLACE FUNCTION public.accept_invite_by_token(p_token UUID)
RETURNS JSON AS $$
DECLARE
  v_invite RECORD;
  v_user_id UUID;
  v_user_email TEXT;
  v_result JSON;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get user's email
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  -- Find the invite by token
  SELECT * INTO v_invite FROM collaborator_invites
  WHERE token = p_token AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invite');
  END IF;

  -- Check if invite has expired
  IF v_invite.expires_at < NOW() THEN
    UPDATE collaborator_invites SET status = 'expired' WHERE id = v_invite.id;
    RETURN json_build_object('success', false, 'error', 'Invite has expired');
  END IF;

  -- Verify email matches (case-insensitive)
  IF LOWER(v_invite.email) != LOWER(v_user_email) THEN
    RETURN json_build_object('success', false, 'error', 'This invite was sent to a different email address');
  END IF;

  -- Check if user is already a collaborator
  IF EXISTS (SELECT 1 FROM collaborators WHERE project_id = v_invite.project_id AND user_id = v_user_id) THEN
    -- Update invite status anyway
    UPDATE collaborator_invites SET status = 'accepted' WHERE id = v_invite.id;
    RETURN json_build_object('success', true, 'message', 'Already a collaborator', 'project_id', v_invite.project_id);
  END IF;

  -- Add user as collaborator
  INSERT INTO collaborators (project_id, user_id, role, email, name)
  SELECT
    v_invite.project_id,
    v_user_id,
    v_invite.role,
    v_user_email,
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = v_user_id);

  -- Update invite status
  UPDATE collaborator_invites SET status = 'accepted' WHERE id = v_invite.id;

  RETURN json_build_object(
    'success', true,
    'message', 'Successfully joined project',
    'project_id', v_invite.project_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CREATE FUNCTION TO GET INVITE INFO BY TOKEN (public, no auth required)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_invite_info(p_token UUID)
RETURNS JSON AS $$
DECLARE
  v_invite RECORD;
  v_project_title TEXT;
  v_inviter_name TEXT;
BEGIN
  -- Find the invite
  SELECT ci.*, p.title as project_title
  INTO v_invite
  FROM collaborator_invites ci
  JOIN projects p ON p.id = ci.project_id
  WHERE ci.token = p_token;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invite not found');
  END IF;

  -- Check if expired
  IF v_invite.expires_at < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'Invite has expired');
  END IF;

  -- Check if already used
  IF v_invite.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Invite has already been used');
  END IF;

  RETURN json_build_object(
    'success', true,
    'email', v_invite.email,
    'role', v_invite.role,
    'project_title', v_invite.project_title,
    'invited_by', v_invite.invited_by_name,
    'expires_at', v_invite.expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.accept_invite_by_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_invite_info(UUID) TO anon, authenticated;
