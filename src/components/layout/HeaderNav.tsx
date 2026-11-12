'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronDown, ArrowRight } from 'lucide-react';
import { DEPARTMENTS } from '@/constants/config';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/catalogo/01', label: 'Licores Premium' },
  { href: '/catalogo/09', label: 'Cervezas & Hielos' },
  { href: '/catalogo/01/04', label: 'Vinos' },
  { href: '/catalogo/02', label: 'Refrescos & Agua' },
  { href: '/catalogo/11', label: 'Despensa & Snacks' },
  { href: '/#ofertas', label: 'Ofertas' },
  { href: '/catalogo/01?caja=1', label: 'Por Caja', hideMobile: true },
];

export function HeaderNav() {
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="hidden md:block bg-[#081229] text-white relative z-30 border-b border-white/10">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 flex items-center justify-between gap-4">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDeptOpen(!isDeptOpen)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-3.5 sm:px-4 py-2.5 min-h-[42px] text-[13px] sm:text-sm font-extrabold transition-colors cursor-pointer"
          >
            <Menu className="h-4 w-4 shrink-0 text-[#EB9C53]" strokeWidth={1.5}/>
            <span>Departamentos</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200 shrink-0',
                isDeptOpen && 'rotate-180'
              )}
            strokeWidth={1.5}/>
          </button>

          {isDeptOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-slate-900/40"
                onClick={() => setIsDeptOpen(false)}
              />
              <div className="absolute top-full left-0 w-72 max-w-[90vw] bg-white text-slate-800 shadow-xl border border-slate-200 rounded-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[13px] font-black text-slate-900">
                    Departamentos en Sede
                  </span>
                </div>

                <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
                  <Link
                    href="/catalogo"
                    onClick={() => setIsDeptOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-[13px] font-extrabold text-catador-blue bg-[#F7F8FA] hover:bg-slate-100 transition-colors min-h-[44px]"
                  >
                    <span>Ver Catálogo Completo</span>
                    <ArrowRight className="h-4 w-4 text-catador-blue" strokeWidth={1.5}/>
                  </Link>

                  {DEPARTMENTS.map((dept) => (
                    <Link
                      key={dept.id}
                      href={`/catalogo/${dept.slug}`}
                      onClick={() => setIsDeptOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-[13px] font-semibold text-slate-700 hover:bg-[#F7F8FA] hover:text-catador-blue transition-colors min-h-[44px]"
                    >
                      <span>{dept.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5}/>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-start md:justify-center gap-4 sm:gap-7 text-[13px] sm:text-sm overflow-x-auto scrollbar-none whitespace-nowrap pl-2 pr-8 min-w-0">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'py-2.5 border-b-2 transition-colors shrink-0',
                    link.hideMobile && 'hidden md:inline-block',
                    isActive
                      ? 'border-[#EB9C53] text-white font-black'
                      : 'border-transparent text-slate-200 font-semibold hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="pointer-events-none absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-[#081229] to-transparent md:hidden" />
        </div>
      </div>
    </nav>
  );
}
