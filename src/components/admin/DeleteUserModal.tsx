'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { useToast } from '@astryxdesign/core/Toast';
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
  const showToast = useToast();

  if (!user) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await onConfirmDelete(user.id);
      showToast({ body: `Usuario "${user.nombre}" eliminado correctamente.` });
      onClose();
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al eliminar usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) onClose();
      }}
      width={460}
      purpose="form"
    >
      <Layout
        height="auto"
        header={
          <DialogHeader
            title="Eliminar Usuario"
            subtitle="Acción destructiva permanente"
            onOpenChange={(open) => {
              if (!open && !loading) onClose();
            }}
            hasDivider
          />
        }
        content={
          <LayoutContent className="space-y-3 text-xs">
            {errorMsg && <Banner status="error" title={errorMsg} />}

            <p className="text-slate-700 leading-relaxed text-sm">
              ¿Estás seguro de que deseas eliminar la cuenta de{' '}
              <strong className="text-slate-900 font-black">{user.nombre}</strong>?
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[11px] text-slate-500 font-mono truncate">ID: {user.id}</p>
              <p className="text-[11px] text-slate-700 font-bold">
                Cédula / RIF: {user.cedula || 'No registrada'}
              </p>
              <p className="text-[11px] text-slate-700 font-bold">
                Teléfono: {user.telefono || 'No registrado'}
              </p>
            </div>

            <Banner
              status="warning"
              title="Se eliminarán los datos de acceso y su perfil"
              description="Esta acción no se puede deshacer."
            />
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                label="Cancelar"
                variant="secondary"
                isDisabled={loading}
                onClick={onClose}
              />
              <Button
                label="Sí, Eliminar Usuario"
                variant="destructive"
                icon={<Trash2 className="h-4 w-4" />}
                isLoading={loading}
                onClick={() => void handleDelete()}
              />
            </div>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
