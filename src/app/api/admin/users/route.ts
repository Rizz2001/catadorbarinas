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
  const { targetUserId, newRole } = body;

  if (!targetUserId || !['cliente', 'admin', 'repartidor'].includes(newRole)) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
  }

  const { error: updateError } = await supabaseAdmin
    .from('perfiles')
    .update({ rol: newRole, updated_at: new Date().toISOString() })
    .eq('id', targetUserId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
