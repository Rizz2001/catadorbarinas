'use client';

import { useState, type ReactNode } from 'react';
import { Eye, Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PreviewViewportMode = 'desktop' | 'mobile';

interface DeviceSimulatorProps {
  title: string;
  children: (mode: PreviewViewportMode) => ReactNode;
}

/**
 * Simulador interactivo de viewport (Desktop 100% vs Mobile 390px con marco realista) para Vista Previa.
 */
export function DeviceSimulator({ title, children }: DeviceSimulatorProps) {
  const [mode, setMode] = useState<PreviewViewportMode>('desktop');

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Eye className="h-4 w-4 text-catador-blue" strokeWidth={1.5} />
          <span>{title}</span>
        </div>

        <div
          role="group"
          aria-label="Modo de visualización del simulador"
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs"
        >
          <button
            type="button"
            onClick={() => setMode('desktop')}
            aria-pressed={mode === 'desktop'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer',
              mode === 'desktop'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            <Monitor className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('mobile')}
            aria-pressed={mode === 'mobile'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer',
              mode === 'mobile'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            <Smartphone className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Mobile (390px)</span>
          </button>
        </div>
      </div>

      {mode === 'desktop' ? (
        <div className="w-full transition-all duration-200">{children('desktop')}</div>
      ) : (
        <div className="w-full max-w-[390px] mx-auto rounded-[2.25rem] border-[6px] border-slate-900 bg-slate-900 p-2 shadow-xl transition-all duration-200">
          <div className="mx-auto mb-2 mt-0.5 h-1.5 w-20 rounded-full bg-slate-700" />
          <div className="rounded-[1.5rem] bg-[#F7F8FA] p-2.5 overflow-hidden">
            {children('mobile')}
          </div>
          <div className="mt-2 flex items-center justify-center">
            <span className="text-[10px] font-mono text-slate-400">
              Viewport móvil · 390px
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

