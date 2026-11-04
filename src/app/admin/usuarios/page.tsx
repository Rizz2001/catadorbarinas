'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, Loader2, Edit3 } from 'lucide-react';
import { Database } from '@/types/supabase';
import { EditUserModal } from '@/components/admin/EditUserModal';

type PerfilRow = Database['public']['Tables']['perfiles']['Row'];

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<PerfilRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<PerfilRow | null>(null);

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
    const repartidores = users.filter((u) => u.rol === 'repartidor').length;
    return { total, clientes, admins, repartidores };
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
            Flota de Despacho
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 tabular-nums tracking-tight">
              {roleStats.repartidores}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">repartidores</span>
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
            {/* Vista de Tarjetas Apiladas en Móvil (< 768px) */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredUsers.map((u) => {
                const isUpdating = updatingId === u.id;
                return (
                  <div key={u.id} className="p-4 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100 border flex items-center justify-center font-black text-slate-700 text-xs">
                          {u.nombre.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{u.nombre}</p>
                          <p className="text-[11px] font-mono text-slate-500">
                            {u.cedula || 'Sin cédula'} • {u.telefono || 'Sin teléfono'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingUser(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-lg border border-slate-200 text-slate-700 font-bold text-xs bg-white shadow-2xs shrink-0 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-catador-blue" />
                        <span>Modificar</span>
                      </button>
                    </div>

                    {u.direccion && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {u.direccion}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-500">Rol / Permisos:</span>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={u.rol}
                          disabled={isUpdating}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 min-h-[38px] text-base md:text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-catador-blue/20 cursor-pointer"
                        >
                          <option value="cliente">Cliente (Comprador)</option>
                          <option value="admin">Administrador (CMS Total)</option>
                          <option value="repartidor">Repartidor (Despacho)</option>
                        </select>
                        {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin text-catador-blue" />}
                      </div>
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
                    <th className="p-3.5">Dirección</th>
                    <th className="p-3.5">Rol / Permisos</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map((u) => {
                    const isUpdating = updatingId === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-slate-100 border flex items-center justify-center font-black text-slate-700 text-[10px]">
                              {u.nombre.charAt(0)}
                            </div>
                            <span>{u.nombre}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono">{u.cedula || 'No especificada'}</td>
                        <td className="p-3.5">{u.telefono || 'No registrado'}</td>
                        <td className="p-3.5 max-w-xs truncate text-slate-500">{u.direccion || 'Sin dirección'}</td>
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
                          <button
                            type="button"
                            onClick={() => setEditingUser(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-catador-blue text-slate-700 hover:text-catador-blue font-bold text-xs bg-white shadow-2xs transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Modificar</span>
                          </button>
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
    </main>
  );
}
