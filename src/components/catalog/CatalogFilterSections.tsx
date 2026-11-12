'use client';

import type { ReactNode } from 'react';
import { SmartVentasGroup, SmartVentasSubgroup } from '@/components/ecommerce/LiveCatalogSection';
import { isAllSubgroup } from '@/lib/catalogFilters';
import {
  BrandFilterOption,
  PRICE_RANGE_OPTIONS,
  PriceRangeFilter,
  SORT_OPTIONS,
  SortOption,
} from './catalogFilterTypes';

interface CatalogFilterSectionsProps {
  groups: SmartVentasGroup[];
  selectedGroup: string;
  onSelectGroup: (cod: string) => void;
  subgroups: SmartVentasSubgroup[];
  selectedSubgroup: string;
  onSelectSubgroup: (cod: string) => void;
  brands: BrandFilterOption[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  priceRange: PriceRangeFilter;
  onPriceRangeChange: (range: PriceRangeFilter) => void;
  onlyInStock: boolean;
  onToggleInStock: (val: boolean) => void;
  onlyDeals: boolean;
  onToggleDeals: (val: boolean) => void;
  onlyBoxes: boolean;
  onToggleBoxes: (val: boolean) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const pillClass = (active: boolean) =>
  `px-3.5 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap min-h-[36px] flex items-center gap-1.5 ${
    active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
  }`;

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

export function CatalogFilterSections({
  groups,
  selectedGroup,
  onSelectGroup,
  subgroups,
  selectedSubgroup,
  onSelectSubgroup,
  brands,
  selectedBrand,
  onSelectBrand,
  priceRange,
  onPriceRangeChange,
  onlyInStock,
  onToggleInStock,
  onlyDeals,
  onToggleDeals,
  onlyBoxes,
  onToggleBoxes,
  sortBy,
  onSortChange,
}: CatalogFilterSectionsProps) {
  const toggles = [
    { label: 'Solo en Stock', active: onlyInStock, toggle: () => onToggleInStock(!onlyInStock) },
    { label: 'Solo Ofertas', active: onlyDeals, toggle: () => onToggleDeals(!onlyDeals) },
    { label: 'Disponible por Caja', active: onlyBoxes, toggle: () => onToggleBoxes(!onlyBoxes) },
  ];

  return (
    <div className="space-y-6">
      {subgroups.length > 0 && (
        <FilterGroup title="Subcategorías">
          <button type="button" onClick={() => onSelectSubgroup('todos')} className={pillClass(isAllSubgroup(selectedSubgroup))}>
            Todas
          </button>
          {subgroups.map((sub) => (
            <button
              key={sub.CodSubgrupo}
              type="button"
              onClick={() => onSelectSubgroup(sub.CodSubgrupo)}
              className={pillClass(selectedSubgroup === sub.CodSubgrupo)}
            >
              {sub.Nombre}
            </button>
          ))}
        </FilterGroup>
      )}

      {brands.length > 0 && (
        <FilterGroup title={`Marcas (${brands.length})`}>
          <button type="button" onClick={() => onSelectBrand('all')} className={pillClass(selectedBrand === 'all')}>
            Todas las marcas
          </button>
          {brands.map((brand) => {
            const active = selectedBrand === brand.name;
            return (
              <button key={brand.name} type="button" onClick={() => onSelectBrand(brand.name)} className={pillClass(active)}>
                <span>{brand.name}</span>
                <span className={`tabular-nums text-[11px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>{brand.count}</span>
              </button>
            );
          })}
        </FilterGroup>
      )}

      <FilterGroup title="Rango de precio (USD)">
        {PRICE_RANGE_OPTIONS.map((opt) => (
          <button key={opt.value} type="button" onClick={() => onPriceRangeChange(opt.value)} className={pillClass(priceRange === opt.value)}>
            {opt.label}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup title="Disponibilidad y modalidad">
        {toggles.map((item) => (
          <button key={item.label} type="button" onClick={item.toggle} className={pillClass(item.active)}>
            {item.label}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup title="Ordenar por">
        {SORT_OPTIONS.map((opt) => (
          <button key={opt.value} type="button" onClick={() => onSortChange(opt.value)} className={pillClass(sortBy === opt.value)}>
            {opt.label}
          </button>
        ))}
      </FilterGroup>

      {groups.length > 1 && (
        <FilterGroup title="Departamento">
          {groups.map((grp) => (
            <button key={grp.CodGrupo} type="button" onClick={() => onSelectGroup(grp.CodGrupo)} className={pillClass(selectedGroup === grp.CodGrupo)}>
              {grp.Nombre}
            </button>
          ))}
        </FilterGroup>
      )}
    </div>
  );
}
