import { Skeleton } from '@/components/ui/Skeleton';

export default function ProductDetailLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Cargando detalle del producto"
      className="min-h-screen bg-[#F7F8FA] pb-20 md:pb-12"
    >
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 max-w-6xl space-y-5 sm:space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded-md bg-slate-200/70" />
          <Skeleton className="h-4 w-4 rounded-full bg-slate-100" />
          <Skeleton className="h-4 w-28 rounded-md bg-slate-200/70" />
          <Skeleton className="h-4 w-4 rounded-full bg-slate-100" />
          <Skeleton className="h-4 w-40 rounded-md bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div className="rounded-2xl bg-white border border-slate-100 sm:border-slate-200 p-4 sm:p-6 shadow-sm">
              <Skeleton className="aspect-square w-full rounded-xl bg-slate-100" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-square w-full rounded-xl bg-white border border-slate-200"
                />
              ))}
            </div>
          </div>

          <section className="lg:col-span-7 rounded-2xl bg-white border border-slate-100 sm:border-slate-200 p-4 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-6 w-36 rounded-full bg-slate-100" />
              <Skeleton className="h-8 w-24 rounded-full bg-slate-100" />
            </div>

            <div className="space-y-2.5">
              <Skeleton className="h-7 w-full rounded-lg bg-slate-200/80" />
              <Skeleton className="h-7 w-2/3 rounded-lg bg-slate-200/70" />
              <Skeleton className="h-6 w-44 rounded-full bg-slate-100" />
            </div>

            <div className="rounded-xl bg-[#F7F8FA] border border-slate-200/80 p-4 space-y-2">
              <Skeleton className="h-10 w-36 rounded-lg bg-slate-200/80" />
              <Skeleton className="h-4 w-32 rounded-md bg-slate-200/60" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Skeleton className="h-16 w-full rounded-xl bg-slate-100" />
              <Skeleton className="h-16 w-full rounded-xl bg-slate-100" />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded-md bg-slate-100" />
                <Skeleton className="h-10 w-32 rounded-full bg-slate-200/80" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Skeleton className="h-12 w-full rounded-full bg-slate-200/80" />
                <Skeleton className="h-12 w-full rounded-full bg-slate-100" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

