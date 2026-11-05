'use client';

import React, { useState } from 'react';
import { X, Save, Loader2, UserCog, ShieldCheck, ExternalLink, MailCheck, AlertCircle } from 'lucide-react';
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
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error inesperado al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

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
        <label className="block font-bold text-slate-700 mb-1">Dirección de Entrega / Domicilio</label>
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
            <span>GPS: {user.latitud}, {user.longitud}</span>
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
        <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
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

      {/* Verificación de Correo Electrónico */}
      <div className={`p-3.5 rounded-xl border transition-colors ${
        correoConfirmado
          ? 'border-emerald-200 bg-emerald-50/60'
          : 'border-amber-200 bg-amber-50/60'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {correoConfirmado ? (
              <MailCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            )}
            <div>
              <span className="font-extrabold text-slate-900 block text-xs">
                Verificación de Correo
              </span>
              <span className="text-[11px] text-slate-600 block">
                {correoConfirmado
                  ? 'Correo confirmado (puede comprar)'
                  : 'Sin confirmar (bloqueado para hacer pedidos)'}
              </span>
            </div>
          </div>
          <label className="inline-flex items-center gap-1.5 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={correoConfirmado}
              onChange={(e) => setCorreoConfirmado(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-catador-blue focus:ring-catador-blue"
            />
            <span className={`text-xs font-black ${correoConfirmado ? 'text-emerald-700' : 'text-amber-700'}`}>
              {correoConfirmado ? 'CONFIRMADO' : 'PENDIENTE'}
            </span>
          </label>
        </div>
      </div>

      {/* Control de Suspensión de Cuenta */}
      <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-extrabold text-slate-900 block text-xs">
              Estado de la Cuenta
            </span>
            <span className="text-[11px] text-slate-600 block">
              Suspender impide al usuario comprar o iniciar pedidos
            </span>
          </div>
          <label className="inline-flex items-center gap-1.5 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={suspendido}
              onChange={(e) => setSuspendido(e.target.checked)}
              className="h-4 w-4 rounded border-amber-300 text-catador-blue focus:ring-catador-blue"
            />
            <span className={`text-xs font-black ${suspendido ? 'text-rose-700' : 'text-emerald-700'}`}>
              {suspendido ? 'SUSPENDIDO' : 'ACTIVO'}
            </span>
          </label>
        </div>

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

      <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Guardar Cambios</span>
        </button>
      </div>
    </form>
  );
}

export function EditUserModal({ user, isOpen, onClose, onSaveSuccess }: EditUserModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-catador-blue text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-catador-amber flex items-center justify-center text-white">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Modificar Usuario y Permisos</h3>
              <p className="text-[11px] text-blue-200">Edición administrativa de perfil y rol</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <UserEditForm
          key={user.id}
          user={user}
          onClose={onClose}
          onSaveSuccess={onSaveSuccess}
        />
      </div>
    </div>
  );
}
