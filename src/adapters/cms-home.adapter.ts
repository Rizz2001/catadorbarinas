import { createHomeCmsFallbackPayload } from '@/constants/home-cms.mock';
import { CategoryPillNode, HomeCmsSectionsPayload, StoreConfig, TrustBadgeNode } from '@/types';

/**
 * Fusiona los datos persistidos en Supabase (StoreConfig y categorias_rapidas)
 * con el esquema CMS base de portada garantizando tipos completos en el cliente.
 */
export function buildHomeCmsPayload(
  storeConfig?: StoreConfig | null,
  quickCategories?: CategoryPillNode[]
): HomeCmsSectionsPayload {
  const base = createHomeCmsFallbackPayload();

  const customFlash = storeConfig?.flash_sale_campaign;
  const resolvedCampaignEnd =
    customFlash?.campaign_end_date ||
    customFlash?.endsAt ||
    base.flashSaleCampaign.endsAt;

  const bentoCards =
    storeConfig?.bento_cards && storeConfig.bento_cards.length > 0
      ? storeConfig.bento_cards.map((card) => ({
          ...card,
          endsAt:
            card.kind === 'offers_countdown'
              ? card.endsAt || resolvedCampaignEnd
              : card.endsAt,
        }))
      : base.bentoCards.map((card) =>
          card.kind === 'offers_countdown'
            ? { ...card, endsAt: resolvedCampaignEnd }
            : card
        );

  const resolvedCategories =
    quickCategories && quickCategories.length > 0
      ? quickCategories
          .filter((cat) => (cat.show_on_homepage ?? cat.activo) !== false)
          .map((cat) => ({
            ...cat,
            icono: cat.icon_name || cat.icono,
          }))
      : base.quickCategories;

  const rawTrust = storeConfig?.metricas_confianza;
  const trustBadges: TrustBadgeNode[] =
    rawTrust && rawTrust.length > 0
      ? rawTrust.map((item, idx) => ({
          ...item,
          icon: item.icon || base.trustBadges[idx % base.trustBadges.length]?.icon || 'ShieldCheck',
        }))
      : base.trustBadges;

  const customTrends = storeConfig?.weekly_trends_config;
  const weeklyTrends = {
    ...base.weeklyTrends,
    ...customTrends,
    active: storeConfig?.seccion_tendencias_activa !== false && (customTrends?.active ?? true),
    title: customTrends?.title || storeConfig?.seccion_tendencias_titulo || base.weeklyTrends.title,
    subtitle:
      customTrends?.subtitle ||
      storeConfig?.seccion_tendencias_subtitulo ||
      base.weeklyTrends.subtitle,
  };

  const flashSaleCampaign = {
    ...base.flashSaleCampaign,
    ...customFlash,
    active: storeConfig?.seccion_ofertas_activa !== false && (customFlash?.active ?? true),
    title: customFlash?.title || storeConfig?.seccion_ofertas_titulo || base.flashSaleCampaign.title,
    endsAt: resolvedCampaignEnd,
  };

  return {
    bentoCards,
    quickCategories: resolvedCategories,
    weeklyTrends,
    flashSaleCampaign,
    trustBadges,
  };
}

