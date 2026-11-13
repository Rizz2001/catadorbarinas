import Image from 'next/image';
import { OFFICIAL_LOGO_ALT, OFFICIAL_LOGO_PATH } from '@/constants/config';

export default function GlobalLoading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="min-h-[70vh] w-full bg-slate-50 flex flex-col items-center justify-center px-4 py-16"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-slate-200 border-t-[#001754] animate-spin"
          />
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm p-2.5 overflow-hidden">
            <Image
              src={OFFICIAL_LOGO_PATH}
              alt={OFFICIAL_LOGO_ALT}
              width={64}
              height={64}
              priority
              className="h-14 w-14 object-contain animate-pulse"
            />
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
