import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Only initialize Supabase when Firebase is NOT being used
const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
    // Skip Supabase initialization if Firebase is enabled
    if (USE_FIREBASE) return null;
    
    if (supabaseInstance) return supabaseInstance;
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
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
