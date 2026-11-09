'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';
import { Database } from '@/types/supabase';

type PerfilRow = Database['public']['Tables']['perfiles']['Row'];

interface DeleteUserModalProps {
  user: PerfilRow | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (userId: string) => Promise<void>;
}

export function DeleteUserModal({
  user,
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await onConfirmDelete(user.id);
      onClose();
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al eliminar usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Eliminar Usuario</h3>
              <p className="text-[11px] text-rose-100">Acción destructiva permanente</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              {errorMsg}
            </div>
          )}

          <p className="text-slate-600 leading-relaxed">
            ¿Estás seguro de que deseas eliminar la cuenta de{' '}
            <strong className="text-slate-900 font-black">{user.nombre}</strong>?
          </p>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <p className="text-[11px] text-slate-500 font-mono">ID: {user.id}</p>
            <p className="text-[11px] text-slate-700 font-bold">
              Cédula / RIF: {user.cedula || 'No registrada'}
            </p>
            <p className="text-[11px] text-slate-700 font-bold">
              Teléfono: {user.telefono || 'No registrado'}
            </p>
          </div>

          <p className="text-[11px] text-rose-600 font-semibold">
            Se eliminarán los datos de acceso del usuario y su perfil. Esta acción no se puede deshacer.
          </p>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>Sí, Eliminar Usuario</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

