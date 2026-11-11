'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, PurchaseMode } from '@/types';
import { formatPrices } from '@/lib/currency';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { IMAGE_FALLBACKS } from '@/constants/config';
import {
  getDefaultPurchaseMode,
  getEffectivePriceUsd,
  getMaxAllowedQuantity,
  getUnitsPerPurchaseMode,
} from '@/lib/inventory';
import { ProductPurchaseControls } from './ProductPurchaseControls';
import { ProductOverlayBadge, ProductStockStatus } from './ProductStockBadge';
import { ProductCardTopActions } from './ProductCardTopActions';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  isCompact?: boolean;
}

export function ProductCard({ product, className, isCompact = false }: ProductCardProps) {
  const storeConfig = useStoreConfigStore((state) => state.config);
  const cmsLogo = storeConfig?.logo_url || IMAGE_FALLBACKS.product;

  const rawImage = product.images?.[0];
  const isNoImage =
    !rawImage || rawImage === IMAGE_FALLBACKS.product || rawImage.includes('logo');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [mode, setMode] = useState<PurchaseMode>(() => getDefaultPurchaseMode(product));

  const displaySrc = isNoImage || hasError ? cmsLogo : rawImage;

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const isFav = useWishlistStore((state) => state.items.some((i) => i.id === product.id));
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite);
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);

  const unitsPerBox = getUnitsPerPurchaseMode(product, 'caja');
  const activePriceUsd = getEffectivePriceUsd(product, mode);
  const prices = formatPrices(activePriceUsd, bcvRate);
  const hasDiscount = Boolean(
    product.originalPriceUsd && product.originalPriceUsd > product.priceUsd
  );

  const otherCartItems = cartItems.filter(
    (i) => !(i.product.id === product.id && (i.purchaseMode || 'unidad') === mode)
  );
  const maxForCurrentMode = getMaxAllowedQuantity(product, mode, otherCartItems);
  const maxForBox = getMaxAllowedQuantity(product, 'caja', otherCartItems);
  const boxAvailable = maxForBox > 0 || Boolean(product.allowBackorder);

  const currentCartItem = cartItems.find(
    (i) => i.product.id === product.id && (i.purchaseMode || 'unidad') === mode
  );
  const inCartQty = currentCartItem ? currentCartItem.quantity : 0;
  const canAddMore = Boolean(
    (product.inStock || product.allowBackorder) &&
      (product.allowBackorder || (maxForCurrentMode > 0 && inCartQty < maxForCurrentMode))
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAddMore) return;
    const res = addItem(product, 1, mode, false);
    if (res.added) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1000);
    }
  };

  const productHref = `/producto/${product.id}${product.codGrupo ? `?grupo=${product.codGrupo}` : ''}`;

  return (
    <article
      className={cn(
        'group relative flex flex-col justify-between min-w-0 max-w-full overflow-hidden rounded-2xl bg-white border border-slate-200 p-3 sm:p-4 transition-colors duration-150 hover:border-catador-blue',
        className
      )}
    >
      <ProductCardTopActions
        productName={product.name}
        isFav={isFav}
        canAddMore={canAddMore}
        isAdded={isAdded}
        onToggleFavorite={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product);
        }}
        onQuickAdd={handleAddToCart}
      />

      {/* Escenario Fotográfico Armonizado con Blend para Botellas sin Parche Gris */}
      <Link
        href={productHref}
        className={cn(
          'relative w-full overflow-hidden rounded-xl bg-white flex items-center justify-center p-4 sm:p-5 mb-2.5 block',
          isCompact ? 'h-36 sm:h-40' : 'h-44 sm:h-48'
        )}
      >
        <Image
          src={displaySrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 20vw"
          className={cn(
            'object-contain transition-transform duration-200 ease-out p-2.5 sm:p-3.5 mix-blend-multiply contrast-[1.08] brightness-[1.05]',
            isNoImage || hasError ? 'p-6 sm:p-8 opacity-80' : 'group-hover:scale-105'
          )}
          onError={() => setHasError(true)}
          loading="lazy"
        />

        <ProductOverlayBadge
          hasDiscount={hasDiscount}
          discountPercentage={product.discountPercentage}
          isDealOfTheDay={product.isDealOfTheDay}
          inStock={product.inStock}
          allowBackorder={product.allowBackorder}
          saleMode={product.saleMode}
          unitsPerBox={unitsPerBox}
        />
      </Link>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5 min-h-[22px]">
          <span className="text-xs font-bold text-slate-600 truncate min-w-0">
            {product.brand || product.category}
          </span>
          <ProductStockStatus
            stockQuantity={product.stockQuantity}
            allowBackorder={product.allowBackorder}
          />
        </div>

        <Link href={productHref}>
          <h3
            className="h-[38px] sm:h-[42px] text-[13px] sm:text-sm font-extrabold text-slate-900 line-clamp-2 mt-1 leading-[1.35] group-hover:text-catador-blue transition-colors break-words"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        <ProductPurchaseControls
          product={product}
          mode={mode}
          onModeChange={setMode}
          unitsPerBox={unitsPerBox}
          boxAvailable={boxAvailable}
          isCompact={isCompact}
          prices={prices}
          hasDiscount={hasDiscount}
          inCartQty={inCartQty}
          canAddMore={canAddMore}
          isAdded={isAdded}
          onQuickAdd={handleAddToCart}
          onUpdateQuantity={(qty) => updateQuantity(product.id, qty, mode)}
        />
      </div>
    </article>
  );
}
