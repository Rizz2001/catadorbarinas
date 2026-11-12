'use client';

import { useId } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import {
  DynamicLucideIcon,
  isKnownLucideIcon,
  LUCIDE_ICON_OPTIONS,
} from '@/components/ui/DynamicLucideIcon';
import { cn } from '@/lib/utils';

interface LucideIconFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Input de texto para nombres de iconos Lucide con autocompletado y vista previa en vivo.
 */
export function LucideIconField({
  label = 'Nombre del Icono (Lucide)',
  value,
  onChange,
  placeholder = 'Ej. MapPin, Flame, Wine',
}: LucideIconFieldProps) {
  const listId = useId();
  const trimmed = value.trim();
  const isKnown = isKnownLucideIcon(trimmed);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-[11px] font-bold text-slate-700">{label}</label>
        {trimmed ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-bold',
              isKnown ? 'text-emerald-700' : 'text-amber-700'
            )}
          >
            {isKnown ? (
              <>
                <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> Válido
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" strokeWidth={2} /> Fallback (Tag)
              </>
            )}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/15"
        />

        <div
          title={isKnown ? `Vista previa: ${trimmed}` : 'Vista previa por defecto'}
          className={cn(
            'h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center transition-colors',
            isKnown
              ? 'bg-emerald-50/70 border-emerald-200 text-catador-blue'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          )}
        >
          <DynamicLucideIcon
            name={trimmed || 'Tag'}
            fallback="Tag"
            className="h-5 w-5"
            strokeWidth={1.5}
          />
        </div>
      </div>

      <datalist id={listId}>
        {LUCIDE_ICON_OPTIONS.map((iconName) => (
          <option key={iconName} value={iconName} />
        ))}
      </datalist>
    </div>
  );
}

