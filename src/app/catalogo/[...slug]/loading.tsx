import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCardSkeleton } from '@/components/ecommerce/ProductCardSkeleton';

export default function CatalogGroupLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Cargando catálogo de productos"
      className="min-h-screen bg-[#F7F8FA] pb-20 md:pb-12"
    >
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-36 rounded-md bg-slate-200/70" />
            <Skeleton className="h-7 w-64 sm:w-80 rounded-lg bg-slate-200/80" />
            <Skeleton className="h-4 w-56 sm:w-96 rounded-md bg-slate-100" />
          </div>
          <Skeleton className="h-9 w-36 rounded-full bg-slate-200/70" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 space-y-3">
          <div className="flex gap-2 overflow-hidden">
            {[...Array(6)].map((_, index) => (
              <Skeleton
                key={index}
                className="h-9 w-28 shrink-0 rounded-full bg-slate-100"
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-full bg-slate-100" />
              <Skeleton className="h-8 w-28 rounded-full bg-slate-100" />
            </div>
            <Skeleton className="h-8 w-40 rounded-lg bg-slate-100" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          {[...Array(10)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}

