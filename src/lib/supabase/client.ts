import { createBrowserClient } from '@supabase/ssr';

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Cliente oficial de Supabase para el navegador (Client Components).
 * Escribe y sincroniza tokens automáticamente en cookies (`document.cookie`)
 * para que el servidor Next.js y el Middleware reciban siempre la sesión activa.
 */
export function createClient() {
  if (clientInstance) {
    return clientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno.');
  }

  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
  });
  return clientInstance;
}

/**
 * Instancia singleton para uso directo en Client Components
 */
export const supabase = createClient();
