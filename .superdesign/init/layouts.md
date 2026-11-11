# Shared Layout Components (`src/components/layout/`)

## Header (`src/components/layout/Header.tsx`)
- **Description:** Sticky 3-level storefront header (`HeaderTopBar`, `HeaderMain`, `HeaderNav`), hidden on `/admin` routes.

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { HeaderTopBar } from './HeaderTopBar';
import { HeaderMain } from './HeaderMain';
import { HeaderNav } from './HeaderNav';

export function Header() {
  const pathname = usePathname();

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
```

## Footer (`src/components/layout/Footer.tsx`)
- **Description:** Deep Navy (`#001754`) 4-column storefront footer with CMS logo, Barinas store address (`C.C. Ciudad Catador Local N1`), departments, customer service links, and bimonetary payment pills.

```tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Clock } from 'lucide-react';
import { APP_CONFIG } from '@/constants/config';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';

const PAYMENT_PILLS = ['Pago Móvil', 'Transferencia', 'Zelle', 'Efectivo USD'];

export function Footer() {
  const pathname = usePathname();
  const storeConfig = useStoreConfigStore((state) => state.config);
  const fetchConfig = useStoreConfigStore((state) => state.fetchConfig);
  const hasLoaded = useStoreConfigStore((state) => state.hasLoaded);

  useEffect(() => {
    if (!hasLoaded) {
      fetchConfig();
    }
  }, [hasLoaded, fetchConfig]);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-catador-blue-dark text-slate-200 mt-14 border-t border-white/10">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Columns 1..4 */}
      </div>
    </footer>
  );
}
```

