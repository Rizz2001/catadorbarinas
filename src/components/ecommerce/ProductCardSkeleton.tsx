import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
  className?: string;
}

/**
 * Esqueleto de carga fiel a la estructura visual de ProductCard (imagen, categoría/stock,
 * título de 2 líneas, selector Unidad/Caja y fila de precio + botón circular).
 */
export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <article
      aria-hidden="true"
      className={cn(
        'flex flex-col justify-between min-w-0 rounded-2xl bg-white border border-slate-100 sm:border-slate-200 p-2.5 sm:p-4 shadow-sm',
        className
      )}
    >
      <div className="relative mb-2">
        <Skeleton className="h-36 sm:h-48 w-full rounded-xl bg-slate-100" />
        <Skeleton className="absolute top-2 right-2 h-8 w-8 rounded-full bg-slate-200/80 sm:hidden" />
      </div>

      <div className="flex flex-col flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="hidden sm:block h-3.5 w-20 rounded-md bg-slate-100" />
          <Skeleton className="h-4 w-16 rounded-full bg-slate-100" />
        </div>

        <div className="space-y-1.5 pt-0.5">
          <Skeleton className="h-3.5 w-full rounded-md bg-slate-200/70" />
          <Skeleton className="h-3.5 w-2/3 rounded-md bg-slate-200/70" />
        </div>

        <Skeleton className="h-8 w-full rounded-full bg-slate-100 mt-1" />

        <div className="flex items-end justify-between gap-2 pt-1.5">
          <div className="space-y-1">
            <Skeleton className="h-5 w-20 rounded-md bg-slate-200/80" />
            <Skeleton className="h-3 w-24 rounded-md bg-slate-100" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full bg-slate-200/80 shrink-0" />
        </div>
      </div>
    </article>
  );
}

