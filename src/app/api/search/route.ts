import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/services/foxdata.service';
import { recordUserSearch } from '@/services/cms-catalog.service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q') || '';
  const group = searchParams.get('group') || undefined;
  const limit = Number(searchParams.get('limit') || '8');
  const includeHidden = searchParams.get('includeHidden') === 'true';
  const shouldLog = searchParams.get('log') === 'true';
  const userId = searchParams.get('userId') || undefined;
  const userName = searchParams.get('userName') || undefined;
  const userEmail = searchParams.get('userEmail') || undefined;

  if (!q.trim() || q.trim().length < 2) {
    return NextResponse.json({ query: q, count: 0, products: [] });
  }

  try {
    const results = await searchProducts(q, group, includeHidden);
    const limited = results.slice(0, limit);

    if (shouldLog && !includeHidden) {
      void recordUserSearch({
        termino: q,
        resultadosCount: results.length,
        usuarioId: userId,
        usuarioNombre: userName,
        usuarioEmail: userEmail,
        departamentoFiltro: group,
      });
    }

    return NextResponse.json({
      query: q,
      totalMatches: results.length,
      count: limited.length,
      products: limited,
    });
  } catch (error) {
    console.error('Error en API /api/search:', error);
    return NextResponse.json(
      { error: 'Error al buscar productos' },
      { status: 500 }
    );
  }
}
