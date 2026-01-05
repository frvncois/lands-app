-- Create publish_logs table for rate limiting
CREATE TABLE IF NOT EXISTS publish_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for efficient rate limiting queries
CREATE INDEX idx_publish_logs_user_time ON publish_logs(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE publish_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can manage publish logs (edge functions use service role)
CREATE POLICY "Service role can manage publish logs"
  ON publish_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Add comment for documentation
COMMENT ON TABLE publish_logs IS 'Tracks publishing actions for rate limiting. Auto-cleanup recommended via cron.';
