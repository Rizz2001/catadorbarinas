'use client';

import { CheckCircle2, AlertCircle } from 'lucide-react';
import {
  isKnownLucideIcon,
} from '@/components/ui/DynamicLucideIcon';
import { IconPicker } from './IconPicker';
import { cn } from '@/lib/utils';

interface LucideIconFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Selector visual de iconos Lucide con búsqueda en grilla e input editable de nombre exacto.
 */
export function LucideIconField({
  label = 'Icono (Lucide)',
  value,
  onChange,
  placeholder = 'Ej. MapPin, Flame, Wine',
}: LucideIconFieldProps) {
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/15"
        />

        <IconPicker value={trimmed || 'Tag'} onSelect={onChange} />
      </div>
    </div>
  );
}

