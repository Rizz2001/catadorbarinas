import React from 'react';
import { HeaderTopBar } from './HeaderTopBar';
import { HeaderMain } from './HeaderMain';
import { HeaderNav } from './HeaderNav';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      <HeaderTopBar />
      <HeaderMain />
      <HeaderNav />
    </header>
  );
}
