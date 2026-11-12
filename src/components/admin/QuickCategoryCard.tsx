'use client';

import { CheckCircle2, Loader2, Save, Trash2 } from 'lucide-react';
import { Switch } from '@astryxdesign/core/Switch';
import { QuickCategory } from '@/types';
import { DynamicLucideIcon } from '@/components/ui';
import { LucideIconField } from './LucideIconField';

interface QuickCategoryCardProps {
  category: QuickCategory;
  isSaving: boolean;
  isSuccess: boolean;
  onChange: (patch: Partial<QuickCategory>) => void;
  onSave: () => void;
  onDelete: () => void;
}

/**
 * Tarjeta individual editable para una categoría rápida de portada (icon_name + show_on_homepage).
 */
export function QuickCategoryCard({
  category,
  isSaving,
  isSuccess,
  onChange,
  onSave,
  onDelete,
}: QuickCategoryCardProps) {
  const iconValue = category.icon_name ?? category.icono ?? 'Wine';
  const showOnHome = category.show_on_homepage ?? category.activo ?? true;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-[#8B3E03]">
              <DynamicLucideIcon
                name={iconValue}
                fallback="Wine"
                className="h-5 w-5"
                strokeWidth={1.5}
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 block truncate">
                {category.id}
              </span>
              <h3 className="text-xs font-black text-slate-900 truncate">{category.nombre}</h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Switch
              label=""
              size="sm"
              value={showOnHome}
              onChange={(checked) => onChange({ show_on_homepage: checked, activo: checked })}
            />
            <button
              type="button"
              onClick={onDelete}
              title="Eliminar categoría"
              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-lg">
          <span className="font-semibold text-slate-600">
            <code className="font-mono">show_on_homepage</code>:
          </span>
          <span className={showOnHome ? 'font-bold text-emerald-700' : 'font-bold text-slate-400'}>
            {showOnHome ? 'Visible en Inicio' : 'Oculta en Inicio'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
              Nombre Principal
            </label>
            <input
              type="text"
              value={category.nombre}
              onChange={(e) => onChange({ nombre: e.target.value })}
              className="w-full h-9 rounded-xl border border-slate-200 px-2.5 text-xs text-slate-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Orden</label>
            <input
              type="number"
              min={1}
              value={category.orden}
              onChange={(e) =>
                onChange({ orden: Math.max(1, Number(e.target.value) || 1) })
              }
              className="w-full h-9 rounded-xl border border-slate-200 px-2.5 text-xs text-slate-900 tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
            Subtítulo / Etiqueta
          </label>
          <input
            type="text"
            value={category.descripcion}
            onChange={(e) => onChange({ descripcion: e.target.value })}
            className="w-full h-9 rounded-xl border border-slate-200 px-2.5 text-xs text-slate-900"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
            URL de Destino
          </label>
          <input
            type="text"
            value={category.url}
            onChange={(e) => onChange({ url: e.target.value })}
            className="w-full h-9 rounded-xl border border-slate-200 px-2.5 text-xs font-mono text-slate-900"
          />
        </div>

        <LucideIconField
          label="Icono Lucide (icon_name)"
          value={iconValue}
          onChange={(val) => onChange({ icon_name: val, icono: val })}
          placeholder="Wine, CupSoda, Snowflake"
        />
      </div>

      <button
        type="button"
        disabled={isSaving}
        onClick={onSave}
        className={`w-full h-10 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          isSuccess
            ? 'bg-emerald-600 text-white'
            : 'bg-catador-blue hover:bg-catador-blue-light text-white shadow-2xs'
        }`}
      >
        {isSaving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
        ) : isSuccess ? (
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        ) : (
          <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
        )}
        <span>{isSaving ? 'Guardando...' : isSuccess ? '¡Guardado!' : 'Guardar Categoría'}</span>
      </button>
    </div>
  );
}

