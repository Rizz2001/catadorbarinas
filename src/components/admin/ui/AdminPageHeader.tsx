'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useBcvStore } from '@/store/useBcvStore';

interface AdminPageHeaderProps {
  section: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  showBcvPill?: boolean;
}

/**
 * Cabecera estándar del Panel CMS para mantener jerarquía tipográfica,
 * breadcrumb consistente y contexto de tasa BCV en todas las vistas.
 */
export function AdminPageHeader({
  section,
  title,
  description,
  actions,
  showBcvPill = false,
}: AdminPageHeaderProps) {
  const tasaBcv = useBcvStore((state) => state.rateInfo.rate);

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200/80 pb-4">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-400">
          <Link href="/admin/pedidos" className="hover:text-slate-600 transition-colors">
            Panel
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" strokeWidth={1.75} />
          <span className="text-slate-600 font-semibold">{section}</span>
          {showBcvPill && typeof tasaBcv === 'number' && tasaBcv > 0 && (
            <span className="ml-1 inline-flex items-center rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[11px] font-semibold text-amber-800 tabular-nums">
              BCV Bs. {tasaBcv.toFixed(2)}
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
