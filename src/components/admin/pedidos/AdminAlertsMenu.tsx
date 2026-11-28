'use client';

import { useEffect, useRef, useState } from 'react';
import { BellRing, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminAlertsMenuProps {
  soundEnabled: boolean;
  needsPermission: boolean;
  onToggleSound: () => void;
  onTestAlert: () => void;
}

/**
 * Menú compacto de alertas del navegador (timbre sonoro + prueba manual),
 * evitando saturar la barra superior de /admin/pedidos con múltiples botones.
 */
export function AdminAlertsMenu({
  soundEnabled,
  needsPermission,
  onToggleSound,
  onTestAlert,
}: AdminAlertsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => (needsPermission ? onToggleSound() : setOpen((prev) => !prev))}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'flex items-center gap-1.5 rounded-lg border min-h-[36px] px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
          needsPermission
            ? 'border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100 ring-2 ring-amber-400/30'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        )}
      >
        {needsPermission ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
            </span>
            <BellRing className="h-3.5 w-3.5 text-amber-700" strokeWidth={1.75} />
            <span>Activar Sonido</span>
          </>
        ) : (
          <>
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
            )}
            <span>{soundEnabled ? 'Alertas' : 'Silenciado'}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
          </>
        )}
      </button>

      {open && !needsPermission && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-30 space-y-1"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onToggleSound();
              setOpen(false);
            }}
            className="w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {soundEnabled ? (
                <VolumeX className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
              )}
              <span>{soundEnabled ? 'Silenciar timbre' : 'Activar timbre'}</span>
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onTestAlert();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <BellRing className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.75} />
            <span>Probar sonido y aviso</span>
          </button>
        </div>
      )}
    </div>
  );
}
