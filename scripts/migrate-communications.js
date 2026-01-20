import { supabase } from '../lib/supabase';

/**
 * One-time migration script to create the communications table
 * Run this once with: node scripts/migrate-communications.js
 */

const migrationSQL = `
-- Create communications table for admin announcements
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'important', 'technical')),
    message TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read published communications" ON public.communications;
DROP POLICY IF EXISTS "Admin can manage all communications" ON public.communications;

-- Policy: Anyone can read published communications
CREATE POLICY "Anyone can read published communications"
    ON public.communications
    FOR SELECT
    USING (is_published = true);

-- Policy: Admin can do everything
CREATE POLICY "Admin can manage all communications"
    ON public.communications
    FOR ALL
    USING (
        auth.jwt() ->> 'email' = 'bobgama@uol.com.br'
    );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_communications_published ON public.communications(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON public.communications(created_at DESC);
`;

async function runMigration() {
    console.log('🔄 Running communications table migration...');

    try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

        if (error) {
            console.error('❌ Migration failed:', error);
            process.exit(1);
        }

        console.log('✅ Migration completed successfully!');
        console.log('📊 Communications table created with RLS policies');
        process.exit(0);
    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

runMigration();
