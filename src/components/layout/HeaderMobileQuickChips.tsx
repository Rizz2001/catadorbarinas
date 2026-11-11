'use client';

import Link from 'next/link';
import { Truck, Package, Percent } from 'lucide-react';

export function HeaderMobileQuickChips() {
  const chips = [
    {
      label: 'Ofertas Hoy',
      href: '/#ofertas',
      icon: Percent,
      badgeBg: 'bg-[#D99B38]',
      border: 'border-[#EB9C53]/60 bg-[#FEF3C7]/75 text-[#8B3E03]',
    },
    {
      label: 'Cotizar delivery',
      href: '/carrito#cotizar-delivery',
      icon: Truck,
      badgeBg: 'bg-[#0F172A]',
      border: 'border-slate-200 bg-white text-slate-900',
    },
    {
      label: 'Venta por Caja',
      href: '/catalogo?caja=1',
      icon: Package,
      badgeBg: 'bg-[#001754]',
      border: 'border-slate-200 bg-white text-slate-900',
    },
  ];

  return (
    <div className="flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-0.5">
      {chips.map((chip) => {
        const Icon = chip.icon;
        return (
          <Link
            key={chip.label}
            href={chip.href}
            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 min-h-[36px] text-xs font-extrabold whitespace-nowrap shrink-0 transition-colors ${chip.border}`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-white shrink-0 ${chip.badgeBg}`}
            >
              <Icon className="h-3 w-3" />
            </span>
            <span className="tabular-nums">{chip.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
