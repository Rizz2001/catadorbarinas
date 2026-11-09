/**
 * Traductor centralizado de errores de autenticación (Supabase Auth -> Español)
 * y validadores de formato para documentos y teléfonos en Venezuela.
 */
export function translateAuthError(error: unknown, fallback = 'Ocurrió un error inesperado. Intenta nuevamente.'): string {
  const raw =
    typeof error === 'string'
      ? error
      : error instanceof Error
      ? error.message
      : error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string'
      ? (error as { message: string }).message
      : '';

  if (!raw) return fallback;

  const msg = raw.toLowerCase().trim();

  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'El correo electrónico o la contraseña son incorrectos. Verifica tus datos e intenta nuevamente.';
  }

  if (
    msg.includes('user already registered') ||
    msg.includes('already been registered') ||
    msg.includes('already exists') ||
    msg.includes('duplicate key')
  ) {
    return 'Este correo electrónico ya está registrado en Gran Catador. Inicia sesión o recupera tu contraseña.';
  }

  if (msg.includes('email not confirmed')) {
    return 'Tu correo electrónico aún no ha sido confirmado. Revisa tu bandeja de entrada o carpeta de spam.';
  }

  if (
    msg.includes('over_email_send_rate_limit') ||
    msg.includes('email rate limit exceeded') ||
    msg.includes('can only request this after') ||
    msg.includes('too many requests')
  ) {
    return 'Has solicitado varios correos recientemente. Por seguridad, espera un minuto antes de volver a intentarlo.';
  }

  if (msg.includes('password should be at least') || msg.includes('weak_password')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }

  if (msg.includes('new password should be different') || msg.includes('same_password')) {
    return 'La nueva contraseña debe ser distinta a tu contraseña actual.';
  }

  if (
    msg.includes('token has expired') ||
    msg.includes('otp_expired') ||
    msg.includes('invalid token') ||
    msg.includes('flow_state_not_found')
  ) {
    return 'El enlace o código de verificación ha expirado o no es válido. Solicita uno nuevo.';
  }

  if (msg.includes('auth session missing') || msg.includes('session_not_found')) {
    return 'Tu sesión de seguridad ha expirado. Solicita un nuevo enlace de recuperación.';
  }

  if (msg.includes('unable to validate email address') || msg.includes('invalid email')) {
    return 'El formato del correo electrónico no es válido. Ejemplo: nombre@correo.com.';
  }

  if (msg.includes('user not found') || msg.includes('user_not_found')) {
    return 'No se encontró ninguna cuenta registrada con ese correo electrónico.';
  }

  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Error de conexión con el servidor. Verifica tu conexión a internet e intenta nuevamente.';
  }

  // Si ya viene en español desde nuestras propias acciones, devolver el mensaje original
  if (/[áéíóúñ¡¿]/i.test(raw) || msg.startsWith('por favor') || msg.startsWith('el ') || msg.startsWith('la ') || msg.startsWith('este ') || msg.startsWith('no ')) {
    return raw;
  }

  return fallback;
}

/**
 * Normaliza Cédula o RIF venezolano (Ej: "18456789" -> "V-18456789", "j312345678" -> "J-312345678")
 */
export function normalizeCedulaOrRif(input: string): string {
  const clean = input.trim().toUpperCase().replace(/[^VEJPG0-9]/g, '');
  if (!clean) return '';

  const firstChar = clean.charAt(0);
  if (['V', 'E', 'J', 'P', 'G'].includes(firstChar)) {
    const digits = clean.slice(1).replace(/\D/g, '');
    return digits ? `${firstChar}-${digits}` : firstChar;
  }

  const digits = clean.replace(/\D/g, '');
  return digits ? `V-${digits}` : '';
}

/**
 * Valida que la Cédula o RIF tenga entre 6 y 10 dígitos numéricos
 */
export function isValidCedulaOrRif(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 10;
}

/**
 * Valida que el teléfono tenga entre 10 y 13 dígitos (Ej: 04141234567 o +584141234567)
 */
export function isValidPhone(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

