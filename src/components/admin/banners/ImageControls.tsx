'use client';

import {
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Contrast,
} from 'lucide-react';
import { BannerObjectPosition } from '@/types';
import { cn } from '@/lib/utils';

interface ImageControlsProps {
  overlayOpacity: number;
  objectPosition: BannerObjectPosition;
  onOverlayChange: (opacity: number) => void;
  onPositionChange: (position: BannerObjectPosition) => void;
}

const POSITION_OPTIONS: Array<{
  value: BannerObjectPosition;
  label: string;
  icon: typeof AlignVerticalJustifyStart;
}> = [
  { value: 'top', label: 'Arriba', icon: AlignVerticalJustifyStart },
  { value: 'center', label: 'Centro', icon: AlignVerticalJustifyCenter },
  { value: 'bottom', label: 'Abajo', icon: AlignVerticalJustifyEnd },
];

/**
 * Controles avanzados de legibilidad: opacidad del overlay oscuro (0-100%) y enfoque vertical.
 */
export function ImageControls({
  overlayOpacity,
  objectPosition,
  onOverlayChange,
  onPositionChange,
}: ImageControlsProps) {
  const safeOpacity = Math.min(100, Math.max(0, Math.round(overlayOpacity)));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="banner-overlay-opacity"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700"
          >
            <Contrast className="h-3.5 w-3.5 text-catador-blue" strokeWidth={1.5} />
            <span>Opacidad de Overlay Oscuro</span>
          </label>
          <span className="rounded-md bg-[#0F172A] px-2 py-0.5 text-[11px] font-black text-white tabular-nums">
            {safeOpacity}%
          </span>
        </div>

        <input
          id="banner-overlay-opacity"
          type="range"
          min={0}
          max={100}
          step={5}
          value={safeOpacity}
          onChange={(e) => onOverlayChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-catador-blue"
        />

        <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
          <span>0% Foto pura</span>
          <span>85% Recomendado</span>
          <span>100% Contraste sólido</span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-[11px] font-bold text-slate-700">
          Enfoque Vertical (Object Position)
        </span>

        <div
          role="radiogroup"
          aria-label="Punto focal de la fotografía"
          className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-200/70 p-1"
        >
          {POSITION_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = objectPosition === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onPositionChange(opt.value)}
                className={cn(
                  'h-8 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer',
                  active
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-500">
          Ajusta el encuadre para evitar recortar botellas o etiquetas en móviles.
        </p>
      </div>
    </div>
  );
}

