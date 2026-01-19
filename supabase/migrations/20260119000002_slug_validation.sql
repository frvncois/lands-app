-- ✅ SECURITY FIX (H-1): Add server-side slug validation
-- Prevents path traversal attacks via malicious slugs

-- Create reserved slugs table
CREATE TABLE IF NOT EXISTS reserved_slugs (
  slug TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add common reserved slugs
INSERT INTO reserved_slugs (slug, reason) VALUES
  ('api', 'System endpoint'),
  ('app', 'Application route'),
  ('admin', 'Administration route'),
  ('dashboard', 'Application route'),
  ('www', 'Subdomain'),
  ('mail', 'Email subdomain'),
  ('ftp', 'FTP subdomain'),
  ('localhost', 'Reserved hostname'),
  ('assets', 'Static assets'),
  ('static', 'Static files'),
  ('cdn', 'CDN subdomain'),
  ('blog', 'Reserved for future use'),
  ('docs', 'Documentation route'),
  ('help', 'Help center route'),
  ('support', 'Support route'),
  ('status', 'Status page'),
  ('about', 'Reserved route'),
  ('terms', 'Legal route'),
  ('privacy', 'Legal route'),
  ('legal', 'Legal route'),
  ('invite', 'Collaboration route'),
  ('auth', 'Authentication route'),
  ('login', 'Authentication route'),
  ('signup', 'Authentication route'),
  ('register', 'Authentication route'),
  ('settings', 'User settings route'),
  ('account', 'Account management route'),
  ('profile', 'User profile route'),
  ('projects', 'Projects listing route'),
  ('editor', 'Editor route'),
  ('preview', 'Preview route'),
  ('publish', 'Publishing route'),
  ('analytics', 'Analytics route'),
  ('billing', 'Billing route'),
  ('pricing', 'Pricing page route')
ON CONFLICT (slug) DO NOTHING;

-- Create function to validate slug format
CREATE OR REPLACE FUNCTION validate_slug(slug TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if slug is null or empty
  IF slug IS NULL OR slug = '' THEN
    RETURN FALSE;
  END IF;

  -- Check if slug is reserved
  IF EXISTS (SELECT 1 FROM reserved_slugs WHERE reserved_slugs.slug = validate_slug.slug) THEN
    RETURN FALSE;
  END IF;

  -- Check slug format: lowercase alphanumeric and hyphens only, 3-63 chars
  -- Must start and end with alphanumeric, no consecutive hyphens
  IF slug !~ '^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$' THEN
    RETURN FALSE;
  END IF;

  -- Check for path traversal attempts
  IF slug LIKE '%..%' OR slug LIKE '%/%' OR slug LIKE '%\%' THEN
    RETURN FALSE;
  END IF;

  -- Check for consecutive hyphens
  IF slug LIKE '%--%' THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add CHECK constraint to projects table
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_slug_valid;

ALTER TABLE projects
  ADD CONSTRAINT projects_slug_valid
  CHECK (validate_slug(slug));

-- Create index for reserved slugs lookup
CREATE INDEX IF NOT EXISTS idx_reserved_slugs_slug ON reserved_slugs(slug);

-- Grant access to authenticated users to check reserved slugs
GRANT SELECT ON reserved_slugs TO authenticated;
