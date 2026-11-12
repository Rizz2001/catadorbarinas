'use client';

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { Switch } from '@/components/admin/ui';
import { BentoCardKind, BentoCardNode } from '@/types';
import { LucideIconField } from '../LucideIconField';

const CARD_KIND_OPTIONS: Array<{ value: BentoCardKind; label: string }> = [
  { value: 'link_card', label: 'Enlace Comercial / Píldora' },
  { value: 'offers_countdown', label: 'Ofertas + Contador Regresivo' },
  { value: 'delivery_action', label: 'Acción Delivery GPS' },
  { value: 'featured_product', label: 'Producto Destacado (Auto)' },
];

interface BentoCardEditorRowProps {
  card: BentoCardNode;
  index: number;
  total: number;
  onChange: (patch: Partial<BentoCardNode>) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}

/**
 * Tarjeta editable individual dentro del arreglo JSONB de Bento Cards del Hero.
 */
export function BentoCardEditorRow({
  card,
  index,
  total,
  onChange,
  onMove,
  onDelete,
}: BentoCardEditorRowProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-lg bg-[#0F172A] text-white text-[11px] font-black flex items-center justify-center tabular-nums">
            {index + 1}
          </span>
          <select
            value={card.kind}
            onChange={(e) => onChange({ kind: e.target.value as BentoCardKind })}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-800"
          >
            {CARD_KIND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            title="Mover arriba"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
          >
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            title="Mover abajo"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
          >
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <Switch
            label=""
            size="sm"
            value={card.active !== false}
            onChange={(checked) => onChange({ active: checked })}
          />
          <button
            type="button"
            onClick={onDelete}
            title="Eliminar tarjeta"
            className="p-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Título *</label>
          <input
            type="text"
            value={card.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Ej. Compra por"
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Subtítulo / Línea 2
          </label>
          <input
            type="text"
            value={card.subtitle ?? card.titleLineBreak ?? ''}
            onChange={(e) =>
              onChange({
                subtitle: e.target.value,
                titleLineBreak: card.titleLineBreak ? e.target.value : undefined,
              })
            }
            placeholder="Ej. Precios al mayor"
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
          />
        </div>

        <LucideIconField
          value={card.icon || ''}
          onChange={(icon) => onChange({ icon })}
        />

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">URL / Enlace *</label>
          <input
            type="text"
            value={card.href}
            onChange={(e) => onChange({ href: e.target.value })}
            placeholder="/catalogo?caja=1"
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono text-slate-900"
          />
        </div>
      </div>
    </div>
  );
}

