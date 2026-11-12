'use client';

import {
  ArrowRight,
  Award,
  BadgePercent,
  Beer,
  Bike,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  Cookie,
  CreditCard,
  CupSoda,
  Flame,
  Gift,
  Globe,
  Heart,
  Lock,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Package,
  Percent,
  Phone,
  RefreshCw,
  Sandwich,
  ShieldCheck,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Snowflake,
  Sparkles,
  Star,
  Store,
  Tag,
  Timer,
  Truck,
  User,
  Utensils,
  Wine,
  X,
  Zap,
} from 'lucide-react';

export const LUCIDE_ICON_OPTIONS = [
  'ArrowRight',
  'Award',
  'BadgePercent',
  'Beer',
  'Bike',
  'CheckCircle',
  'CheckCircle2',
  'ChevronLeft',
  'ChevronRight',
  'Clock',
  'Coffee',
  'Compass',
  'Cookie',
  'CreditCard',
  'CupSoda',
  'Flame',
  'Gift',
  'Globe',
  'Heart',
  'Lock',
  'MapPin',
  'Menu',
  'MessageCircle',
  'Navigation',
  'Package',
  'Percent',
  'Phone',
  'RefreshCw',
  'Sandwich',
  'ShieldCheck',
  'ShoppingBag',
  'ShoppingBasket',
  'ShoppingCart',
  'Snowflake',
  'Sparkles',
  'Star',
  'Store',
  'Tag',
  'Timer',
  'Truck',
  'User',
  'Utensils',
  'Wine',
  'X',
  'Zap',
] as const;

export type LucideIconName = (typeof LUCIDE_ICON_OPTIONS)[number];

const KNOWN_ICON_KEYS = new Set<string>(LUCIDE_ICON_OPTIONS.map((i) => i.toLowerCase()));

export function isKnownLucideIcon(name?: string | null): boolean {
  const clean = name?.trim().toLowerCase();
  return Boolean(clean && KNOWN_ICON_KEYS.has(clean));
}

interface DynamicLucideIconProps {
  name?: string | null;
  fallback?: LucideIconName;
  className?: string;
  strokeWidth?: number;
}

/**
 * Mapeo seguro y compatible con React Compiler de nombres de íconos del CMS a lucide-react.
 */
export function DynamicLucideIcon({
  name,
  fallback = 'Tag',
  className = 'w-5 h-5',
  strokeWidth = 1.5,
}: DynamicLucideIconProps) {
  const key = (name?.trim() || fallback).toLowerCase();
  const shared = { className, strokeWidth, 'aria-hidden': true as const };

  switch (key) {
    case 'arrowright':
      return <ArrowRight {...shared} />;
    case 'award':
      return <Award {...shared} />;
    case 'badgepercent':
      return <BadgePercent {...shared} />;
    case 'beer':
      return <Beer {...shared} />;
    case 'bike':
      return <Bike {...shared} />;
    case 'checkcircle':
      return <CheckCircle {...shared} />;
    case 'checkcircle2':
      return <CheckCircle2 {...shared} />;
    case 'chevronleft':
      return <ChevronLeft {...shared} />;
    case 'chevronright':
      return <ChevronRight {...shared} />;
    case 'clock':
      return <Clock {...shared} />;
    case 'coffee':
      return <Coffee {...shared} />;
    case 'compass':
      return <Compass {...shared} />;
    case 'cookie':
      return <Cookie {...shared} />;
    case 'creditcard':
      return <CreditCard {...shared} />;
    case 'cupsoda':
      return <CupSoda {...shared} />;
    case 'flame':
      return <Flame {...shared} />;
    case 'gift':
      return <Gift {...shared} />;
    case 'globe':
      return <Globe {...shared} />;
    case 'heart':
      return <Heart {...shared} />;
    case 'lock':
      return <Lock {...shared} />;
    case 'mappin':
      return <MapPin {...shared} />;
    case 'menu':
      return <Menu {...shared} />;
    case 'messagecircle':
      return <MessageCircle {...shared} />;
    case 'navigation':
      return <Navigation {...shared} />;
    case 'package':
      return <Package {...shared} />;
    case 'percent':
      return <Percent {...shared} />;
    case 'phone':
      return <Phone {...shared} />;
    case 'refreshcw':
      return <RefreshCw {...shared} />;
    case 'sandwich':
      return <Sandwich {...shared} />;
    case 'shieldcheck':
      return <ShieldCheck {...shared} />;
    case 'shoppingbag':
      return <ShoppingBag {...shared} />;
    case 'shoppingbasket':
      return <ShoppingBasket {...shared} />;
    case 'shoppingcart':
      return <ShoppingCart {...shared} />;
    case 'snowflake':
      return <Snowflake {...shared} />;
    case 'sparkles':
      return <Sparkles {...shared} />;
    case 'star':
      return <Star {...shared} />;
    case 'store':
      return <Store {...shared} />;
    case 'tag':
      return <Tag {...shared} />;
    case 'timer':
      return <Timer {...shared} />;
    case 'truck':
      return <Truck {...shared} />;
    case 'user':
      return <User {...shared} />;
    case 'utensils':
      return <Utensils {...shared} />;
    case 'wine':
      return <Wine {...shared} />;
    case 'x':
      return <X {...shared} />;
    case 'zap':
      return <Zap {...shared} />;
    default:
      if (key !== fallback.toLowerCase()) {
        return <DynamicLucideIcon name={fallback} fallback="Tag" className={className} strokeWidth={strokeWidth} />;
      }
      return <Tag {...shared} />;
  }
}
