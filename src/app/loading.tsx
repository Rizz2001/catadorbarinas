import { Wine } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="min-h-[70vh] w-full bg-slate-50 flex flex-col items-center justify-center px-4 py-16"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-slate-200 border-t-[#0F172A] animate-spin"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F172A] text-[#EB9C53] shadow-sm animate-pulse">
            <Wine className="h-6 w-6" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-base font-black tracking-tight text-[#0F172A]">
            EL CATADOR<span className="text-[#E07A1F]">.</span>
          </p>
          <p className="text-sm font-medium text-slate-500">
            Preparando tu selección en Barinas...
          </p>
        </div>
      </div>
    </main>
  );
}

