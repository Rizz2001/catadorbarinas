'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, Loader2, Edit3, Trash2, Ban, CheckCircle2, AlertCircle, MailCheck } from 'lucide-react';
import { Database } from '@/types/supabase';
import { EditUserModal, DeleteUserModal } from '@/components/admin';

type PerfilRow = Database['public']['Tables']['perfiles']['Row'];

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<PerfilRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<PerfilRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<PerfilRow | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.users)) {
          setUsers(json.users);
        }
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    setUpdatingId(targetUserId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, rol: newRole as PerfilRow['rol'] } : u))
        );
      }
    } catch (err) {
      console.error('Error actualizando rol:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleSuspend = async (user: PerfilRow) => {
    const nextState = !user.suspendido;
    setUpdatingId(user.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: user.id,
          suspendido: nextState,
          motivo_suspension: nextState ? 'Suspendido desde panel de administración' : null,
        }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, suspendido: nextState } : u))
        );
      } else {
        const data = await res.json();
        alert(data.error || 'No se pudo cambiar el estado de suspensión');
      }
    } catch (err) {
      console.error('Error suspendiendo usuario:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async (userId: string) => {
    const res = await fetch(`/api/admin/users?userId=${userId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al eliminar usuario');
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleUserSaved = (updatedUser: PerfilRow) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.cedula && u.cedula.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.telefono && u.telefono.includes(searchTerm))
  );

  const roleStats = useMemo(() => {
    const total = users.length;
    const clientes = users.filter((u) => u.rol === 'cliente').length;
    const admins = users.filter((u) => u.rol === 'admin').length;
    const suspendidos = users.filter((u) => u.suspendido).length;
    return { total, clientes, admins, suspendidos };
  }, [users]);

  return (
    <main className="p-4 sm:p-6 space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/90 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400">
            Directorio y Control de Acceso
          </span>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-[-0.025em] mt-0.5">
            Gestión de Usuarios y Roles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de datos verificados de clientes, permisos del CMS y motorizados de despacho
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-[42px] rounded-xl border border-slate-200/90 pl-9 pr-3 py-2 text-base md:text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue"
          />
        </div>
      </div>

      {/* Banda de KPIs Reconciliados de Roles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-xl border border-slate-200/90 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90">
        <div className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
            Cuentas Registradas
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tabular-nums tracking-tight">
              {roleStats.total}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">perfiles</span>
          </div>
        </div>
        <div className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
            Clientes Verificados
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-catador-blue tabular-nums tracking-tight">
              {roleStats.clientes}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">compradores</span>
          </div>
        </div>
        <div className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
            Administradores CMS
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 tabular-nums tracking-tight">
              {roleStats.admins}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">acceso total</span>
          </div>
        </div>
        <div className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
            Cuentas Suspendidas
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 tabular-nums tracking-tight">
              {roleStats.suspendidos}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">inhabilitadas</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-catador-blue" />
            <span>Cargando lista de usuarios...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No se encontraron usuarios coincidentes.
          </div>
        ) : (
          <>
            {/* Vista de Tarjetas Apiladas en Móvil (< 768px) - Senior Friendly */}
            <div className="divide-y divide-slate-200 md:hidden">
              {filteredUsers.map((u) => {
                const isUpdating = updatingId === u.id;
                return (
                  <div key={u.id} className="p-4 space-y-3.5 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-11 w-11 shrink-0 rounded-2xl border flex items-center justify-center font-black text-sm shadow-xs ${
                            u.suspendido
                              ? 'bg-rose-100 text-rose-700 border-rose-300'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 text-sm truncate">
                            {u.nombre}
                          </p>
                          <p className="text-xs font-mono text-slate-600 mt-0.5">
                            {u.cedula || 'Sin cédula'} • {u.telefono || 'Sin teléfono'}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {u.correo_confirmado ? (
                          <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-black inline-flex items-center gap-1">
                            <MailCheck className="h-3 w-3" /> Verificado
                          </span>
                        ) : (
                          <span className="rounded-md bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-black inline-flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Sin Confirmar
                          </span>
                        )}
                        {u.suspendido ? (
                          <span className="rounded-md bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 text-xs font-black uppercase">
                            Suspendido
                          </span>
                        ) : (
                          <span className="rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-xs font-black">
                            Activo
                          </span>
                        )}
                      </div>
                    </div>

                    {u.motivo_suspension && u.suspendido && (
                      <p className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        <strong>Motivo de suspensión:</strong> {u.motivo_suspension}
                      </p>
                    )}

                    {u.direccion && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        📍 {u.direccion}
                      </p>
                    )}

                    {/* Selector de Rol Grande */}
                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-xs font-black text-slate-700">Rol / Acceso:</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={u.rol}
                          disabled={isUpdating}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 min-h-[42px] text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20 cursor-pointer"
                        >
                          <option value="cliente">Cliente (Comprador)</option>
                          <option value="admin">Administrador (CMS Total)</option>
                          <option value="repartidor">Repartidor (Despacho)</option>
                        </select>
                        {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-catador-blue" />}
                      </div>
                    </div>

                    {/* Botonera de Acciones Táctiles con Texto Claro y Separación */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingUser(u)}
                        className="flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-catador-blue font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4 shrink-0" />
                        <span>Modificar</span>
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleToggleSuspend(u)}
                        className={`flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl border font-extrabold text-xs shadow-xs transition-colors cursor-pointer ${
                          u.suspendido
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                        }`}
                      >
                        {u.suspendido ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span>Reactivar</span>
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 shrink-0 text-amber-700" />
                            <span>Suspender</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingUser(u)}
                        className="flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 shrink-0" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vista de Tabla en Tablet / Escritorio (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Usuario</th>
                    <th className="p-3.5">Cédula / RIF</th>
                    <th className="p-3.5">Teléfono</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5">Rol / Permisos</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map((u) => {
                    const isUpdating = updatingId === u.id;
                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/70 transition-colors ${u.suspendido ? 'bg-rose-50/30' : ''}`}>
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className={`h-7 w-7 rounded-full border flex items-center justify-center font-black text-[10px] ${
                              u.suspendido ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {u.nombre.charAt(0)}
                            </div>
                            <span className="truncate max-w-[160px]">{u.nombre}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono">{u.cedula || 'No especificada'}</td>
                        <td className="p-3.5">{u.telefono || 'No registrado'}</td>
                        <td className="p-3.5">
                          <div className="flex flex-col gap-1 items-start">
                            {u.suspendido ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-[10px] font-black text-rose-800 uppercase">
                                <Ban className="h-3 w-3" /> Suspendido
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Activo
                              </span>
                            )}
                            {u.correo_confirmado ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                                <MailCheck className="h-3 w-3 text-emerald-600" /> Correo verificado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                                <AlertCircle className="h-3 w-3 text-amber-600" /> Correo sin verificar
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <select
                              value={u.rol}
                              disabled={isUpdating}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-catador-blue/20 cursor-pointer"
                            >
                              <option value="cliente">Cliente (Comprador)</option>
                              <option value="admin">Administrador (CMS Total)</option>
                              <option value="repartidor">Repartidor (Despacho)</option>
                            </select>
                            {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin text-catador-blue" />}
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingUser(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-catador-blue text-slate-700 hover:text-catador-blue font-bold text-xs bg-white shadow-2xs transition-colors cursor-pointer"
                              title="Modificar datos del usuario"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleToggleSuspend(u)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-bold text-xs shadow-2xs transition-colors cursor-pointer ${
                                u.suspendido
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                              }`}
                              title={u.suspendido ? 'Reactivar cuenta' : 'Suspender cuenta'}
                            >
                              {u.suspendido ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                              <span>{u.suspendido ? 'Reactivar' : 'Suspender'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingUser(u)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                              title="Eliminar usuario permanentemente"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSaveSuccess={handleUserSaved}
      />

      <DeleteUserModal
        user={deletingUser}
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </main>
  );
}
