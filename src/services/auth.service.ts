import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type PerfilRow = Database['public']['Tables']['perfiles']['Row'];

export interface SignUpData {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  cedula: string;
  direccion?: string;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // Obtener perfil para verificar rol
  if (data.user) {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return { session: data.session, user: data.user, perfil: perfil as PerfilRow | null };
  }

  return { session: data.session, user: data.user, perfil: null };
}

export async function signUpUser(data: SignUpData) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        nombre: data.nombre,
        telefono: data.telefono,
        cedula: data.cedula,
        direccion: data.direccion || '',
        rol: 'cliente',
      },
    },
  });

  if (authError) {
    throw authError;
  }

  if (authData.user) {
    // Asegurar inserción directa en perfiles
    try {
      await supabase.from('perfiles').upsert({
        id: authData.user.id,
        nombre: data.nombre,
        telefono: data.telefono,
        cedula: data.cedula,
        direccion: data.direccion || '',
        rol: 'cliente',
      });
    } catch {
      // Ignorar si el trigger ya lo hizo
    }
  }

  return authData;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUserProfile(): Promise<{ user: User | null; perfil: PerfilRow | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, perfil: null };
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, perfil: perfil as PerfilRow | null };
}
