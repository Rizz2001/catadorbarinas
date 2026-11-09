'use server';

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import {
  translateAuthError,
  normalizeCedulaOrRif,
  isValidCedulaOrRif,
  isValidPhone,
} from '@/lib/auth-errors';

export interface RegisterInput {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  cedula: string;
  direccion?: string;
  latitud?: number | null;
  longitud?: number | null;
  origin?: string;
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  emailSent?: boolean;
  email?: string;
  nombre?: string;
  user?: {
    id: string;
    email?: string;
  };
}

function createEphemeralAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Server Action para registrar usuarios en Gran Catador.
 * Envía el correo real de confirmación mediante Supabase Auth,
 * permite iniciar sesión para explorar la tienda, pero mantiene
 * `correo_confirmado: false` hasta que el usuario verifique su correo.
 */
export async function registerUserAction(input: RegisterInput): Promise<RegisterResult> {
  try {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;
    const nombre = input.nombre?.trim();
    const telefono = input.telefono?.trim();
    const cedula = normalizeCedulaOrRif(input.cedula || '');
    const direccion = input.direccion?.trim() || '';

    if (!email || !password || !nombre || !telefono || !cedula) {
      return { success: false, error: 'Por favor completa todos los campos obligatorios.' };
    }

    if (nombre.length < 3) {
      return { success: false, error: 'Ingresa tu nombre y apellido válidos.' };
    }

    if (!isValidCedulaOrRif(cedula)) {
      return {
        success: false,
        error: 'Ingresa un número de Cédula o RIF válido (ejemplo: V-18456789).',
      };
    }

    if (!isValidPhone(telefono)) {
      return {
        success: false,
        error: 'Ingresa un número de teléfono móvil válido (ejemplo: 0414-1234567).',
      };
    }

    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const adminClient = getSupabaseAdmin();

    // 1. Verificar si el correo ya existe para dar un mensaje claro en español
    const { data: existingList } = await adminClient.auth.admin.listUsers();
    const alreadyExists = existingList?.users?.some(
      (u) => u.email?.toLowerCase() === email
    );

    if (alreadyExists) {
      return {
        success: false,
        error:
          'Este correo electrónico ya está registrado en Gran Catador. Por favor inicia sesión o recupera tu contraseña.',
      };
    }

    // 2. Generar token criptográfico único para el enlace de confirmación (validez de 24 horas)
    const tokenConfirmacion = crypto.randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const baseOrigin =
      input.origin && input.origin.startsWith('http')
        ? input.origin.replace(/\/$/, '')
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const emailRedirectTo = `${baseOrigin}/confirmar-correo?token=${tokenConfirmacion}`;

    const userMetadata = {
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
    };

    // 3. Registrar con signUp para disparar el envío real del correo de verificación de Supabase
    const anonClient = createEphemeralAnonClient();
    const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: userMetadata,
      },
    });

    let createdUserId: string | null = signUpData?.user?.id || null;
    let emailSent = true;

    if (signUpError) {
      const errLower = signUpError.message.toLowerCase();
      // Si el servidor SMTP por defecto de Supabase alcanza el límite de envíos por hora,
      // creamos el usuario con email_confirm: false para no bloquear el registro.
      if (
        errLower.includes('rate limit') ||
        errLower.includes('over_email_send_rate_limit') ||
        errLower.includes('can only request this after')
      ) {
        emailSent = false;
        const { data: fallbackData, error: fallbackError } =
          await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: false,
            user_metadata: userMetadata,
          });

        if (fallbackError || !fallbackData.user) {
          return {
            success: false,
            error: translateAuthError(fallbackError, 'No se pudo completar el registro.'),
          };
        }
        createdUserId = fallbackData.user.id;
      } else {
        return {
          success: false,
          error: translateAuthError(signUpError, 'Error al crear la cuenta.'),
        };
      }
    }

    if (!createdUserId) {
      return {
        success: false,
        error: 'No se pudo crear el usuario. Por favor intenta nuevamente.',
      };
    }

    // 4. Guardar perfil con correo_confirmado: false y el token en base de datos
    await adminClient.from('perfiles').upsert({
      id: createdUserId,
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
      emailSent,
      email,
      nombre,
      user: {
        id: createdUserId,
        email,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: translateAuthError(err, 'Error inesperado al registrar tu cuenta.'),
    };
  }
}

