-- Add Google Drive integration columns to users table

-- Add columns for Google OAuth tokens
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_token_expiry TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS drive_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS drive_connected_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_drive_connected ON users(drive_connected);

-- Add comment
COMMENT ON COLUMN users.google_access_token IS 'Google OAuth access token for Drive API';
COMMENT ON COLUMN users.google_refresh_token IS 'Google OAuth refresh token for Drive API';
COMMENT ON COLUMN users.google_token_expiry IS 'Expiry time for Google access token';
COMMENT ON COLUMN users.drive_connected IS 'Whether user has connected Google Drive';
COMMENT ON COLUMN users.drive_connected_at IS 'Timestamp when Drive was connected';
