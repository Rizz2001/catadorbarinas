'use client';

import { useId } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Loader2, RefreshCw, Plus } from 'lucide-react';
import { useQuickCategoriesAdmin } from '@/hooks/useQuickCategoriesAdmin';
import { QuickCategoryCard } from './QuickCategoryCard';

export function QuickCategoriesEditor() {
  const dndId = useId();
  const {
    categories,
    loading,
    savingId,
    reordering,
    successId,
    handleRefresh,
    handleChange,
    handleAdd,
    handleSave,
    handleDelete,
    handleDragEnd,
  } = useQuickCategoriesAdmin();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[30vh] gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-catador-blue" strokeWidth={1.5} />
        <span className="text-xs font-bold text-slate-500">Cargando Categorías Rápidas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Categorías Rápidas de Portada (<code className="text-xs font-mono">icon_name</code> &amp;{' '}
            <code className="text-xs font-mono">show_on_homepage</code>)
          </h2>
          <p className="text-xs text-slate-500">
            Arrastra desde la esquina superior izquierda de cada tarjeta para reordenar los accesos en la portada.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {reordering && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-catador-blue">
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
              Guardando orden...
            </span>
          )}
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-catador-blue transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Agregar Categoría</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((cat) => cat.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <QuickCategoryCard
                key={cat.id}
                category={cat}
                isSaving={savingId === cat.id}
                isSuccess={successId === cat.id}
                onChange={(patch) => handleChange(cat.id, patch)}
                onSave={() => handleSave(cat)}
                onDelete={() => handleDelete(cat)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
