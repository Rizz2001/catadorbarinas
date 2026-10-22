'use client';

import React, { useState } from 'react';
import { Tag, Loader2, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export interface SmartVentasGroup {
  CodGrupo: string;
  Nombre: string;
  SmartVentas?: number;
}

export interface SmartVentasSubgroup {
  CodGrupo: string;
  CodSubgrupo: string;
  Nombre: string;
}

interface LiveCatalogSectionProps {
  groups: SmartVentasGroup[];
  initialSubgroups: SmartVentasSubgroup[];
  initialProducts: Product[];
}

export function LiveCatalogSection({
  groups,
  initialSubgroups,
  initialProducts,
}: LiveCatalogSectionProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('01');
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('todos');
  const [subgroups, setSubgroups] = useState<SmartVentasSubgroup[]>(initialSubgroups);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Maneja el cambio de Grupo (Cae automáticamente en "Todos")
  const handleSelectGroup = async (codGrupo: string) => {
    if (codGrupo === selectedGroup) return;
    setSelectedGroup(codGrupo);
    setSelectedSubgroup('todos');
    setIsLoading(true);

    try {
      const [artRes, subRes] = await Promise.all([
        fetch(`/api/catalog?codGrupo=${codGrupo}`),
        fetch(`/api/catalog?codGrupo=${codGrupo}&subgroups=true`),
      ]);

      const [artData, subData] = await Promise.all([artRes.json(), subRes.json()]);
      setProducts(artData.products || []);
      setSubgroups(subData.subgrupos || []);
    } catch (err) {
      console.error('Error al cambiar de grupo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Maneja el filtrado por Subgrupo
  const handleSelectSubgroup = async (codSubgrupo: string) => {
    if (codSubgrupo === selectedSubgroup) return;
    setSelectedSubgroup(codSubgrupo);
    setIsLoading(true);

    try {
      const url =
        codSubgrupo === 'todos'
          ? `/api/catalog?codGrupo=${selectedGroup}`
          : `/api/catalog?codGrupo=${selectedGroup}&codSubgrupo=${codSubgrupo}`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error al filtrar por subgrupo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeGroups = groups.filter((g) => g.SmartVentas === 1 || g.SmartVentas === undefined);

  return (
    <section id="catalogo-en-vivo" className="space-y-6 pt-6 border-t border-slate-200">
      {/* Cabecera y Selector de Grupos Principales */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-catador-blue text-white">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Catálogo SmartVentas Bodegón (Depósito 01)
            </h2>
            <p className="text-xs text-slate-500">
              Inventario en tiempo real sincronizado directamente con el sistema
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            {isLoading ? 'Actualizando...' : `${products.length} productos en stock`}
          </span>
        </div>
      </div>

      {/* Barra de Píldoras de Grupos */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {activeGroups.map((group) => {
          const isActive = group.CodGrupo === selectedGroup;
          return (
            <button
              key={group.CodGrupo}
              onClick={() => handleSelectGroup(group.CodGrupo)}
              className={cn(
                'px-4 py-2 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap shadow-2xs cursor-pointer',
                isActive
                  ? 'bg-catador-blue text-white shadow-sm ring-2 ring-catador-blue/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-catador-blue'
              )}
            >
              {group.Nombre}
            </button>
          );
        })}
      </div>

      {/* Subgrupos del Grupo Seleccionado */}
      {subgroups.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 bg-slate-100/70 p-2 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2 shrink-0">
            Subgrupos:
          </span>
          <button
            onClick={() => handleSelectSubgroup('todos')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap',
              selectedSubgroup === 'todos'
                ? 'bg-catador-amber text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            )}
          >
            Todos
          </button>
          {subgroups.map((sub) => {
            const isSubActive = sub.CodSubgrupo === selectedSubgroup;
            return (
              <button
                key={sub.CodSubgrupo}
                onClick={() => handleSelectSubgroup(sub.CodSubgrupo)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap',
                  isSubActive
                    ? 'bg-catador-amber text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                )}
              >
                {sub.Nombre}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid de Productos con Estado de Carga */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <p className="text-sm font-semibold">No se encontraron artículos en este subgrupo.</p>
          <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otro subgrupo o grupo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
