-- Add city column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'city'
    ) THEN
        ALTER TABLE users ADD COLUMN city TEXT;
        COMMENT ON COLUMN users.city IS 'City and state (e.g., Rio de Janeiro, RJ or São Paulo, SP)';
    END IF;
END $$;
