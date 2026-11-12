'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle2, GripVertical, Loader2, Save, Trash2 } from 'lucide-react';
import { QuickCategory } from '@/types';
import { DynamicLucideIcon } from '@/components/ui';
import { CategoryImageUploader } from './CategoryImageUploader';
import { QuickCategorySwitches } from './QuickCategorySwitches';
import { LucideIconField } from './LucideIconField';
import { cn } from '@/lib/utils';

interface QuickCategoryCardProps {
  category: QuickCategory;
  isSaving: boolean;
  isSuccess: boolean;
  onChange: (patch: Partial<QuickCategory>) => void;
  onSave: () => void;
  onDelete: () => void;
}

/**
 * Tarjeta individual editable y ordenable por arrastre para gestionar categorías visuales y portada.
 */
export function QuickCategoryCard({
  category,
  isSaving,
  isSuccess,
  onChange,
  onSave,
  onDelete,
}: QuickCategoryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const iconValue = category.icon_name ?? category.icono ?? 'Wine';
  const isFeatured = Boolean(category.is_featured);
  const showOnHome = category.show_on_homepage ?? category.activo ?? true;
  const isActive = category.activo ?? true;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'rounded-2xl border bg-white p-4 shadow-2xs space-y-3 flex flex-col justify-between transition-shadow',
        isDragging
          ? 'border-catador-blue ring-2 ring-catador-blue/30 shadow-xl z-20 opacity-95'
          : 'border-slate-200/90'
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              title="Arrastrar para reordenar"
              aria-label={`Arrastrar para reordenar ${category.nombre}`}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing shrink-0 rounded"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-[#8B3E03]">
              <DynamicLucideIcon
                name={iconValue}
                fallback="Wine"
                className="h-5 w-5"
                strokeWidth={1.5}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 truncate">
                  {category.id}
                </span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase',
                    isFeatured
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {isFeatured ? 'Ancho' : '1:1'}
                </span>
              </div>
              <h3 className="text-xs font-black text-slate-900 truncate">{category.nombre}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onDelete}
            title="Eliminar categoría"
            aria-label={`Eliminar categoría ${category.nombre}`}
            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <CategoryImageUploader
          categoryId={category.id}
          categoryName={category.nombre}
          imageUrl={category.image_url}
          onImageChange={(url) => onChange({ image_url: url })}
        />

        <QuickCategorySwitches
          isFeatured={isFeatured}
          showOnHomepage={showOnHome}
          isActive={isActive}
          onToggleFeatured={(checked) => onChange({ is_featured: checked })}
          onToggleHomepage={(checked) => onChange({ show_on_homepage: checked })}
          onToggleActive={(checked) => onChange({ activo: checked })}
        />

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
          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">URL de Destino</label>
          <input type="text" value={category.url} onChange={(e) => onChange({ url: e.target.value })} className="w-full h-9 rounded-xl border border-slate-200 px-2.5 text-xs font-mono text-slate-900" />
        </div>

        <LucideIconField label="Icono Lucide (Inicio y Fallback)" value={iconValue} onChange={(val) => onChange({ icon_name: val, icono: val })} placeholder="Wine, CupSoda, Snowflake" />
      </div>

      <button type="button" disabled={isSaving} onClick={onSave} className={cn('w-full h-10 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer', isSuccess ? 'bg-emerald-600 text-white' : 'bg-catador-blue hover:bg-catador-blue-light text-white shadow-2xs')}>
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
