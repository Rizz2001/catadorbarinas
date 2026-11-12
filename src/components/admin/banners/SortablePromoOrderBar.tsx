'use client';

import { useId } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PromoSlotKey = 'promo_1' | 'promo_2' | 'promo_3';

export interface PromoOrderItem {
  slot: PromoSlotKey;
  title: string;
  orden: number;
}

interface SortablePromoPillProps {
  item: PromoOrderItem;
  isActive: boolean;
  onSelect: () => void;
}

function SortablePromoPill({ item, isActive, onSelect }: SortablePromoPillProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.slot,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-xl border px-3 py-2 bg-white select-none transition-shadow',
        isDragging ? 'shadow-lg z-20 ring-2 ring-catador-blue/40' : 'shadow-2xs',
        isActive ? 'border-catador-blue bg-blue-50/40' : 'border-slate-200 hover:border-slate-300'
      )}
    >
      <button
        type="button"
        aria-label={`Arrastrar para reordenar ${item.title}`}
        className="text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing p-0.5 rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex items-center gap-2 text-left cursor-pointer min-w-0"
      >
        <span className="h-5 w-5 rounded-full bg-[#0F172A] text-white text-[10px] font-black flex items-center justify-center tabular-nums shrink-0">
          {item.orden}
        </span>
        <span className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
          {item.title}
        </span>
      </button>
    </div>
  );
}

interface SortablePromoOrderBarProps {
  items: PromoOrderItem[];
  activeSlot: string;
  isSavingOrder: boolean;
  onSelectSlot: (slot: PromoSlotKey) => void;
  onReorder: (orderedSlots: PromoSlotKey[]) => void;
}

/**
 * Barra sortable con Drag & Drop para reordenar la fila de 3 promociones de portada.
 */
export function SortablePromoOrderBar({
  items,
  activeSlot,
  isSavingOrder,
  onSelectSlot,
  onReorder,
}: SortablePromoOrderBarProps) {
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.slot === active.id);
    const newIndex = items.findIndex((i) => i.slot === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex).map((i) => i.slot);
    onReorder(next);
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
            Orden en Portada (Arrastra para reordenar Promos)
          </span>
          {isSavingOrder && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-catador-blue" strokeWidth={1.5} />
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          El orden numérico se refleja automáticamente en la grilla de colecciones del inicio.
        </p>
      </div>

      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.slot)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap items-center gap-2">
            {items.map((item) => (
              <SortablePromoPill
                key={item.slot}
                item={item}
                isActive={activeSlot === item.slot}
                onSelect={() => onSelectSlot(item.slot)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

