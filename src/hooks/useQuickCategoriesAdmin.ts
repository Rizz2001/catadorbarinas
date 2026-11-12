'use client';

import { useState, useEffect } from 'react';
import { type DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useToast } from '@astryxdesign/core/Toast';
import { QuickCategory } from '@/types';
import {
  getQuickCategories,
  upsertQuickCategory,
  deleteQuickCategory,
  revalidateStorefrontCache,
} from '@/services/cms.service';

function normalizeQuickCategory(cat: QuickCategory): QuickCategory {
  const resolvedIcon = (cat.icon_name || cat.icono || 'Wine').trim() || 'Wine';
  const resolvedVisible = cat.show_on_homepage ?? cat.activo ?? true;
  return {
    ...cat,
    icono: resolvedIcon,
    icon_name: resolvedIcon,
    activo: resolvedVisible,
    show_on_homepage: resolvedVisible,
  };
}

/**
 * Hook de gestión y ordenamiento Drag & Drop para Categorías Rápidas del CMS.
 */
export function useQuickCategoriesAdmin() {
  const showToast = useToast();
  const [categories, setCategories] = useState<QuickCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
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
    setCategories((prev) => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        nombre: 'Nueva Categoría',
        descripcion: 'Acceso rápido',
        url: '/catalogo',
        icono: 'Wine',
        icon_name: 'Wine',
        orden: prev.length + 1,
        activo: true,
        show_on_homepage: true,
      },
    ]);
  };

  const handleSave = async (cat: QuickCategory) => {
    setSavingId(cat.id);
    try {
      const saved = await upsertQuickCategory(normalizeQuickCategory(cat));
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(categories, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      orden: idx + 1,
    }));
    setCategories(reordered);
    setReordering(true);
    try {
      const updated = await Promise.all(
        reordered.map((cat) => upsertQuickCategory(normalizeQuickCategory(cat)))
      );
      setCategories(updated.sort((a, b) => a.orden - b.orden));
      await revalidateStorefrontCache();
      showToast({ body: 'Orden de categorías rápidas guardado.' });
    } catch (err) {
      showToast({
        body: err instanceof Error ? err.message : 'Error guardando nuevo orden.',
      });
    } finally {
      setReordering(false);
    }
  };

  return {
    categories,
    loading,
    savingId,
    reordering,
    successId,
    handleRefresh,
    handleChange,
    handleAdd,
    handleSave,
    handleDelete,
    handleDragEnd,
  };
}

