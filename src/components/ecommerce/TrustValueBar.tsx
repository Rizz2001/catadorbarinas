'use client';

import Link from 'next/link';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { TrustBadgeNode } from '@/types';
import { DynamicLucideIcon } from '@/components/ui';

interface TrustValueBarProps {
  badges: TrustBadgeNode[];
  active?: boolean;
}

export function TrustValueBar({ badges, active = true }: TrustValueBarProps) {
  const storeConfig = useStoreConfigStore((state) => state.config);

  const isVisible =
    storeConfig?.seccion_confianza_activa !== undefined
      ? storeConfig.seccion_confianza_activa
      : active;

  if (isVisible === false) return null;

  const resolvedBadges: TrustBadgeNode[] =
    storeConfig?.metricas_confianza && storeConfig.metricas_confianza.length > 0
      ? storeConfig.metricas_confianza.map((item, idx) => ({
          ...item,
          icon: item.icon || badges[idx % Math.max(badges.length, 1)]?.icon,
        }))
      : badges;

  if (resolvedBadges.length === 0) return null;

  return (
    <section
      aria-label="Garantías operativas de EL CATADOR."
      className="rounded-2xl sm:rounded-3xl bg-white border border-slate-100 sm:border-slate-200/90 shadow-sm overflow-hidden"
    >
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-2.5 sm:p-0 sm:gap-0 sm:divide-x divide-slate-200/70">
        {resolvedBadges.map((item, idx) => {
          const content = (
            <>
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FEF3C7]/80 border border-[#EB9C53]/60 text-[#0F172A] shadow-2xs">
                <DynamicLucideIcon
                  name={item.icon}
                  fallback="ShieldCheck"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-white sm:bg-[#F7F8FA] border border-slate-200 px-2 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#0F172A] tabular-nums">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D99B38]" />
                  <span>{item.figura}</span>
                </span>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight mt-1.5">
                  {item.titulo}
                </h3>
                <p className="hidden sm:block text-[13px] text-slate-600 leading-snug mt-1">
                  {item.subtitulo}
                </p>
              </div>
            </>
          );

          const cardClass =
            'p-3 sm:p-5 rounded-xl sm:rounded-none bg-[#F7F8FA]/80 sm:bg-white flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5 min-w-0 hover:bg-[#F7F8FA]/60 transition-colors';

          if (item.href?.trim()) {
            return (
              <Link
                key={item.id || `${item.titulo}-${idx}`}
                href={item.href.trim()}
                className={cardClass}
              >
                {content}
              </Link>
            );
          }

          return (
            <div key={item.id || `${item.titulo}-${idx}`} className={cardClass}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
