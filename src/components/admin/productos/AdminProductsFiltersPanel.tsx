'use client';

import { Camera, CheckCircle2, FolderOpen, Search } from 'lucide-react';
import { SegmentedControl, SegmentedControlItem, Switch } from '@/components/admin/ui';
import { DEFAULT_GROUPS } from '@/constants/fallback-products';
import { cn } from '@/lib/utils';

export type PhotoStatusTab = 'missing' | 'assigned' | 'all';

export interface ProductPhotoStats {
  total: number;
  assigned: number;
  missing: number;
  missingWithStock: number;
  coveragePercent: number;
}

export interface SubgroupOption {
  CodSubgrupo: string;
  Nombre: string;
}

interface AdminProductsFiltersPanelProps {
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
  selectedSubgroup: string;
  onSelectSubgroup: (subgroup: string) => void;
  availableSubgroups: SubgroupOption[];
  search: string;
  onSearchChange: (value: string) => void;
  onlyInStock: boolean;
  onOnlyInStockChange: (value: boolean) => void;
  statusTab: PhotoStatusTab;
  onStatusTabChange: (tab: PhotoStatusTab) => void;
  stats: ProductPhotoStats;
  totalUploadedImages: number;
}

/**
 * Panel de filtros de catálogo fotográfico por categoría FoxData, subcategoría,
 * búsqueda, disponibilidad y barra de cobertura.
 */
export function AdminProductsFiltersPanel({
  selectedGroup,
  onSelectGroup,
  selectedSubgroup,
  onSelectSubgroup,
  availableSubgroups,
  search,
  onSearchChange,
  onlyInStock,
  onOnlyInStockChange,
  statusTab,
  onStatusTabChange,
  stats,
  totalUploadedImages,
}: AdminProductsFiltersPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-4">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            1. Categoría de Productos
          </label>
          <div className="relative">
            <FolderOpen className="h-4 w-4 text-catador-blue absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.5}/>
            <select
              value={selectedGroup}
              onChange={(e) => onSelectGroup(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 min-h-[40px] text-xs font-black text-slate-900 focus:outline-none focus:border-catador-blue"
            >
              {DEFAULT_GROUPS.map((g) => (
                <option key={g.CodGrupo} value={g.CodGrupo}>
                  Categoría {g.CodGrupo}: {g.Nombre}
                </option>
              ))}
              <option value="GLOBAL_UPLOADED">
                Ver Todas las Fotos Subidas ({totalUploadedImages})
              </option>
            </select>
          </div>
        </div>

        <div className="md:col-span-5">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            2. Buscar Producto o Código
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" strokeWidth={1.5}/>
            <input
              type="text"
              placeholder="Buscar por nombre (ej: Cacique, Polar) o código..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 min-h-[40px] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue"
            />
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col justify-center">
          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            3. Filtro de Inventario
          </span>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 min-h-[40px] flex items-center">
            <Switch
              label="Solo con stock"
              size="sm"
              labelPosition="start"
              labelSpacing="spread"
              isDisabled={selectedGroup === 'GLOBAL_UPLOADED'}
              value={onlyInStock}
              onChange={onOnlyInStockChange}
            />
          </div>
        </div>
      </div>

      {selectedGroup !== 'GLOBAL_UPLOADED' && availableSubgroups.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectSubgroup('todos')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[11px] font-extrabold shrink-0 transition-colors cursor-pointer',
              selectedSubgroup === 'todos'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Todas las Subcategorías
          </button>
          {availableSubgroups.map((sub) => (
            <button
              key={sub.CodSubgrupo}
              type="button"
              onClick={() => onSelectSubgroup(sub.CodSubgrupo)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer',
                selectedSubgroup === sub.CodSubgrupo
                  ? 'bg-catador-blue text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {sub.Nombre}
            </button>
          ))}
        </div>
      )}

      {selectedGroup !== 'GLOBAL_UPLOADED' && (
        <div className="pt-2 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="overflow-x-auto no-scrollbar tabular-nums">
            <SegmentedControl
              size="md"
              label="Estado fotográfico de productos"
              value={statusTab}
              onChange={(val) => onStatusTabChange(val as PhotoStatusTab)}
            >
              <SegmentedControlItem
                value="missing"
                icon={<Camera className="h-3.5 w-3.5" strokeWidth={1.5}/>}
                label={`Faltan por Foto (${stats.missing})`}
              />
              <SegmentedControlItem
                value="assigned"
                icon={<CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5}/>}
                label={`Con Foto (${stats.assigned})`}
              />
              <SegmentedControlItem value="all" label={`Todos (${stats.total})`} />
            </SegmentedControl>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs tabular-nums">
            <div className="flex-1 min-w-[140px]">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Cobertura de Categoría</span>
                <span className="font-black text-catador-blue">{stats.coveragePercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${stats.coveragePercent}%` }}
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-500 border-l border-slate-200 pl-3">
              <span className="font-bold text-amber-800 block">
                {stats.missingWithStock} con stock sin foto
              </span>
              <span>de {stats.missing} pendientes</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

