import type { SupabaseClient } from '@supabase/supabase-js';

// Only initialize Supabase when Firebase is NOT being used
const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;
let initialized = false;

export const getSupabase = (): SupabaseClient | null => {
    // Skip Supabase initialization if Firebase is enabled
    if (USE_FIREBASE) return null;
    
    if (initialized && supabaseInstance) return supabaseInstance;
    if (initialized && !supabaseInstance) return null;
    
    if (!supabaseUrl || !supabaseKey) {
        initialized = true;
        return null;
    }

    try {
        // Dynamic import to prevent DNS lookup at module load time
        const { createClient } = require('@supabase/supabase-js');
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
        initialized = true;
        return supabaseInstance;
    } catch (e) {
        console.error('Supabase: Initialization failed.', e);
        initialized = true;
        return null;
    }
};

// Export singleton for ease of use, but consumers should handle null
export const supabase = getSupabase();
