import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, createClientForServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseServer = await createClientForServer();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (perfil?.rol !== 'admin') {
    return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
  }

  const { data: users, error } = await supabaseAdmin
    .from('perfiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users });
}

export async function PATCH(request: NextRequest) {
  const supabaseServer = await createClientForServer();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (perfil?.rol !== 'admin') {
    return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
  }

  const body = await request.json();
  const {
    targetUserId,
    newRole,
    rol,
    nombre,
    cedula,
    telefono,
    direccion,
    suspendido,
    motivo_suspension,
    correo_confirmado,
    latitud,
    longitud,
  } = body;

  if (!targetUserId) {
    return NextResponse.json({ error: 'targetUserId es requerido' }, { status: 400 });
  }

  // Protección: Un administrador no puede suspenderse a sí mismo
  if (targetUserId === user.id && suspendido === true) {
    return NextResponse.json({ error: 'No puedes suspender tu propia cuenta de administrador' }, { status: 400 });
  }

  const roleToSet = rol || newRole;
  if (roleToSet && !['cliente', 'admin', 'repartidor'].includes(roleToSet)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (roleToSet) updatePayload.rol = roleToSet;
  if (nombre !== undefined) updatePayload.nombre = nombre?.trim() || null;
  if (cedula !== undefined) updatePayload.cedula = cedula?.trim() || null;
  if (telefono !== undefined) updatePayload.telefono = telefono?.trim() || null;
  if (direccion !== undefined) updatePayload.direccion = direccion?.trim() || null;
  if (latitud !== undefined) updatePayload.latitud = latitud;
  if (longitud !== undefined) updatePayload.longitud = longitud;
  if (suspendido !== undefined) updatePayload.suspendido = Boolean(suspendido);
  if (motivo_suspension !== undefined) updatePayload.motivo_suspension = motivo_suspension?.trim() || null;
  if (typeof correo_confirmado === 'boolean') updatePayload.correo_confirmado = correo_confirmado;

  const { error: updateError } = await supabaseAdmin
    .from('perfiles')
    .update(updatePayload)
    .eq('id', targetUserId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: updatePayload });
}

export async function DELETE(request: NextRequest) {
  const supabaseServer = await createClientForServer();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (perfil?.rol !== 'admin') {
    return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get('userId');

  if (!targetUserId) {
    return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
  }

  // Protección: No permitir que el admin se borre a sí mismo
  if (targetUserId === user.id) {
    return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta de administrador' }, { status: 400 });
  }

  try {
    // 1. Eliminar perfil de la tabla perfiles
    const { error: perfilError } = await supabaseAdmin
      .from('perfiles')
      .delete()
      .eq('id', targetUserId);

    if (perfilError) {
      console.error('Error eliminando perfil:', perfilError);
    }

    // 2. Eliminar cuenta de auth.users usando Supabase Admin Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (authError) {
      console.warn('Aviso eliminando auth.user:', authError.message);
    }

    return NextResponse.json({ success: true, deletedId: targetUserId });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Error eliminando usuario' }, { status: 500 });
  }
}
