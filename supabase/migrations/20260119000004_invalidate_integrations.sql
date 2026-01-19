-- ✅ SECURITY FIX (H-4): Invalidate old integrations after encryption key changes
-- Old credentials/tokens cannot be decrypted with the new key derivation scheme
-- Users will need to reconnect their integrations

-- Clear all existing integration connections
-- The encrypted data is now invalid due to changed salt and iteration count
UPDATE integration_connections
SET
  is_connected = FALSE,
  encrypted_credentials = NULL,
  encrypted_tokens = NULL,
  updated_at = NOW()
WHERE is_connected = TRUE;

-- Optional: Add a comment to track this security fix
COMMENT ON TABLE integration_connections IS
  'Integration connections table. Note: All connections were reset on 2026-01-19 due to encryption security improvements (H-4).';
