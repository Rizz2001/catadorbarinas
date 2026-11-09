import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { translateAuthError } from '@/lib/auth-errors';
import { Database } from '@/types/supabase';

type PerfilRow = Database['public']['Tables']['perfiles']['Row'];

export interface SignUpData {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  cedula: string;
  direccion?: string;
  latitud?: number | null;
  longitud?: number | null;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw new Error(
      translateAuthError(
        error,
        'El correo electrónico o la contraseña son incorrectos. Verifica tus datos.'
      )
    );
  }

  // Obtener perfil para verificar rol y estado de confirmación
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
    email: data.email.trim().toLowerCase(),
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
    throw new Error(translateAuthError(authError, 'No se pudo completar el registro.'));
  }

  if (authData.user) {
    try {
      await supabase.from('perfiles').upsert({
        id: authData.user.id,
        nombre: data.nombre,
        telefono: data.telefono,
        cedula: data.cedula,
        direccion: data.direccion || '',
        latitud: data.latitud ?? null,
        longitud: data.longitud ?? null,
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
  if (error) {
    throw new Error(translateAuthError(error, 'Error al cerrar sesión.'));
  }
}

export async function sendPasswordResetEmail(email: string) {
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/actualizar-clave`
      : 'http://localhost:3000/actualizar-clave';

  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  });

  if (error) {
    throw new Error(
      translateAuthError(
        error,
        'No pudimos enviar el enlace de recuperación. Verifica tu correo e intenta nuevamente.'
      )
    );
  }

  return data;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(
      translateAuthError(
        error,
        'No se pudo actualizar la contraseña. Verifica tu sesión e intenta nuevamente.'
      )
    );
  }

  return data;
}

export async function getCurrentUserProfile(): Promise<{
  user: User | null;
  perfil: PerfilRow | null;
}> {
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
