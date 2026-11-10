'use client';

import React from 'react';
import { AlertDialog } from '@astryxdesign/core/AlertDialog';

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
  return (
    <AlertDialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onCancel();
      }}
      title={`Eliminar Pedido #${orderNumber}`}
      description="Esta acción no se puede deshacer. Se removerán los artículos, comprobantes de pago y todo el historial de chat asociado con el cliente."
      cancelLabel="Cancelar"
      actionLabel="Eliminar Definitivamente"
      actionVariant="destructive"
      isActionLoading={isDeleting}
      onAction={onConfirm}
    />
  );
}
