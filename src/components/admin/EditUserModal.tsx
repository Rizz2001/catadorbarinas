'use client';

import React, { useState } from 'react';
import { Save, ShieldCheck, ExternalLink, MailCheck, AlertCircle } from 'lucide-react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Switch } from '@astryxdesign/core/Switch';
import { Banner } from '@astryxdesign/core/Banner';
import { useToast } from '@astryxdesign/core/Toast';
import { Database } from '@/types/supabase';

type PerfilRow = Database['public']['Tables']['perfiles']['Row'];

interface EditUserModalProps {
  user: PerfilRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updated: PerfilRow) => void;
}

interface UserFormProps {
  user: PerfilRow;
  onClose: () => void;
  onSaveSuccess: (updated: PerfilRow) => void;
}

function UserEditForm({ user, onClose, onSaveSuccess }: UserFormProps) {
  const [nombre, setNombre] = useState(user.nombre || '');
  const [cedula, setCedula] = useState(user.cedula || '');
  const [telefono, setTelefono] = useState(user.telefono || '');
  const [direccion, setDireccion] = useState(user.direccion || '');
  const [rol, setRol] = useState<PerfilRow['rol']>(user.rol || 'cliente');
  const [correoConfirmado, setCorreoConfirmado] = useState<boolean>(Boolean(user.correo_confirmado));
  const [suspendido, setSuspendido] = useState<boolean>(Boolean(user.suspendido));
  const [motivoSuspension, setMotivoSuspension] = useState(user.motivo_suspension || '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const showToast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: user.id,
          nombre,
          cedula,
          telefono,
          direccion,
          rol,
          correo_confirmado: correoConfirmado,
          suspendido,
          motivo_suspension: suspendido ? motivoSuspension : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      onSaveSuccess({
        ...user,
        nombre: nombre.trim(),
        cedula: cedula.trim() || null,
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
        rol,
        correo_confirmado: correoConfirmado,
        suspendido,
        motivo_suspension: suspendido ? motivoSuspension.trim() || null : null,
      });
      showToast({ body: `Perfil de ${nombre.trim()} actualizado.` });
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error inesperado al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout
      height="fill"
      header={
        <DialogHeader
          title="Modificar Usuario y Permisos"
          subtitle="Edición administrativa de perfil, acceso y rol"
          onOpenChange={(open) => {
            if (!open && !saving) onClose();
          }}
          hasDivider
        />
      }
      content={
        <LayoutContent>
          <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && <Banner status="error" title={errorMsg} />}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 py-2 text-base md:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cédula / RIF</label>
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 py-2 text-base md:text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
                  placeholder="V-12345678"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 py-2 text-base md:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
                  placeholder="0414-1234567"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Dirección de Entrega / Domicilio
              </label>
              <textarea
                rows={2}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-base md:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-catador-blue/20 resize-none"
                placeholder="Av. Principal, Edificio / Casa..."
              />
            </div>

            {user.latitud && user.longitud && (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 text-xs">
                <div className="flex items-center gap-2 font-mono text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
                  <span>
                    GPS: {user.latitud}, {user.longitud}
                  </span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${user.latitud},${user.longitud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-extrabold text-catador-blue hover:underline text-[11px]"
                >
                  <ExternalLink className="h-3 w-3" /> Ver en Google Maps
                </a>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-catador-blue" />
                <span>Rol y Permisos en el Sistema</span>
              </label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as PerfilRow['rol'])}
                className="w-full min-h-[42px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-base md:text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-catador-blue/20 cursor-pointer"
              >
                <option value="cliente">Cliente (Comprador de la Tienda)</option>
                <option value="repartidor">Repartidor (Acceso a Despachos / Entregas)</option>
                <option value="admin">Administrador (Acceso Completo CMS y Operaciones)</option>
              </select>
            </div>

            <div
              className={`p-3.5 rounded-xl border transition-colors ${
                correoConfirmado
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : 'border-amber-200 bg-amber-50/60'
              }`}
            >
              <Switch
                label="Verificación de Correo"
                description={
                  correoConfirmado
                    ? 'Correo confirmado (habilitado para realizar compras)'
                    : 'Sin confirmar (bloqueado para hacer pedidos)'
                }
                labelIcon={
                  correoConfirmado ? (
                    <MailCheck className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )
                }
                labelPosition="start"
                labelSpacing="spread"
                value={correoConfirmado}
                onChange={setCorreoConfirmado}
              />
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2.5">
              <Switch
                label="Suspender Cuenta"
                description="Impide al usuario iniciar sesión operativa o hacer pedidos"
                labelPosition="start"
                labelSpacing="spread"
                value={suspendido}
                onChange={setSuspendido}
              />

              {suspendido && (
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Motivo de la Suspensión (Opcional):
                  </label>
                  <input
                    type="text"
                    value={motivoSuspension}
                    onChange={(e) => setMotivoSuspension(e.target.value)}
                    placeholder="Ej: Pagos no verificados, comportamiento inadecuado..."
                    className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-catador-amber/20"
                  />
                </div>
              )}
            </div>
          </form>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              label="Cancelar"
              variant="secondary"
              isDisabled={saving}
              onClick={onClose}
            />
            <Button
              type="submit"
              form="edit-user-form"
              label="Guardar Cambios"
              variant="primary"
              icon={<Save className="h-4 w-4" />}
              isLoading={saving}
            />
          </div>
        </LayoutFooter>
      }
    />
  );
}

export function EditUserModal({ user, isOpen, onClose, onSaveSuccess }: EditUserModalProps) {
  if (!user) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      width={540}
      purpose="form"
    >
      <UserEditForm key={user.id} user={user} onClose={onClose} onSaveSuccess={onSaveSuccess} />
    </Dialog>
  );
}
