'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, RefreshCw } from 'lucide-react';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { HeaderSearch } from './HeaderSearch';
import { HeaderSearchTrends } from './HeaderSearchTrends';
import { UserNavMenu } from '@/components/auth';
import { cn } from '@/lib/utils';

export function HeaderMain() {
  const hydrated = useIsHydrated();
  const totals = useCartTotals();
  const rawFavCount = useWishlistStore((state) => state.items.length);
  const favCount = hydrated ? rawFavCount : 0;
  const { rateInfo, fetchRate, isLoading } = useBcvStore();
  const storeConfig = useStoreConfigStore((state) => state.config);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  const formattedRate = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rateInfo.rate);

  const logoUrl = storeConfig?.logo_url || '/logo-catador.svg';
  const isDefaultSvg = logoUrl === '/logo-catador.svg';
  const calibratedHeight = Math.min(56, Math.max(36, storeConfig?.logo_alto_px || 48));
  const calibratedWidth = Math.round(calibratedHeight * 1.15);

  return (
    <div className="bg-white py-2 sm:py-3.5 border-b border-slate-200/80">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 space-y-2 md:space-y-0">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 min-w-0">
          <Link href="/" className="shrink-0 flex items-center gap-2 sm:gap-3 min-w-0 group">
            {isDefaultSvg ? (
              <div
                className="relative flex items-center max-w-[140px] sm:max-w-none"
                style={{
                  height: `${calibratedHeight}px`,
                  width: `${Math.min(230, Math.max(135, storeConfig?.logo_ancho_px || 190))}px`,
                }}
              >
                <Image
                  src={logoUrl}
                  alt={storeConfig?.nombre_tienda || 'EL CATADOR. Gran Catador Bodegón'}
                  fill
                  priority
                  sizes="(max-width: 768px) 145px, 210px"
                  className="object-contain object-left"
                />
              </div>
            ) : (
              <>
                <div
                  className="relative shrink-0 rounded-xl bg-white border border-slate-100 p-1 shadow-xs overflow-hidden"
                  style={{ height: `${calibratedHeight}px`, width: `${calibratedWidth}px` }}
                >
                  <Image
                    src={logoUrl}
                    alt={storeConfig?.nombre_tienda || 'EL CATADOR. Gran Catador Bodegón'}
                    fill
                    priority
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm sm:text-xl font-black tracking-tight text-[#0F172A] leading-none group-hover:text-[#001754] transition-colors truncate">
                    {storeConfig?.nombre_tienda || 'EL CATADOR.'}
                  </span>
                  <span className="hidden sm:block text-[11px] font-extrabold uppercase tracking-wider text-[#B6683E] mt-1 truncate">
                    Bodegón & Supermercado
                  </span>
                </div>
              </>
            )}
          </Link>

          <div className="hidden md:flex flex-col flex-1 max-w-xl lg:max-w-2xl min-w-0">
            <HeaderSearch />
            <HeaderSearchTrends />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => fetchRate(true)}
              disabled={isLoading}
              title="Tasa oficial BCV sincronizada en vivo. Clic para actualizar."
              className="md:hidden lg:inline-flex inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-[#D99B38] to-[#C88A28] hover:from-[#C88A28] hover:to-[#B6781B] px-3 sm:px-4 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[40px] text-xs sm:text-[13px] font-extrabold text-white shadow-xs transition-all cursor-pointer shrink-0 tabular-nums"
            >
              <span>BCV: Bs. {formattedRate}</span>
              <RefreshCw
                className={cn(
                  'h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/90 transition-transform shrink-0',
                  isLoading && 'animate-spin'
                )}
              />
            </button>

            <div className="hidden md:block">
              <UserNavMenu />
            </div>

            <Link
              href="/favoritos"
              className="relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 text-[#0F172A] hover:bg-[#F7F8FA] border border-transparent hover:border-slate-200 transition-colors cursor-pointer rounded-full"
              aria-label="Lista de Favoritos"
            >
              <Heart className="h-5 w-5 stroke-[2]" />
              {favCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#D99B38] text-[10px] font-black text-white tabular-nums">
                  {favCount}
                </span>
              )}
            </Link>

            <Link
              href="/carrito"
              className="hidden md:flex relative items-center gap-2 rounded-full bg-[#0F172A] hover:bg-[#001754] min-h-[44px] px-4 py-2 text-white transition-colors shrink-0 tabular-nums"
              aria-label="Ver Carrito de Compras"
            >
              <ShoppingCart className="h-4 w-4 shrink-0 text-[#EB9C53]" />
              <span className="text-[13px] font-black">
                {totals.itemCount > 0 ? `(${totals.itemCount})` : '(0)'}
              </span>
            </Link>
          </div>
        </div>

        <div className="block md:hidden w-full">
          <HeaderSearch />
        </div>
      </div>
    </div>
  );
}
