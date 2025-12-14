import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Only create the client if the key exists to avoid errors
// This should ONLY be used in server-side API routes
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

if (!supabaseAdmin && typeof window === 'undefined') {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations will fail.');
}
