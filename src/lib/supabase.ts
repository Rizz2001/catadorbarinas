import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'Aviso Supabase: NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas en .env.local'
    );
  }
}

/**
 * Cliente Supabase para el frontend (acceso anónimo / público según RLS)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Cliente Supabase de administración para Server Components y API Routes
 * (Usa SUPABASE_SERVICE_ROLE_KEY si existe, o el anon key en su defecto)
 */
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
