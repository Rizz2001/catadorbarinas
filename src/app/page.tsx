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
import { getBannersServer } from '@/services/cms.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [featuredDeals, weeklyTrends, starProduct, groups, initialSubgroups, initialProducts, banners] =
    await Promise.all([
      getFeaturedDeals(),
      getWeeklyTrends(),
      getStarProduct(),
      fetchGruposInv(),
      fetchSubgruposInv('01'),
      fetchArticulosSmartVentas('01'),
      getBannersServer(),
    ]);

  const heroBanner = banners.find((b) => b.tipo === 'hero') || null;
  const promoGridBanner = banners.find((b) => b.tipo === 'promocion_grid') || null;
  const secundarioBanner = banners.find((b) => b.tipo === 'secundario') || null;

  return (
    <main className="container mx-auto px-4 py-6 space-y-10">
      {/* 1. Hero Banner Principal & Categorías Rápidas */}
      <HeroBanner initialBanner={heroBanner} />

      {/* 2. Grid de 3 Banners Promocionales Secundarios (Dinámicos por CMS) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="relative overflow-hidden rounded-xl bg-slate-100 p-5 border border-slate-200/80 flex flex-col justify-between hover:border-catador-blue/40 transition-colors"
          style={
            promoGridBanner?.imagen_url
              ? {
                  backgroundImage: `linear-gradient(rgba(241, 245, 249, 0.88), rgba(241, 245, 249, 0.94)), url(${promoGridBanner.imagen_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-catador-amber">
              {promoGridBanner?.badge_texto || 'SELECCIÓN PREMIUM'}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {promoGridBanner?.titulo || 'Whiskies Escoceses'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {promoGridBanner?.subtitulo || "Buchanan's, Old Parr, Chivas y Black Label al mejor precio."}
            </p>
          </div>
          <Link
            href={promoGridBanner?.boton_url || '/catalogo/01/01'}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light"
          >
            {promoGridBanner?.boton_texto || 'Ver selección'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div
          className="relative overflow-hidden rounded-xl bg-slate-100 p-5 border border-slate-200/80 flex flex-col justify-between hover:border-catador-blue/40 transition-colors"
          style={
            secundarioBanner?.imagen_url
              ? {
                  backgroundImage: `linear-gradient(rgba(241, 245, 249, 0.88), rgba(241, 245, 249, 0.94)), url(${secundarioBanner.imagen_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-catador-amber">
              {secundarioBanner?.badge_texto || 'BEBIDAS BIEN FRÍAS'}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {secundarioBanner?.titulo || 'Cervezas & Refrescos'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {secundarioBanner?.subtitulo || 'Polar, Solera, Corona y refrescos para tus celebraciones.'}
            </p>
          </div>
          <Link
            href={secundarioBanner?.boton_url || '/catalogo/09'}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light"
          >
            {secundarioBanner?.boton_texto || 'Ver cervezas'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl bg-slate-100 p-5 border border-slate-200/80 flex flex-col justify-between hover:border-catador-blue/40 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-catador-amber">
              DISPENSARIO Y HOGAR
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Víveres &amp; Despensa</h3>
            <p className="text-xs text-slate-600 mt-1">Harina PAN, arroz, salsas y productos básicos para tu hogar.</p>
          </div>
          <Link
            href="/catalogo/11"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light"
          >
            Ver víveres <ArrowRight className="h-3.5 w-3.5" />
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
