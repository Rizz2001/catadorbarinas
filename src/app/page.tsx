import {
  HeroBanner,
  TrustValueBar,
  PromoBannersGrid,
  FeaturedDealsBox,
  WeeklyTrendsBento,
  LiveCatalogSection,
  AlliedBrandsSection,
} from '@/components/ecommerce';
import { deriveStarProduct } from '@/services/productService';
import {
  fetchGruposInv,
  fetchSubgruposInv,
  fetchHomeCuratedSections,
} from '@/services/foxdata.service';
import { buildHomeCmsPayload } from '@/adapters';
import {
  getAllBannersServer,
  getQuickCategoriesServer,
  getStoreConfigServer,
  getAlliedBrandsServer,
} from '@/services/cms.server';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HomePage() {
  const [
    curatedHome,
    groups,
    initialSubgroups,
    allBanners,
    quickCategories,
    storeConfig,
    alliedBrands,
  ] = await Promise.all([
    fetchHomeCuratedSections(),
    fetchGruposInv(),
    fetchSubgruposInv('01'),
    getAllBannersServer(false),
    getQuickCategoriesServer(),
    getStoreConfigServer(),
    getAlliedBrandsServer(),
  ]);

  const banners = allBanners.filter((b) => b.activo !== false);
  const allProducts = curatedHome.allPool;
  const featuredDeals = curatedHome.dealsProducts;
  const weeklyTrends = curatedHome.trendsProducts;
  const starProduct = deriveStarProduct(allProducts);
  const leanInitialProducts = allProducts.slice(0, 40);
  const heroBanner = allBanners.find((b) => b.tipo === 'hero') || null;
  const cmsSections = buildHomeCmsPayload(storeConfig, quickCategories);

  // Armamos la lista de 3 a 5 productos destacados/ofertas para el carrusel del Hero
  const heroCarouselCandidates = [
    ...(starProduct ? [starProduct] : []),
    ...featuredDeals,
    ...weeklyTrends,
  ];
  const seenHeroIds = new Set<string>();
  const heroProducts = heroCarouselCandidates
    .filter((p) => {
      if (!p || seenHeroIds.has(p.id)) return false;
      seenHeroIds.add(p.id);
      return p.inStock || p.allowBackorder;
    })
    .sort((a, b) => {
      const aHasPhoto = a.images?.[0] && !a.images[0].includes('logo') ? 1 : 0;
      const bHasPhoto = b.images?.[0] && !b.images[0].includes('logo') ? 1 : 0;
      return bHasPhoto - aHasPhoto;
    })
    .slice(0, 5);

  return (
    <main className="container mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-7 space-y-6 sm:space-y-9 overflow-x-clip">
      {/* 1. Hero Banner Principal + 4 Bento Cards + Píldoras de Categorías Rápidas */}
      <HeroBanner
        initialBanner={heroBanner}
        initialQuickCategories={cmsSections.quickCategories}
        bentoCards={cmsSections.bentoCards}
        starProduct={starProduct}
        heroProducts={heroProducts}
      />

      {/* 2. Selección del Catador · Por Unidad o Caja */}
      <WeeklyTrendsBento products={weeklyTrends} config={cmsSections.weeklyTrends} />

      {/* 3. Ofertas Destacadas del Día con Contador Regresivo Tabular */}
      <div id="ofertas" className="scroll-mt-44">
        <FeaturedDealsBox products={featuredDeals} campaign={cmsSections.flashSaleCampaign} />
      </div>

      {/* 4. Colecciones Destacadas del Bodegón (Editables en CMS) */}
      <PromoBannersGrid banners={banners} />

      {/* 5. Banda Arquitectónica de Garantías y Métricas */}
      <TrustValueBar
        badges={cmsSections.trustBadges}
        active={storeConfig?.seccion_confianza_activa}
      />

      {/* 6. Empresas y Marcas Aliadas Comerciales */}
      {storeConfig?.seccion_aliados_activa !== false && (
        <AlliedBrandsSection
          brands={alliedBrands}
          title={storeConfig?.seccion_aliados_titulo}
        />
      )}

      {/* 7. Catálogo en Vivo */}
      <LiveCatalogSection
        groups={groups}
        initialSubgroups={initialSubgroups}
        initialProducts={leanInitialProducts}
        initialTotalCount={allProducts.length}
        customTitle={storeConfig?.catalogo_titulo}
        customSubtitle={storeConfig?.catalogo_subtitulo}
      />
    </main>
  );
}
