import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createClientForServer, getSupabaseAdmin } from '@/lib/supabase/server';

export interface AuthenticatedContext {
  user: User;
  rol: 'cliente' | 'admin' | 'repartidor';
  suspendido: boolean;
  motivoSuspension: string | null;
}

export type AuthGuardResult =
  | { ok: true; context: AuthenticatedContext }
  | { ok: false; response: NextResponse };

/**
 * Valida la sesión activa contra Supabase Auth y obtiene el rol real desde perfiles.
 * Retorna 401 si no hay sesión o 403 si la cuenta está suspendida.
 */
export async function requireAuthenticatedUser(): Promise<AuthGuardResult> {
  const supabaseServer = await createClientForServer();
  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('rol, suspendido, motivo_suspension')
    .eq('id', user.id)
    .maybeSingle();

  const typedPerfil = perfil as {
    rol?: 'cliente' | 'admin' | 'repartidor';
    suspendido?: boolean;
    motivo_suspension?: string | null;
  } | null;

  if (typedPerfil?.suspendido) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            typedPerfil.motivo_suspension ||
            'Tu cuenta se encuentra suspendida. Contacta a soporte.',
        },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    context: {
      user,
      rol: typedPerfil?.rol || 'cliente',
      suspendido: Boolean(typedPerfil?.suspendido),
      motivoSuspension: typedPerfil?.motivo_suspension ?? null,
    },
  };
}

/**
 * Exige una sesión autenticada con rol 'admin' en public.perfiles.
 */
export async function requireAdminUser(): Promise<AuthGuardResult> {
  const authResult = await requireAuthenticatedUser();
  if (!authResult.ok) return authResult;

  if (authResult.context.rol !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

