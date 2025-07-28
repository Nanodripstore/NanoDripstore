import { createClient } from '@supabase/supabase-js';

// Create a single Supabase client for interacting with your database
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('SUPABASE_URL or SUPABASE_KEY not provided. Supabase client will not be initialized.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
