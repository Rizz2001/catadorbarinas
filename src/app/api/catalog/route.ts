import { NextRequest, NextResponse } from 'next/server';
import { fetchArticulosSmartVentas, fetchSubgruposInv } from '@/services/foxdata.service';
import { resolveCatalogSubgroup } from '@/lib/catalogFilters';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const codGrupo = searchParams.get('codGrupo') || '01';
  const codSubgrupo = resolveCatalogSubgroup(searchParams.get('codSubgrupo'));
  const fetchSubgroupsOnly = searchParams.get('subgroups') === 'true';
  const includeHidden = searchParams.get('includeHidden') === 'true';

  try {
    if (fetchSubgroupsOnly) {
      const subgrupos = await fetchSubgruposInv(codGrupo);
      return NextResponse.json({ subgrupos });
    }

    const products = await fetchArticulosSmartVentas(
      codGrupo,
      codSubgrupo,
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
