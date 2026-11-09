import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Devuelve las búsquedas recientes reales de los usuarios registradas en `historial_busquedas`
 * que hayan arrojado resultados válidos (`resultados_count > 0`), deduplicadas.
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('historial_busquedas')
      .select('termino, termino_normalizado, resultados_count, created_at')
      .gt('resultados_count', 0)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      return NextResponse.json({ terms: [] });
    }

    const seen = new Set<string>();
    const uniqueTerms: string[] = [];

    for (const row of data) {
      const clean = (row.termino || '').trim();
      const norm = (row.termino_normalizado || clean.toLowerCase()).trim();
      if (clean.length >= 2 && !seen.has(norm)) {
        seen.add(norm);
        uniqueTerms.push(clean);
        if (uniqueTerms.length >= 6) break;
      }
    }

    return NextResponse.json({ terms: uniqueTerms });
  } catch {
    return NextResponse.json({ terms: [] });
  }
}

