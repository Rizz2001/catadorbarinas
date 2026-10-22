import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  HeroBanner,
  FeaturedDealsBox,
  WeeklyTrendsBento,
  LiveCatalogSection,
} from '@/components/ecommerce';
import {
  getFeaturedDeals,
  getWeeklyTrends,
  getStarProduct,
} from '@/services/productService';
import {
  fetchGruposInv,
  fetchSubgruposInv,
  fetchArticulosSmartVentas,
} from '@/services/foxdata.service';

export default async function HomePage() {
  const [featuredDeals, weeklyTrends, starProduct, groups, initialSubgroups, initialProducts] =
    await Promise.all([
      getFeaturedDeals(),
      getWeeklyTrends(),
      getStarProduct(),
      fetchGruposInv(),
      fetchSubgruposInv('01'),
      fetchArticulosSmartVentas('01'),
    ]);

  return (
    <main className="container mx-auto px-4 py-6 space-y-10">
      {/* 1. Hero Banner Principal & Categorías Rápidas */}
      <HeroBanner />

      {/* 2. Grid de 3 Banners Promocionales Secundarios */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-100 p-5 border border-slate-200/80 flex flex-col justify-between hover:border-catador-blue/40 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-catador-amber">
              SELECCIÓN PREMIUM
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Whiskies Escoceses</h3>
            <p className="text-xs text-slate-600 mt-1">Buchanan&apos;s, Old Parr y Black Label al mejor precio.</p>
          </div>
          <Link
            href="#catalogo-en-vivo"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light"
          >
            Ver selección <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl bg-slate-100 p-5 border border-slate-200/80 flex flex-col justify-between hover:border-catador-blue/40 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-catador-amber">
              DIRECTO A TU PARRILLA
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Cortes Angus &amp; Carnes</h3>
            <p className="text-xs text-slate-600 mt-1">Punta trasera, solomo y chorizos parrilleros empacados al vacío.</p>
          </div>
          <Link
            href="#catalogo-en-vivo"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light"
          >
            Ver carnicería <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl bg-slate-100 p-5 border border-slate-200/80 flex flex-col justify-between hover:border-catador-blue/40 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-catador-amber">
              TABLAS &amp; DEGUSTACIÓN
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Quesos &amp; Jamón Ibérico</h3>
            <p className="text-xs text-slate-600 mt-1">Parmesano Reggiano, Jamón Serrano y embutidos madurados.</p>
          </div>
          <Link
            href="#catalogo-en-vivo"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light"
          >
            Ver charcutería <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. Sección "Ofertas Destacadas del Día" con Contador Regresivo */}
      <div id="ofertas">
        <FeaturedDealsBox products={featuredDeals} />
      </div>

      {/* 4. Sección "Tendencias de la Semana" (Bento Grid Asimétrico 5 Columnas) */}
      <WeeklyTrendsBento products={weeklyTrends} starProduct={starProduct} />

      {/* 5. Catálogo en Vivo con Grupos y Subgrupos de SmartVentas (Depósito 01) */}
      <LiveCatalogSection
        groups={groups}
        initialSubgroups={initialSubgroups}
        initialProducts={initialProducts}
      />
    </main>
  );
}
