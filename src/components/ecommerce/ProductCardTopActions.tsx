'use client';

import { Check, Heart, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardTopActionsProps {
  productName: string;
  isFav: boolean;
  canAddMore: boolean;
  isAdded: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onQuickAdd: (e: React.MouseEvent) => void;
}

export function ProductCardTopActions({
  productName,
  isFav,
  canAddMore,
  isAdded,
  onToggleFavorite,
  onQuickAdd,
}: ProductCardTopActionsProps) {
  return (
    <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
      <button
        type="button"
        onClick={onToggleFavorite}
        aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        className={cn(
          'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB9C53] cursor-pointer',
          isFav
            ? 'bg-red-50 border-red-200 text-red-500'
            : 'bg-white/95 border-slate-200 text-slate-400 hover:text-red-500'
        )}
      >
        <Heart className={cn('h-3.5 w-3.5', isFav && 'fill-current')} />
      </button>

      <button
        type="button"
        disabled={!canAddMore}
        onClick={onQuickAdd}
        aria-label={`Agregar 1 ${productName}`}
        title={canAddMore ? 'Agregar en 1 clic' : 'Sin stock disponible'}
        className={cn(
          'pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB9C53]',
          !canAddMore
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : isAdded
              ? 'bg-emerald-600 text-white cursor-pointer'
              : 'bg-[#0F172A] hover:bg-[#001754] text-white cursor-pointer active:scale-95'
        )}
      >
        {isAdded ? (
          <Check className="h-4 w-4 stroke-[3]" />
        ) : (
          <Plus className="h-4 w-4 stroke-[2.5]" />
        )}
      </button>
    </div>
  );
}
