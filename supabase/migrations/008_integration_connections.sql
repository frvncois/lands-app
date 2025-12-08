-- Integration Connections Table
-- Stores connected integrations for each project

-- Create integration_connections table
CREATE TABLE IF NOT EXISTS public.integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  connected_at TIMESTAMPTZ,
  -- Encrypted OAuth tokens (for OAuth integrations)
  encrypted_tokens TEXT,
  -- Encrypted API credentials (for API key integrations)
  encrypted_credentials TEXT,
  -- Account info (displayed to user - not sensitive)
  account_info JSONB,
  -- Non-sensitive settings
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each project can only have one connection per provider
  UNIQUE(project_id, provider_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_integration_connections_project_id
  ON public.integration_connections(project_id);

CREATE INDEX IF NOT EXISTS idx_integration_connections_provider_id
  ON public.integration_connections(provider_id);

-- OAuth states table (temporary storage for OAuth flow)
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  integration_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for state lookups
CREATE INDEX IF NOT EXISTS idx_oauth_states_state
  ON public.oauth_states(state);

-- Auto-delete expired states
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at
  ON public.oauth_states(expires_at);

-- Enable RLS
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integration_connections
-- Users can view integrations for projects they own
CREATE POLICY "Users can view their project integrations"
  ON public.integration_connections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = integration_connections.project_id
      AND p.user_id = auth.uid()
    )
  );

-- Only project owners can manage integrations
CREATE POLICY "Project owners can insert integrations"
  ON public.integration_connections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = integration_connections.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update integrations"
  ON public.integration_connections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = integration_connections.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete integrations"
  ON public.integration_connections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = integration_connections.project_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for oauth_states
-- Users can only access their own OAuth states
CREATE POLICY "Users can view their own OAuth states"
  ON public.oauth_states
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own OAuth states"
  ON public.oauth_states
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own OAuth states"
  ON public.oauth_states
  FOR DELETE
  USING (user_id = auth.uid());

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_integration_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_integration_connections_updated_at ON public.integration_connections;
CREATE TRIGGER trigger_integration_connections_updated_at
  BEFORE UPDATE ON public.integration_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_connections_updated_at();

-- Function to clean up expired OAuth states (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM public.oauth_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
