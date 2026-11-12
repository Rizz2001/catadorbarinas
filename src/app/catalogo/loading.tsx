import { Skeleton } from '@/components/ui/Skeleton';

export default function CatalogCategoriesLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Cargando categorías del catálogo"
      className="min-h-screen bg-[#F7F8FA] pb-20 md:pb-12"
    >
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-6">
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <Skeleton className="h-3.5 w-32 rounded-md bg-slate-200/70" />
          <Skeleton className="h-7 w-64 sm:w-80 rounded-lg bg-slate-200/80" />
          <Skeleton className="h-4 w-56 sm:w-96 rounded-md bg-slate-100" />
        </div>

        <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton
              key={index}
              className="col-span-1 aspect-square rounded-2xl bg-slate-200/70"
            />
          ))}
          {[...Array(2)].map((_, index) => (
            <Skeleton
              key={`feat-${index}`}
              className="col-span-3 md:col-span-2 lg:col-span-3 aspect-[21/9] min-h-[124px] rounded-2xl bg-slate-200/70"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
