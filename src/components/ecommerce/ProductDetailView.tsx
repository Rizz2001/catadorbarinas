'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Share2, XCircle } from 'lucide-react';
import { Product, PurchaseMode } from '@/types';
import { formatPrices, splitUsdParts } from '@/lib/currency';
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
import { ProductDetailGallery } from './ProductDetailGallery';
import { ProductPresentationSelector } from './ProductPresentationSelector';
import { ProductDetailBuyBox } from './ProductDetailBuyBox';
import { ProductDetailExtraSection } from './ProductDetailExtraSection';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductDetailView({ product, relatedProducts = [] }: ProductDetailViewProps) {
  const router = useRouter();
  const storeConfig = useStoreConfigStore((state) => state.config);
  const cmsLogo = storeConfig?.logo_url || IMAGE_FALLBACKS.product;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [mode, setMode] = useState<PurchaseMode>(() => getDefaultPurchaseMode(product));
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const rawImage = selectedImage || product.images?.[0];
  const isNoImage = !rawImage || rawImage === IMAGE_FALLBACKS.product || rawImage.includes('logo');
  const activeImage = isNoImage || hasError ? cmsLogo : rawImage;

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const isFav = useWishlistStore((state) => state.items.some((i) => i.id === product.id));
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite);
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);

  const unitsPerBox = getUnitsPerPurchaseMode(product, 'caja');
  const unitPrices = formatPrices(getEffectivePriceUsd(product, 'unidad'), bcvRate);
  const boxPrices = formatPrices(getEffectivePriceUsd(product, 'caja'), bcvRate);
  const activePriceUsd = getEffectivePriceUsd(product, mode);
  const totalSelectionPrices = formatPrices(activePriceUsd * quantity, bcvRate);

  const otherCartItems = cartItems.filter(
    (i) => !(i.product.id === product.id && (i.purchaseMode || 'unidad') === mode)
  );
  const maxUnitsAllowed = getMaxAllowedQuantity(product, 'unidad', otherCartItems);
  const maxBoxesAllowed = getMaxAllowedQuantity(product, 'caja', otherCartItems);
  const currentMax = mode === 'caja' ? maxBoxesAllowed : maxUnitsAllowed;
  const isOutOfStock = !product.allowBackorder && (!product.inStock || currentMax <= 0);
  const safeQuantity =
    currentMax > 0
      ? Math.min(quantity, currentMax)
      : product.allowBackorder
      ? Math.max(1, quantity)
      : 0;

  const handleModeSwitch = (nextMode: PurchaseMode) => {
    setMode(nextMode);
    setQuantity(1);
    setFeedbackMsg(null);
  };

  const handleAddToCart = () => {
    if (!product.inStock || (currentMax <= 0 && !product.allowBackorder)) return;
    const res = addItem(product, safeQuantity, mode, true);
    if (res.added) {
      setIsAdded(true);
      setFeedbackMsg(res.message || null);
      setTimeout(() => setIsAdded(false), 1500);
    } else if (res.message) {
      setFeedbackMsg(res.message);
    }
  };

  const handleDirectBuy = () => {
    if (!product.inStock || (currentMax <= 0 && !product.allowBackorder)) return;
    const res = addItem(product, safeQuantity, mode, false);
    if (res.added) router.push('/checkout');
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `🍷 *${product.name}*\n💰 ${totalSelectionPrices.usdFormatted} (${totalSelectionPrices.vesFormatted})\n📦 EL CATADOR. Barinas: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const { intPart, decPart } = splitUsdParts(totalSelectionPrices.usdFormatted);
  const categoryBadge =
    product.brand && !product.category.toUpperCase().includes(product.brand.toUpperCase())
      ? `${product.brand} · ${product.category}`
      : product.category;
  const priceContextLabel =
    safeQuantity > 1
      ? `Total por ${safeQuantity} ${mode === 'caja' ? 'cajas' : 'und'}`
      : mode === 'caja'
      ? `${product.boxUnitLabel || 'Caja'} cerrado (${unitsPerBox} und)`
      : 'Precio por unidad';

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0 max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
        <div className="lg:col-span-5 min-w-0">
          <ProductDetailGallery
            name={product.name}
            images={product.images}
            activeImage={activeImage}
            selectedImage={selectedImage}
            cmsLogo={cmsLogo}
            discountPercentage={product.discountPercentage}
            isFav={isFav}
            onSelectImage={(img) => { setSelectedImage(img); setHasError(false); }}
            onToggleFavorite={() => toggleFavorite(product)}
            onImageError={() => setHasError(true)}
          />
        </div>

        <section className="lg:col-span-7 rounded-2xl bg-white border border-slate-100 sm:border-slate-200 p-4 sm:p-7 space-y-4 sm:space-y-5 min-w-0 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center rounded-full bg-[#F7F8FA] border border-slate-200/80 px-3 py-1 text-xs font-extrabold text-slate-700 truncate">
              {categoryBadge}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline text-xs font-bold text-slate-500 tabular-nums">
                SKU: {product.sku}
              </span>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Compartir por WhatsApp"
                title="Compartir por WhatsApp"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 min-h-[36px] text-xs font-extrabold text-slate-700 hover:border-catador-blue hover:text-catador-blue transition-colors cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5 text-catador-blue" />
                <span className="hidden sm:inline">Compartir</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-lg sm:text-2xl lg:text-[26px] font-black text-slate-900 tracking-tight leading-tight break-words">
              {product.name}
            </h1>
            {product.inStock ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold tabular-nums">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{product.stockQuantity} {product.unit.toLowerCase()}s disponibles en Barinas</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                <XCircle className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Agotado temporalmente</span>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-[#F7F8FA] border border-slate-200/80 p-4 flex flex-wrap items-baseline justify-between gap-2 tabular-nums">
            <div>
              <p className="inline-flex items-start text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight leading-none">
                <span className="text-[0.58em] font-extrabold mr-0.5 mt-[0.12em]">$</span>
                <span>{intPart}</span>
                <span className="text-[0.55em] font-extrabold ml-0.5 mt-[0.12em]">.{decPart}</span>
              </p>
              <p className="text-sm font-extrabold text-slate-600 mt-1">
                {totalSelectionPrices.vesFormatted} <span className="text-slate-500 font-bold">BCV</span>
              </p>
            </div>
            <span className="text-xs font-extrabold text-slate-600">{priceContextLabel}</span>
          </div>

          <ProductPresentationSelector
            product={product}
            mode={mode}
            unitsPerBox={unitsPerBox}
            maxBoxesAllowed={maxBoxesAllowed}
            unitPriceFormatted={unitPrices.usdFormatted}
            boxPriceFormatted={boxPrices.usdFormatted}
            onModeSwitch={handleModeSwitch}
          />

          <ProductDetailBuyBox
            mode={mode}
            unitsPerBox={unitsPerBox}
            safeQuantity={safeQuantity}
            currentMax={currentMax}
            allowBackorder={product.allowBackorder}
            isOutOfStock={isOutOfStock}
            isAdded={isAdded}
            feedbackMsg={feedbackMsg}
            totalUsdFormatted={totalSelectionPrices.usdFormatted}
            totalVesFormatted={totalSelectionPrices.vesFormatted}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onDirectBuy={handleDirectBuy}
          />
        </section>
      </div>

      <ProductDetailExtraSection product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
