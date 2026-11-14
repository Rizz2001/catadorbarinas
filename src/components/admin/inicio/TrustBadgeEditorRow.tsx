'use client';

import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { TrustBadgeNode } from '@/types';
import { LucideIconField } from '../LucideIconField';

interface TrustBadgeEditorRowProps {
  badge: TrustBadgeNode;
  index: number;
  isOpen: boolean;
  onToggleOpen: () => void;
  onChange: (patch: Partial<TrustBadgeNode>) => void;
  onDelete: () => void;
}

export function TrustBadgeEditorRow({
  badge,
  index,
  isOpen,
  onToggleOpen,
  onChange,
  onDelete,
}: TrustBadgeEditorRowProps) {
  const displayTitle = badge.figura || badge.titulo || `Bloque #${index + 1}`;

  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 sm:p-3.5 space-y-3 transition-all">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 pb-2 border-b border-slate-200/70">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 text-left cursor-pointer select-none group"
          title={isOpen ? 'Colapsar bloque' : 'Editar bloque'}
        >
          <span className="h-6 w-6 shrink-0 rounded-lg bg-[#0F172A] text-white text-[11px] font-black flex items-center justify-center tabular-nums">
            {index + 1}
          </span>
          <span className="text-xs font-black text-[#0F172A] truncate group-hover:text-catador-blue">
            {displayTitle}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600" />
          )}
        </button>

        <button
          type="button"
          onClick={onDelete}
          title="Eliminar bloque"
          className="p-1.5 shrink-0 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Etiqueta / Cifra *
            </label>
            <input
              type="text"
              value={badge.figura}
              onChange={(e) => onChange({ figura: e.target.value })}
              placeholder="Ej. < 45 min"
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Título *</label>
            <input
              type="text"
              value={badge.titulo}
              onChange={(e) => onChange({ titulo: e.target.value })}
              placeholder="Despacho Express en Barinas"
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Subtítulo / Descripción *
            </label>
            <input
              type="text"
              value={badge.subtitulo}
              onChange={(e) => onChange({ subtitulo: e.target.value })}
              placeholder="Detalle breve para desktop"
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
            />
          </div>

          <LucideIconField
            value={badge.icon || ''}
            onChange={(icon) => onChange({ icon })}
            placeholder="Ej. Truck, ShieldCheck"
          />

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              URL / Enlace (Opcional)
            </label>
            <input
              type="text"
              value={badge.href || ''}
              onChange={(e) => onChange({ href: e.target.value })}
              placeholder="/catalogo o /checkout"
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono text-slate-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}

