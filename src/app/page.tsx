import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import {
  HeroBanner,
  TrustValueBar,
  FeaturedDealsBox,
  WeeklyTrendsBento,
  LiveCatalogSection,
  AlliedBrandsSection,
} from '@/components/ecommerce';
import {
  deriveFeaturedDeals,
  deriveWeeklyTrends,
  deriveStarProduct,
} from '@/services/productService';
import {
  fetchGruposInv,
  fetchSubgruposInv,
  fetchArticulosSmartVentas,
} from '@/services/foxdata.service';
import {
  getBannersServer,
  getQuickCategoriesServer,
  getStoreConfigServer,
  getAlliedBrandsServer,
} from '@/services/cms.server';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const DEFAULT_PROMO_IMAGES = {
  whisky: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
  cervezas: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80',
  despensa: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
};

export default async function HomePage() {
  // Obtenemos los datos una sola vez evitando llamadas redundantes al inventario remoto
  const [
    allProducts,
    groups,
    initialSubgroups,
    banners,
    quickCategories,
    storeConfig,
    alliedBrands,
  ] = await Promise.all([
    fetchArticulosSmartVentas('01'),
    fetchGruposInv(),
    fetchSubgruposInv('01'),
    getBannersServer(),
    getQuickCategoriesServer(),
    getStoreConfigServer(),
    getAlliedBrandsServer(),
  ]);

  const featuredDeals = deriveFeaturedDeals(allProducts);
  const weeklyTrends = deriveWeeklyTrends(allProducts);
  const starProduct = deriveStarProduct(allProducts);
  const leanInitialProducts = allProducts.slice(0, 20);

  const heroBanner = banners.find((b) => b.tipo === 'hero') || null;
  const promo1Banner = banners.find((b) => b.tipo === 'promo_1' || b.tipo === 'promocion_grid') || null;
  const promo2Banner = banners.find((b) => b.tipo === 'promo_2' || b.tipo === 'secundario') || null;
  const promo3Banner = banners.find((b) => b.tipo === 'promo_3') || null;

  const whiskyBg = promo1Banner?.imagen_url || DEFAULT_PROMO_IMAGES.whisky;
  const cervezaBg = promo2Banner?.imagen_url || DEFAULT_PROMO_IMAGES.cervezas;
  const despensaBg = promo3Banner?.imagen_url || DEFAULT_PROMO_IMAGES.despensa;

  return (
    <main className="container mx-auto px-4 py-6 space-y-10">
      {/* 1. Hero Banner Principal con Showcase Visual y Categorías Rápidas */}
      <HeroBanner
        initialBanner={heroBanner}
        initialQuickCategories={quickCategories}
        starProduct={starProduct}
      />

      {/* 2. Barra de Confianza y Garantías de Barinas (Value Proposition) */}
      <TrustValueBar />

      {/* 3. Grid de 3 Banners Promocionales Secundarios (Editables en CMS /admin/banners) */}
      <section aria-label="Banners Promocionales" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Banner 1: Selección Whiskies / Promo 1 CMS */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 border border-slate-700/30 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-200 group min-h-[190px]"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.65) 55%, rgba(15, 23, 42, 0.4) 100%), url(${whiskyBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
              <Sparkles className="h-3 w-3" />
              {promo1Banner?.badge_texto || 'SELECCIÓN PREMIUM'}
            </span>
            <h3 className="text-lg font-black text-white mt-2 leading-tight">
              {promo1Banner?.titulo || 'Whiskies Escoceses'}
            </h3>
            <p className="text-xs text-slate-200 mt-1 line-clamp-2">
              {promo1Banner?.subtitulo || "Buchanan's, Old Parr, Chivas y Black Label al mejor precio oficial."}
            </p>
          </div>
          <Link
            href={promo1Banner?.boton_url || '/catalogo/01/01'}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-amber-300 group-hover:text-amber-200 transition-colors"
          >
            {promo1Banner?.boton_texto || 'Ver selección'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Banner 2: Cervezas & Refrescos / Promo 2 CMS */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 border border-slate-700/30 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-200 group min-h-[190px]"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.65) 55%, rgba(15, 23, 42, 0.4) 100%), url(${cervezaBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
              <Sparkles className="h-3 w-3" />
              {promo2Banner?.badge_texto || 'BEBIDAS BIEN FRÍAS'}
            </span>
            <h3 className="text-lg font-black text-white mt-2 leading-tight">
              {promo2Banner?.titulo || 'Cervezas & Refrescos'}
            </h3>
            <p className="text-xs text-slate-200 mt-1 line-clamp-2">
              {promo2Banner?.subtitulo || 'Polar Pilsen, Solera, Corona y combos con hielo para tus celebraciones.'}
            </p>
          </div>
          <Link
            href={promo2Banner?.boton_url || '/catalogo/09'}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-amber-300 group-hover:text-amber-200 transition-colors"
          >
            {promo2Banner?.boton_texto || 'Ver cervezas frías'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Banner 3: Despensa & Supermercado / Promo 3 CMS */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 border border-slate-700/30 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-200 group min-h-[190px]"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.65) 55%, rgba(15, 23, 42, 0.4) 100%), url(${despensaBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
              <Sparkles className="h-3 w-3" />
              {promo3Banner?.badge_texto || 'DISPENSARIO Y HOGAR'}
            </span>
            <h3 className="text-lg font-black text-white mt-2 leading-tight">
              {promo3Banner?.titulo || 'Víveres & Despensa'}
            </h3>
            <p className="text-xs text-slate-200 mt-1 line-clamp-2">
              {promo3Banner?.subtitulo || 'Harina P.A.N., arroz, aceites de oliva, salsas y productos esenciales para tu hogar.'}
            </p>
          </div>
          <Link
            href={promo3Banner?.boton_url || '/catalogo/11'}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-amber-300 group-hover:text-amber-200 transition-colors"
          >
            {promo3Banner?.boton_texto || 'Explorar víveres'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* 4. Sección "Ofertas Destacadas del Día" con Contador Regresivo */}
      {storeConfig?.seccion_ofertas_activa !== false && (
        <div id="ofertas">
          <FeaturedDealsBox
            products={featuredDeals}
            customTitle={storeConfig?.seccion_ofertas_titulo}
          />
        </div>
      )}

      {/* 5. Sección "Tendencias de la Semana" (Bento Grid Asimétrico 5 Columnas) */}
      {storeConfig?.seccion_tendencias_activa !== false && (
        <WeeklyTrendsBento
          products={weeklyTrends}
          starProduct={starProduct}
          customTitle={storeConfig?.seccion_tendencias_titulo}
          customSubtitle={storeConfig?.seccion_tendencias_subtitulo}
        />
      )}

      {/* 6. Sección de Logotipos de Empresas y Marcas Aliadas Comerciales */}
      {storeConfig?.seccion_aliados_activa !== false && (
        <AlliedBrandsSection
          brands={alliedBrands}
          title={storeConfig?.seccion_aliados_titulo}
        />
      )}

      {/* 7. Catálogo en Vivo con Paginación Liviana (Control de Saturación de DOM) */}
      <LiveCatalogSection
        groups={groups}
        initialSubgroups={initialSubgroups}
        initialProducts={leanInitialProducts}
        customTitle={storeConfig?.catalogo_titulo}
        customSubtitle={storeConfig?.catalogo_subtitulo}
      />
    </main>
  );
}
