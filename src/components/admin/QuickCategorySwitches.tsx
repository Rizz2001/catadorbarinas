'use client';

import { Sparkles, Eye, LayoutGrid } from 'lucide-react';
import { Switch } from '@/components/admin/ui';

interface QuickCategorySwitchesProps {
  isFeatured: boolean;
  showOnHomepage: boolean;
  isActive: boolean;
  onToggleFeatured: (checked: boolean) => void;
  onToggleHomepage: (checked: boolean) => void;
  onToggleActive: (checked: boolean) => void;
}

/**
 * Bloque de switches Tailwind para visibilidad en catálogo, portada y formato destacado ancho completo.
 */
export function QuickCategorySwitches({
  isFeatured,
  showOnHomepage,
  isActive,
  onToggleFeatured,
  onToggleHomepage,
  onToggleActive,
}: QuickCategorySwitchesProps) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles
            className={`h-3.5 w-3.5 shrink-0 ${isFeatured ? 'text-amber-600' : 'text-slate-400'}`}
            strokeWidth={1.75}
          />
          <span className="text-[11px] font-extrabold text-slate-800 truncate">
            Destacada (Ancho completo)
          </span>
        </div>
        <Switch
          label=""
          size="sm"
          value={isFeatured}
          onChange={onToggleFeatured}
        />
      </div>

      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70">
        <div className="flex items-center gap-1.5 min-w-0">
          <Eye
            className={`h-3.5 w-3.5 shrink-0 ${showOnHomepage ? 'text-emerald-600' : 'text-slate-400'}`}
            strokeWidth={1.75}
          />
          <span className="text-[11px] font-semibold text-slate-700 truncate">
            Mostrar en Portada (<code className="font-mono text-[10px]">Inicio</code>)
          </span>
        </div>
        <Switch
          label=""
          size="sm"
          value={showOnHomepage}
          onChange={onToggleHomepage}
        />
      </div>

      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70">
        <div className="flex items-center gap-1.5 min-w-0">
          <LayoutGrid
            className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-catador-blue' : 'text-slate-400'}`}
            strokeWidth={1.75}
          />
          <span className="text-[11px] font-semibold text-slate-700 truncate">
            Activa en Catálogo
          </span>
        </div>
        <Switch
          label=""
          size="sm"
          value={isActive}
          onChange={onToggleActive}
        />
      </div>
    </div>
  );
}

