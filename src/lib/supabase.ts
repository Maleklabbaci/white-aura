import { createClient } from '@supabase/supabase-js';

const supabaseUrl = https://aujoeimzszxfpbujkkxq.supabase.co;
const supabaseAnonKey = sb_publishable_oRoaLu-IAFsTbuneOE6a_Q_KtdF3B9X;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('⚠️ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant dans .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
