'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { HeaderTopBar } from './HeaderTopBar';
import { HeaderMain } from './HeaderMain';
import { HeaderNav } from './HeaderNav';

export function Header() {
  const pathname = usePathname();

  // El CMS administrativo dispone de su propia barra y navegación optimizada
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      <HeaderTopBar />
      <HeaderMain />
      <HeaderNav />
    </header>
  );
}
