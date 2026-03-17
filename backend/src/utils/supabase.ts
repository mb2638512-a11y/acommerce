import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabaseInstance: any = null;

export const getSupabase = () => {
    if (supabaseInstance) return supabaseInstance;
    if (!supabaseUrl || !supabaseKey) {
        console.warn('Backend: Supabase URL or Key is missing. Supabase integration disabled.');
        return null;
    }
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
        return supabaseInstance;
    } catch (e) {
        console.error('Backend: Supabase initialization failed.', e);
        return null;
    }
};

export const supabase = getSupabase();