/**
 * Reenvía el correo de confirmación al buzón del usuario
 */
export async function resendConfirmationEmailAction(
  email: string,
  origin?: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Por favor ingresa tu correo electrónico.' };
    }

    const adminClient = getSupabaseAdmin();

    const { data: userData } = await adminClient.auth.admin.listUsers();
    const foundUser = userData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!foundUser) {
      return {
        success: false,
        error: 'No encontramos ninguna cuenta registrada con ese correo electrónico.',
      };
    }

    const { data: perfil } = await adminClient
      .from('perfiles')
      .select('correo_confirmado')
      .eq('id', foundUser.id)
      .single();

    if (perfil?.correo_confirmado) {
      return {
        success: true,
        message: 'Tu correo electrónico ya está verificado. Ya puedes realizar pedidos.',
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

    const baseOrigin =
      origin && origin.startsWith('http')
        ? origin.replace(/\/$/, '')
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const emailRedirectTo = `${baseOrigin}/confirmar-correo?token=${newToken}`;

    const anonClient = createEphemeralAnonClient();
    const { error: resendError } = await anonClient.auth.resend({
      type: 'signup',
      email: cleanEmail,
      options: {
        emailRedirectTo,
      },
    });

    if (resendError) {
      return {
        success: false,
        error: translateAuthError(
          resendError,
          'No pudimos reenviar el correo en este momento. Intenta en unos segundos.'
        ),
      };
    }

    return {
      success: true,
      message: `Hemos enviado un nuevo enlace de confirmación a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`,
    };
  } catch (err) {
    return {
      success: false,
      error: translateAuthError(err, 'Error al reenviar el correo de confirmación.'),
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
      return { success: false, error: 'El enlace de confirmación es inválido o está incompleto.' };
    }

    const adminClient = getSupabaseAdmin();

    const { data: perfil, error } = await adminClient
      .from('perfiles')
      .select('id, nombre, correo_confirmado, token_confirmacion_expira')
      .eq('token_confirmacion', cleanToken)
      .single();

    if (error || !perfil) {
      return {
        success: false,
        error: 'El enlace de confirmación no es válido o ya fue utilizado anteriormente.',
      };
    }

    if (perfil.token_confirmacion_expira) {
      const expiraMs = new Date(perfil.token_confirmacion_expira).getTime();
      if (Date.now() > expiraMs) {
        return {
          success: false,
          error: 'El enlace de confirmación ha expirado. Solicita uno nuevo a continuación.',
        };
      }
    }

    await adminClient
      .from('perfiles')
      .update({
        correo_confirmado: true,
        token_confirmacion: null,
        token_confirmacion_expira: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', perfil.id);

    await adminClient.auth.admin.updateUserById(perfil.id, {
      email_confirm: true,
      user_metadata: { correo_confirmado: true },
    });

    return {
      success: true,
      message: '¡Tu correo electrónico ha sido verificado con éxito! Ya puedes realizar pedidos.',
    };
  } catch (err) {
    return {
      success: false,
      error: translateAuthError(err, 'Error al verificar tu correo electrónico.'),
    };
  }
}

/**
 * Sincroniza y confirma el perfil cuando Supabase Auth valida una sesión o código OTP
 */
export async function confirmUserEmailByIdAction(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!userId) return { success: false, error: 'Identificador de usuario requerido.' };

    const adminClient = getSupabaseAdmin();

    await adminClient
      .from('perfiles')
      .update({
        correo_confirmado: true,
        token_confirmacion: null,
        token_confirmacion_expira: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    await adminClient.auth.admin.updateUserById(userId, {
      email_confirm: true,
      user_metadata: { correo_confirmado: true },
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: translateAuthError(err, 'Error al confirmar la cuenta.'),
    };
  }
}
