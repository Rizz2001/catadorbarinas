'use client';

import React from 'react';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import '@/app/admin/admin-astryx.css';
import { Theme } from '@astryxdesign/core/theme';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

interface AdminThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Proveedor de tema y capas de Meta Astryx aislado exclusivamente al Panel CMS (/admin/*).
 * Habilita tokens corporativos de El Catador, AlertDialog/Dialog accesibles y ToastViewport.
 */
export function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  return (
    <Theme theme={neutralTheme} mode="light">
      <LayerProvider toast={{ position: 'topEnd', maxVisible: 3 }}>
        {children}
      </LayerProvider>
    </Theme>
  );
}

