/**
 * Tipos estructurados de CMS para las secciones dinámicas de la página de inicio.
 */

export type BentoCardKind =
  | 'offers_countdown'
  | 'delivery_action'
  | 'link_card'
  | 'featured_product';

export interface BentoCardNode {
  id: string;
  kind: BentoCardKind;
  title: string;
  titleLineBreak?: string;
  subtitle?: string;
  href: string;
  badgeText?: string;
  ctaText?: string;
  pillText?: string;
  icon?: string;
  endsAt?: string;
  active: boolean;
  order: number;
}

export interface CategoryPillNode {
  id: string;
  nombre: string;
  descripcion: string;
  url: string;
  icono: string;
  icon_name?: string;
  image_url?: string | null;
  is_featured?: boolean;
  orden: number;
  activo: boolean;
  show_on_homepage?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TrustBadgeNode {
  id?: string;
  figura: string;
  titulo: string;
  subtitulo: string;
  icon?: string;
  href?: string;
}

export interface WeeklyTrendsTabNode {
  id: 'mas_vendidos' | 'ofertas' | 'nuevos';
  label: string;
}

export interface WeeklyTrendsCmsConfig {
  active: boolean;
  title: string;
  subtitle: string;
  viewAllLabel: string;
  viewAllHref: string;
  tabs: WeeklyTrendsTabNode[];
  maxItems: number;
}

export interface FlashSaleCampaign {
  active: boolean;
  badgeText: string;
  title: string;
  subtitle: string;
  countdownLabel: string;
  endsAt: string;
  campaign_end_date?: string;
  maxItems: number;
}

export interface HomeCmsSectionsPayload {
  bentoCards: BentoCardNode[];
  quickCategories: CategoryPillNode[];
  weeklyTrends: WeeklyTrendsCmsConfig;
  flashSaleCampaign: FlashSaleCampaign;
  trustBadges: TrustBadgeNode[];
}

