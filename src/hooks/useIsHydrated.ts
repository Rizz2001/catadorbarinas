'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Devuelve false durante SSR y el primer pase de hidratación para evitar
 * discrepancias (#418) con stores persistidos en localStorage, y true al montar.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

