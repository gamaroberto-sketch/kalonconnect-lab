-- Add deleted_at column to support Soft Delete
-- Run this in the Supabase SQL Editor

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Optional: Create an index for performance if filtering by deleted_at often
-- CREATE INDEX idx_clients_deleted_at ON clients(deleted_at);
