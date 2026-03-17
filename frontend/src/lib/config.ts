export const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';
export const USE_SUPABASE = !USE_FIREBASE; // Supabase is the fallback
