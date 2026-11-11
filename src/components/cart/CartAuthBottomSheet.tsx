'use client';

import Link from 'next/link';
import { UserCheck, X } from 'lucide-react';

interface CartAuthBottomSheetProps {
  onCloseCart: () => void;
  onDismissSheet: () => void;
}

export function CartAuthBottomSheet({
  onCloseCart,
  onDismissSheet,
}: CartAuthBottomSheetProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 sm:relative sm:inset-auto z-50 rounded-t-3xl sm:rounded-2xl bg-white border-t sm:border border-slate-200 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-12px_36px_rgba(15,23,42,0.18)] animate-in slide-in-from-bottom duration-200">
      <button
        type="button"
        onClick={onDismissSheet}
        aria-label="Cerrar aviso de inicio de sesión"
        className="absolute top-3.5 right-3.5 h-9 w-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col items-center text-center pt-1">
        <div className="h-12 w-12 rounded-2xl bg-catador-amber-soft border border-catador-amber-oak/60 flex items-center justify-center text-catador-blue mb-3">
          <UserCheck className="h-6 w-6" />
        </div>
        <h3 className="text-base font-black text-slate-900">
          Regístrate o inicia sesión
        </h3>
        <p className="text-[13px] font-medium text-slate-600 mt-1 max-w-xs">
          Debes estar autenticado para confirmar tu delivery GPS en Barinas.
        </p>

        <div className="w-full space-y-2.5 mt-4">
          <Link
            href="/login?redirect=/checkout"
            onClick={onCloseCart}
            className="w-full min-h-[46px] flex items-center justify-center rounded-xl bg-catador-blue hover:bg-catador-blue-dark text-sm font-extrabold text-white transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro?redirect=/checkout"
            onClick={onCloseCart}
            className="w-full min-h-[42px] flex items-center justify-center rounded-xl border border-slate-200 bg-[#F7F8FA] hover:bg-slate-100 text-[13px] font-extrabold text-slate-800 transition-colors"
          >
            Crear cuenta nueva
          </Link>
          <button
            type="button"
            onClick={onDismissSheet}
            className="w-full py-1.5 text-[13px] font-bold text-catador-blue hover:text-catador-blue-dark cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
