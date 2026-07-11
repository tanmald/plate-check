import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Use placeholder values if env vars are missing (for build/preview environments)
// The app will still work but auth features will be disabled
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabasePublishableKey || 'placeholder-key';

export const supabase = createClient(url, key);

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// The resolved project URL (placeholder when unconfigured), for building
// direct links to edge functions outside the supabase-js client.
export const resolvedSupabaseUrl = url;
