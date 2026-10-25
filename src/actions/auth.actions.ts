'use server';

import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface RegisterInput {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  cedula: string;
  direccion?: string;
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Server Action para registrar usuarios en Gran Catador.
 * Utiliza SUPABASE_SERVICE_ROLE_KEY con email_confirm: true para que
 * el usuario quede confirmado inmediatamente sin quedarse bloqueado.
 */
export async function registerUserAction(input: RegisterInput): Promise<RegisterResult> {
  try {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;
    const nombre = input.nombre?.trim();
    const telefono = input.telefono?.trim();
    const cedula = input.cedula?.trim();
    const direccion = input.direccion?.trim() || '';

    if (!email || !password || !nombre || !telefono || !cedula) {
      return { success: false, error: 'Por favor completa todos los campos requeridos.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const adminClient = getSupabaseAdmin();

    // Crear usuario auto-confirmado con email_confirm: true
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre,
        nombre_completo: nombre,
        telefono,
        cedula,
        cedula_rif: cedula,
        direccion,
        rol: 'cliente',
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes('already registered') ||
        msg.includes('duplicate') ||
        msg.includes('unique')
      ) {
        return {
          success: false,
          error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.',
        };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'No se pudo crear el usuario. Intenta nuevamente.' };
    }

    // Asegurar que el registro en perfiles quede guardado de inmediato
    await adminClient.from('perfiles').upsert({
      id: data.user.id,
      nombre,
      telefono,
      cedula,
      direccion,
      rol: 'cliente',
      updated_at: new Date().toISOString(),
    });

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  } catch (err) {
    console.error('Error en registerUserAction:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error inesperado al registrar usuario.',
    };
  }
}
