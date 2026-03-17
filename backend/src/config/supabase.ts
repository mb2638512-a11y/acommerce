import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('Backend Config: Supabase client initialized.');
    } catch (e) {
        console.warn('Backend Config: Supabase client initialization failed.', e);
    }
} else {
    console.warn('Backend Config: Supabase URL or Anon Key missing. Supabase features disabled.');
}

export { supabase };
