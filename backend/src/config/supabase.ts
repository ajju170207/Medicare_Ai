import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

// Load env vars if not already loaded by server.ts (useful for standalone scripts)
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gztasrkaankwbwoirhxs.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_L6sSAYtWaVBeqyLXJdahEA_D0OYQtrP';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY not fully set in .env. Using fallback keys.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false
    },
    realtime: {
        transport: ws as any
    }
});
