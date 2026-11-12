'use client';

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Plus } from 'lucide-react';
import { useToast } from '@astryxdesign/core/Toast';
import { QuickCategory } from '@/types';
import {
  getQuickCategories,
  upsertQuickCategory,
  deleteQuickCategory,
  revalidateStorefrontCache,
} from '@/services/cms.service';
import { QuickCategoryCard } from './QuickCategoryCard';

export function QuickCategoriesEditor() {
  const showToast = useToast();
  const [categories, setCategories] = useState<QuickCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getQuickCategories(false)
      .then((list) => {
        if (active) setCategories(list);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const list = await getQuickCategories(false);
      setCategories(list);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, patch: Partial<QuickCategory>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat))
    );
  };

  const handleAdd = () => {
    const newItem: QuickCategory = {
      id: `cat-${Date.now()}`,
      nombre: 'Nueva Categoría',
      descripcion: 'Acceso rápido',
      url: '/catalogo',
      icono: 'Wine',
      icon_name: 'Wine',
      orden: categories.length + 1,
      activo: true,
      show_on_homepage: true,
    };
    setCategories((prev) => [...prev, newItem]);
  };

  const handleSave = async (cat: QuickCategory) => {
    setSavingId(cat.id);
    try {
      const resolvedIcon = (cat.icon_name || cat.icono || 'Wine').trim();
      const resolvedVisible = cat.show_on_homepage ?? cat.activo ?? true;
      const saved = await upsertQuickCategory({
        ...cat,
        icono: resolvedIcon,
        icon_name: resolvedIcon,
        activo: resolvedVisible,
        show_on_homepage: resolvedVisible,
      });

      setCategories((prev) => prev.map((item) => (item.id === cat.id ? saved : item)));
      await revalidateStorefrontCache();
      setSuccessId(cat.id);
      setTimeout(() => setSuccessId(null), 2000);
      showToast({ body: `Categoría "${saved.nombre}" guardada en portada.` });
    } catch (err) {
      showToast({
        body: err instanceof Error ? err.message : 'Error guardando categoría.',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (cat: QuickCategory) => {
    setSavingId(cat.id);
    try {
      await deleteQuickCategory(cat.id);
      setCategories((prev) => prev.filter((item) => item.id !== cat.id));
      await revalidateStorefrontCache();
      showToast({ body: `Categoría "${cat.nombre}" eliminada.` });
    } catch {
      setCategories((prev) => prev.filter((item) => item.id !== cat.id));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[30vh] gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-catador-blue" strokeWidth={1.5} />
        <span className="text-xs font-bold text-slate-500">Cargando Categorías Rápidas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Categorías Rápidas de Portada (<code className="text-xs font-mono">icon_name</code> &amp;{' '}
            <code className="text-xs font-mono">show_on_homepage</code>)
          </h2>
          <p className="text-xs text-slate-500">
            Administra los accesos circulares de Inicio con vista previa Lucide y visibilidad independiente.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-catador-blue transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Agregar Categoría</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <QuickCategoryCard
            key={cat.id}
            category={cat}
            isSaving={savingId === cat.id}
            isSuccess={successId === cat.id}
            onChange={(patch) => handleChange(cat.id, patch)}
            onSave={() => handleSave(cat)}
            onDelete={() => handleDelete(cat)}
          />
        ))}
      </div>
    </div>
  );
}
