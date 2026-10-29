'use client';

import React, { useState, useEffect } from 'react';
import {
  Wine,
  CupSoda,
  ShoppingBasket,
  Cookie,
  Sandwich,
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { QuickCategory } from '@/types';
import { getQuickCategories, upsertQuickCategory } from '@/services/cms.service';

const AVAILABLE_ICONS = [
  { id: 'Wine', label: 'Copa / Licores', icon: Wine },
  { id: 'CupSoda', label: 'Vaso Frío / Bebidas', icon: CupSoda },
  { id: 'ShoppingBasket', label: 'Canasta / Alimentos', icon: ShoppingBasket },
  { id: 'Cookie', label: 'Galleta / Confitería', icon: Cookie },
  { id: 'Sandwich', label: 'Sándwich / Snacks', icon: Sandwich },
  { id: 'Sparkles', label: 'Destello / Hielo & Agua', icon: Sparkles },
];

export function QuickCategoriesEditor() {
  const [categories, setCategories] = useState<QuickCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getQuickCategories(false)
      .then((list) => {
        if (active) {
          setCategories(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error cargando categorías rápidas:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const list = await getQuickCategories(false);
      setCategories(list);
    } catch (err) {
      console.error('Error refrescando categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, patch: Partial<QuickCategory>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat))
    );
  };

  const handleSave = async (cat: QuickCategory) => {
    try {
      setSavingId(cat.id);
      await upsertQuickCategory(cat);
      setSuccessId(cat.id);
      setTimeout(() => setSuccessId(null), 2500);
    } catch (err) {
      alert('Error guardando categoría: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[30vh] gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-catador-blue" />
        <span className="text-xs font-bold text-slate-500">Cargando Accesos Rápidos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Accesos Rápidos del Hero (Tira de 6 Botones)
          </h2>
          <p className="text-xs text-slate-500">
            Edita los nombres, etiquetas descriptivas, enlaces y el icono de cada botón
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refrescar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const isSaving = savingId === cat.id;
          const isSuccess = successId === cat.id;
          const SelectedIcon = AVAILABLE_ICONS.find((i) => i.id === cat.icono)?.icon || Wine;

          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Cabecera de la tarjeta con icono actual */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-catador-blue/10 text-catador-blue">
                      <SelectedIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400">ID: {cat.id}</span>
                      <h3 className="text-xs font-black text-slate-900">{cat.nombre}</h3>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cat.activo}
                      onChange={(e) => handleChange(cat.id, { activo: e.target.checked })}
                      className="h-3.5 w-3.5 rounded text-catador-blue focus:ring-catador-blue/20"
                    />
                    <span>Activo</span>
                  </label>
                </div>

                {/* Formulario de campos */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nombre Principal</label>
                  <input
                    type="text"
                    value={cat.nombre}
                    onChange={(e) => handleChange(cat.id, { nombre: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Etiqueta / Subtítulo</label>
                  <input
                    type="text"
                    value={cat.descripcion}
                    onChange={(e) => handleChange(cat.id, { descripcion: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">URL de Destino</label>
                  <input
                    type="text"
                    value={cat.url}
                    onChange={(e) => handleChange(cat.id, { url: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Icono Gráfico</label>
                  <select
                    value={cat.icono}
                    onChange={(e) => handleChange(cat.id, { icono: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                  >
                    {AVAILABLE_ICONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botón de guardar */}
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave(cat)}
                className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-catador-blue hover:bg-catador-blue-light text-white shadow-2xs'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>{isSaving ? 'Guardando...' : isSuccess ? '¡Guardado!' : 'Guardar Cambios'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
