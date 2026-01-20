-- Migration to add Google Drive OAuth columns to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_token_expiry TEXT,
ADD COLUMN IF NOT EXISTS drive_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS drive_connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;

-- Recommended: Add Policy to protect these tokens if RLS is enabled
-- (Only the user themselves should see their tokens)
-- Existing policies usually cover 'select using ID', but ensure 'service_role' can access.
