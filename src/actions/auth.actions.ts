'use server';

import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface RegisterInput {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  cedula: string;
  direccion?: string;
  latitud?: number | null;
  longitud?: number | null;
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  tokenConfirmacion?: string;
  email?: string;
  nombre?: string;
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Server Action para registrar usuarios en Gran Catador.
 * Permite al usuario entrar a su cuenta/tienda inmediatamente,
 * pero marca `correo_confirmado: false` para bloquear pedidos hasta su confirmación.
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

    // Generar token criptográfico único para verificación de correo (validez de 24 horas)
    const tokenConfirmacion = crypto.randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Crear usuario en Supabase Auth
    // Se deja email_confirm: true a nivel de Supabase Auth para que el usuario pueda iniciar sesión
    // y navegar por la tienda, pero la regla de negocio bloquea pedidos mediante `correo_confirmado: false`.
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
        latitud: input.latitud ?? null,
        longitud: input.longitud ?? null,
        rol: 'cliente',
        correo_confirmado: false,
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

    // Guardar en tabla perfiles con correo_confirmado: false y el token
    await adminClient.from('perfiles').upsert({
      id: data.user.id,
      nombre,
      telefono,
      cedula,
      direccion,
      latitud: input.latitud ?? null,
      longitud: input.longitud ?? null,
      rol: 'cliente',
      correo_confirmado: false,
      token_confirmacion: tokenConfirmacion,
      token_confirmacion_expira: tokenExpira,
      updated_at: new Date().toISOString(),
    });

    return {
      success: true,
      requiresEmailConfirmation: true,
      email,
      nombre,
      tokenConfirmacion,
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

/**
 * Reenvía o regenera un nuevo enlace/token de confirmación de correo
 */
export async function resendConfirmationEmailAction(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  tokenConfirmacion?: string;
}> {
  try {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Correo electrónico requerido.' };
    }

    const adminClient = getSupabaseAdmin();

    // Buscar usuario en auth.users
    const { data: userData } = await adminClient.auth.admin.listUsers();
    const foundUser = userData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!foundUser) {
      return { success: false, error: 'No se encontró ninguna cuenta con este correo.' };
    }

    // Comprobar si ya está confirmado
    const { data: perfil } = await adminClient
      .from('perfiles')
      .select('correo_confirmado')
      .eq('id', foundUser.id)
      .single();

    if (perfil?.correo_confirmado) {
      return {
        success: true,
        message: 'Tu correo electrónico ya se encuentra confirmado. Ya puedes realizar pedidos.',
      };
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpira = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await adminClient
      .from('perfiles')
      .update({
        token_confirmacion: newToken,
        token_confirmacion_expira: newExpira,
        correo_confirmado: false,
      })
      .eq('id', foundUser.id);

    return {
      success: true,
      message: `Hemos generado un nuevo enlace de confirmación para ${cleanEmail}.`,
      tokenConfirmacion: newToken,
    };
  } catch (err) {
    console.error('Error en resendConfirmationEmailAction:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al reenviar confirmación.',
    };
  }
}

/**
 * Valida el token de confirmación de correo y activa la cuenta para hacer pedidos
 */
export async function verifyEmailConfirmationTokenAction(token: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  email?: string;
}> {
  try {
    const cleanToken = token?.trim();
    if (!cleanToken) {
      return { success: false, error: 'Token de confirmación inválido o ausente.' };
    }

    const adminClient = getSupabaseAdmin();

    // Buscar perfil con este token
    const { data: perfil, error } = await adminClient
      .from('perfiles')
      .select('id, nombre, correo_confirmado, token_confirmacion_expira')
      .eq('token_confirmacion', cleanToken)
      .single();

    if (error || !perfil) {
      return {
        success: false,
        error: 'El enlace de confirmación es inválido o ya fue utilizado.',
      };
    }

    // Verificar expiración
    if (perfil.token_confirmacion_expira) {
      const expiraMs = new Date(perfil.token_confirmacion_expira).getTime();
      if (Date.now() > expiraMs) {
        return {
          success: false,
          error: 'El enlace de confirmación ha expirado. Por favor solicita uno nuevo.',
        };
      }
    }

    // Activar perfil
    await adminClient
      .from('perfiles')
      .update({
        correo_confirmado: true,
        token_confirmacion: null,
        token_confirmacion_expira: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', perfil.id);

    // Actualizar metadatos en auth.users
    await adminClient.auth.admin.updateUserById(perfil.id, {
      user_metadata: { correo_confirmado: true },
    });

    return {
      success: true,
      message: '¡Correo confirmado con éxito! Tu cuenta ahora puede realizar pedidos.',
    };
  } catch (err) {
    console.error('Error en verifyEmailConfirmationTokenAction:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al verificar token.',
    };
  }
}
