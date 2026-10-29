'use client';

import React from 'react';
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';

interface DeleteOrderModalProps {
  orderNumber: string;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteOrderModal({
  orderNumber,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-200" />
            <h3 className="text-sm font-black">Eliminar Pedido #{orderNumber}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-700 leading-relaxed">
            ¿Estás seguro de que deseas eliminar permanentemente este pedido?
          </p>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1 text-[11px]">
            <p className="font-bold">⚠️ Esta acción no se puede deshacer:</p>
            <ul className="list-disc list-inside space-y-0.5 text-rose-700">
              <li>Se removerán los artículos y el registro de venta.</li>
              <li>Se borrarán los comprobantes y pagos asociados.</li>
              <li>Se eliminará todo el historial de chat con el cliente.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span>Eliminar Definitivamente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
