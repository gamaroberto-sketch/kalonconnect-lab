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

-- Policy: Anyone can read published communications
CREATE POLICY "Anyone can read published communications"
    ON public.communications
    FOR SELECT
    USING (is_published = true);

-- Policy: Admin can do everything (you'll need to adjust this based on your admin logic)
-- For now, allowing authenticated users with specific email
CREATE POLICY "Admin can manage all communications"
    ON public.communications
    FOR ALL
    USING (
        auth.jwt() ->> 'email' = 'bobgama@uol.com.br'
    );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_communications_published ON public.communications(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON public.communications(created_at DESC);
