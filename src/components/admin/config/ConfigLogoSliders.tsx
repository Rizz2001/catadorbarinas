'use client';

import React from 'react';
import { Sliders, Maximize2, Plus, Minus, Save, Sparkles, Loader2 } from 'lucide-react';

interface ConfigLogoSlidersProps {
  currentHeight: number;
  currentWidth: number;
  savingQuick: boolean;
  onDimensionsChange: (dims: { logo_alto_px?: number; logo_ancho_px?: number }) => void;
  onDirectSave?: () => Promise<void>;
}

export function ConfigLogoSliders({
  currentHeight,
  currentWidth,
  savingQuick,
  onDimensionsChange,
  onDirectSave,
}: ConfigLogoSlidersProps) {
  const applyPreset = (h: number, w: number) => {
    onDimensionsChange({ logo_alto_px: h, logo_ancho_px: w });
  };

  const adjustHeight = (delta: number) => {
    const nextH = Math.min(88, Math.max(28, currentHeight + delta));
    onDimensionsChange({ logo_alto_px: nextH });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
      {/* Presets Rápidos */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-catador-amber" />
          Tamaños Recomendados:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset(40, 180)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Compacto (40px)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(56, 240)}
            className="px-2.5 py-1 rounded-lg border border-catador-blue/40 bg-blue-50 text-[11px] font-bold text-catador-blue hover:bg-blue-100/60 transition-colors cursor-pointer"
          >
            Equilibrado (56px)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(70, 280)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Destacado (70px)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(84, 340)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Extra Grande (84px)
          </button>
        </div>
      </div>

      {/* Sliders de Altura y Ancho */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Slider de Altura */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-catador-amber" />
              Altura en Cabecera
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => adjustHeight(-2)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="Reducir altura 2px"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="font-extrabold text-catador-blue bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-mono text-[11px]">
                {currentHeight} px
              </span>
              <button
                type="button"
                onClick={() => adjustHeight(2)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="Aumentar altura 2px"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
          <input
            type="range"
            min={28}
            max={88}
            step={1}
            value={currentHeight}
            onChange={(e) => onDimensionsChange({ logo_alto_px: Number(e.target.value) })}
            className="w-full accent-catador-blue cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>28 px (Mínimo)</span>
            <span>56 px (Recomendado)</span>
            <span>88 px (Máximo)</span>
          </div>
        </div>

        {/* Slider de Ancho Máximo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5 text-catador-amber" />
              Ancho Máximo en Cabecera
            </span>
            <span className="font-extrabold text-catador-blue bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-mono text-[11px]">
              {currentWidth} px
            </span>
          </div>
          <input
            type="range"
            min={120}
            max={360}
            step={5}
            value={currentWidth}
            onChange={(e) => onDimensionsChange({ logo_ancho_px: Number(e.target.value) })}
            className="w-full accent-catador-blue cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>120 px (Compacto)</span>
            <span>240 px (Estándar)</span>
            <span>360 px (Ancho)</span>
          </div>
        </div>
      </div>

      {/* Botón de Guardado Directo del Tamaño */}
      {onDirectSave && (
        <div className="pt-2 flex justify-end border-t border-slate-100">
          <button
            type="button"
            disabled={savingQuick}
            onClick={onDirectSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            {savingQuick ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{savingQuick ? 'Guardando...' : 'Aplicar y Guardar Tamaño del Logo'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
