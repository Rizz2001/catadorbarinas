'use client';

import { useEffect, useRef, useState } from 'react';
import { Product } from '@/types';
import { SmartVentasSubgroup } from '@/components/ecommerce/LiveCatalogSection';

interface UseCatalogQueryOptions {
  initialGroup: string;
  initialSubgroup?: string;
  initialSubgroups: SmartVentasSubgroup[];
  initialProducts: Product[];
  syncUrlPrefix?: string;
  onSelectionChange?: () => void;
}

interface CatalogCacheEntry {
  products: Product[];
  subgroups?: SmartVentasSubgroup[];
  isFull?: boolean;
}

export function useCatalogQuery({
  initialGroup,
  initialSubgroup = 'todos',
  initialSubgroups,
  initialProducts,
  syncUrlPrefix,
  onSelectionChange,
}: UseCatalogQueryOptions) {
  const [selectedGroup, setSelectedGroup] = useState<string>(initialGroup);
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>(initialSubgroup);
  const [subgroups, setSubgroups] = useState<SmartVentasSubgroup[]>(initialSubgroups);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState<boolean>(initialProducts.length === 0);

  const cacheRef = useRef<Map<string, CatalogCacheEntry>>(
    new Map(
      initialProducts.length > 0
        ? [
            [
              `${initialGroup}-${initialSubgroup}`,
              {
                products: initialProducts,
                subgroups: initialSubgroups,
                isFull:
                  initialSubgroup === 'todos' &&
                  (Boolean(syncUrlPrefix) || initialProducts.length > 40),
              },
            ],
          ]
        : []
    )
  );

  useEffect(() => {
    if (initialProducts.length > 0) return;
    let mounted = true;

    async function hydrateInitial() {
      setIsLoading(true);
      try {
        const artUrl =
          initialSubgroup === 'todos'
            ? `/api/catalog?codGrupo=${initialGroup}`
            : `/api/catalog?codGrupo=${initialGroup}&codSubgrupo=${initialSubgroup}`;
        const requests =
          initialSubgroups.length === 0
            ? Promise.all([
                fetch(artUrl),
                fetch(`/api/catalog?codGrupo=${initialGroup}&subgroups=true`),
              ])
            : Promise.all([fetch(artUrl), Promise.resolve(null)]);

        const [artRes, subRes] = await requests;
        const artData = await artRes.json();
        const subData = subRes ? await subRes.json() : null;
        if (!mounted) return;

        const newProds: Product[] = artData.products || [];
        const newSubs: SmartVentasSubgroup[] = subData?.subgrupos || initialSubgroups;
        setProducts(newProds);
        if (newSubs.length > 0) setSubgroups(newSubs);
        if (newProds.length > 0) {
          cacheRef.current.set(`${initialGroup}-${initialSubgroup}`, {
            products: newProds,
            subgroups: newSubs,
            isFull: initialSubgroup === 'todos',
          });
        }
      } catch {
        // Silencioso en hidratación inicial
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void hydrateInitial();
    return () => {
      mounted = false;
    };
  }, [initialGroup, initialSubgroup, initialProducts.length, initialSubgroups]);

  const selectGroup = async (codGrupo: string) => {
    if (codGrupo === selectedGroup && selectedSubgroup === 'todos') return;
    setSelectedGroup(codGrupo);
    setSelectedSubgroup('todos');
    onSelectionChange?.();

    if (
      syncUrlPrefix &&
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith(syncUrlPrefix)
    ) {
      window.history.pushState(null, '', `${syncUrlPrefix}/${codGrupo}`);
    }

    const cacheKey = `${codGrupo}-todos`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached && cached.products.length > 0) {
      setProducts(cached.products);
      if (cached.subgroups) setSubgroups(cached.subgroups);
      return;
    }

    setIsLoading(true);
    try {
      const [artRes, subRes] = await Promise.all([
        fetch(`/api/catalog?codGrupo=${codGrupo}`),
        fetch(`/api/catalog?codGrupo=${codGrupo}&subgroups=true`),
      ]);
      const [artData, subData] = await Promise.all([artRes.json(), subRes.json()]);
      const newProds: Product[] = artData.products || [];
      const newSubs: SmartVentasSubgroup[] = subData.subgrupos || [];
      setProducts(newProds);
      setSubgroups(newSubs);
      if (newProds.length > 0) {
        cacheRef.current.set(cacheKey, { products: newProds, subgroups: newSubs, isFull: true });
      }
    } catch {
      // Silencioso ante error transitorio
    } finally {
      setIsLoading(false);
    }
  };

  const selectSubgroup = async (codSubgrupo: string) => {
    if (codSubgrupo === selectedSubgroup) return;
    setSelectedSubgroup(codSubgrupo);
    onSelectionChange?.();

    if (
      syncUrlPrefix &&
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith(syncUrlPrefix)
    ) {
      window.history.pushState(
        null,
        '',
        codSubgrupo === 'todos'
          ? `${syncUrlPrefix}/${selectedGroup}`
          : `${syncUrlPrefix}/${selectedGroup}/${codSubgrupo}`
      );
    }

    const cachedFullGroup = cacheRef.current.get(`${selectedGroup}-todos`);
    if (cachedFullGroup?.isFull && cachedFullGroup.products.length > 0) {
      if (codSubgrupo === 'todos') {
        setProducts(cachedFullGroup.products);
        return;
      }
      const targetSub = String(codSubgrupo).trim();
      setProducts(
        cachedFullGroup.products.filter(
          (p) => String(p.codSubgrupo || '').trim() === targetSub
        )
      );
      return;
    }

    const subKey = `${selectedGroup}-${codSubgrupo}`;
    const cachedSub = cacheRef.current.get(subKey);
    if (cachedSub && cachedSub.products.length > 0) {
      setProducts(cachedSub.products);
      return;
    }

    setIsLoading(true);
    try {
      const url =
        codSubgrupo === 'todos'
          ? `/api/catalog?codGrupo=${selectedGroup}`
          : `/api/catalog?codGrupo=${selectedGroup}&codSubgrupo=${codSubgrupo}`;
      const res = await fetch(url);
      const data = await res.json();
      const newProds: Product[] = data.products || [];
      setProducts(newProds);
      if (newProds.length > 0) {
        cacheRef.current.set(subKey, { products: newProds });
      }
    } catch {
      // Silencioso
    } finally {
      setIsLoading(false);
    }
  };

  const ensureFullGroupLoaded = async (codGrupo: string) => {
    const groupCache = cacheRef.current.get(`${codGrupo}-todos`);
    if (groupCache?.isFull) return;
    try {
      const res = await fetch(`/api/catalog?codGrupo=${codGrupo}`);
      const data = await res.json();
      const fullProds: Product[] = data.products || [];
      if (fullProds.length > 0) {
        setProducts(fullProds);
        cacheRef.current.set(`${codGrupo}-todos`, {
          products: fullProds,
          subgroups,
          isFull: true,
        });
      }
    } catch {
      // Silencioso
    }
  };

  return {
    selectedGroup,
    selectedSubgroup,
    subgroups,
    products,
    isLoading,
    selectGroup,
    selectSubgroup,
    ensureFullGroupLoaded,
  };
}

