import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
    if (supabaseInstance) return supabaseInstance;
    
    if (!supabaseUrl || !supabaseKey) {
        if (import.meta.env.DEV) {
            console.warn('Supabase: Missing environment variables (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY). Supabase features will be disabled.');
        }
        return null;
    }

    try {
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
        return supabaseInstance;
    } catch (e) {
        console.error('Supabase: Initialization failed.', e);
        return null;
    }
};

// Export singleton for ease of use, but consumers should handle null
export const supabase = getSupabase();
