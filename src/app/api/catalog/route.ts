import { NextRequest, NextResponse } from 'next/server';
import { fetchArticulosSmartVentas, fetchSubgruposInv } from '@/services/foxdata.service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const codGrupo = searchParams.get('codGrupo') || '01';
  const codSubgrupo = searchParams.get('codSubgrupo') || undefined;
  const fetchSubgroupsOnly = searchParams.get('subgroups') === 'true';
  const includeHidden = searchParams.get('includeHidden') === 'true';

  try {
    if (fetchSubgroupsOnly) {
      const subgrupos = await fetchSubgruposInv(codGrupo);
      return NextResponse.json({ subgrupos });
    }

    const products = await fetchArticulosSmartVentas(
      codGrupo,
      codSubgrupo === 'todos' ? undefined : codSubgrupo,
      includeHidden
    );

    return NextResponse.json({
      codGrupo,
      codSubgrupo: codSubgrupo || 'todos',
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error en API /api/catalog:', error);
    return NextResponse.json(
      { error: 'Error al consultar catálogo de SmartVentas' },
      { status: 500 }
    );
  }
}
