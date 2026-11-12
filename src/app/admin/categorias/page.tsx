'use client';

import Link from 'next/link';
import { ExternalLink, FolderKanban } from 'lucide-react';
import { QuickCategoriesEditor } from '@/components/admin';

export default function AdminCategoriasPage() {
  return (
    <main className="p-4 sm:p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400">
            Navegación Visual del Catálogo
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-[-0.025em] mt-0.5 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-catador-blue shrink-0" strokeWidth={1.75} />
            <span>Categorías &amp; Colecciones Visuales</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administra las fotos en <code className="font-mono">category-images</code>, el formato cuadrado (1:1) o destacado ancho completo (21:9) para <code className="font-mono">/catalogo</code>.
          </p>
        </div>

        <Link
          href="/catalogo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:border-catador-blue hover:text-catador-blue transition-colors self-start shrink-0"
        >
          <span>Abrir /catalogo en Vivo</span>
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>

      <QuickCategoriesEditor showWireframePreview />
    </main>
  );
}

