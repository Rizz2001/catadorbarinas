'use client';

import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { Switch } from '@/components/admin/ui';
import { Button } from '@astryxdesign/core/Button';
import { useToast } from '@astryxdesign/core/Toast';
import { StoreConfig, TrustBadgeNode } from '@/types';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { TrustBadgeEditorRow } from './TrustBadgeEditorRow';

interface TrustBadgesManagerProps {
  badges: TrustBadgeNode[];
  active: boolean;
  onBadgesChange: (next: TrustBadgeNode[]) => void;
  onActiveChange: (active: boolean) => void;
  onConfigSaved: (saved: StoreConfig) => void;
}

export function TrustBadgesManager({
  badges,
  active,
  onBadgesChange,
  onActiveChange,
  onConfigSaved,
}: TrustBadgesManagerProps) {
  const showToast = useToast();
  const [saving, setSaving] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const updateBadge = (idx: number, patch: Partial<TrustBadgeNode>) => {
    onBadgesChange(badges.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const handleAdd = () => {
    onBadgesChange([
      ...badges,
      {
        id: `trust-${Date.now()}`,
        figura: 'Nuevo Dato',
        titulo: 'Garantía Oficial',
        subtitulo: 'Describe el beneficio operativo para tus clientes.',
        icon: 'ShieldCheck',
        href: '',
      },
    ]);
    setExpandedIndex(badges.length);
  };

  const handleDelete = (idx: number) => {
    onBadgesChange(badges.filter((_, i) => i !== idx));
    setExpandedIndex((prev) => (prev === idx ? null : prev && prev > idx ? prev - 1 : prev));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = badges.map((item, idx) => ({
        ...item,
        id: item.id || `trust-${idx + 1}`,
        figura: item.figura.trim() || 'Garantía',
        titulo: item.titulo.trim() || 'Beneficio',
        subtitulo: item.subtitulo.trim(),
        icon: item.icon?.trim() || 'ShieldCheck',
        href: item.href?.trim() || undefined,
      }));
      const saved = await useStoreConfigStore.getState().updateConfig({
        seccion_confianza_activa: active,
        metricas_confianza: normalized,
      });
      onConfigSaved(saved);
      showToast({ body: 'Barra de Confianza (JSONB) guardada y publicada.' });
    } catch (err) {
      showToast({
        body: err instanceof Error ? err.message : 'Error guardando Barra de Confianza.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Barra de Confianza (JSONB: <code className="text-xs font-mono">metricas_confianza</code>)
          </h2>
          <p className="text-xs text-slate-500">
            Administra los pilares operativos con icono dinámico Lucide y enlace opcional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Switch
            label={active ? 'Visible' : 'Oculta'}
            labelPosition="start"
            size="sm"
            value={active}
            onChange={onActiveChange}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="min-h-[38px] px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Agregar Bloque</span>
          </button>

          <Button
            onClick={handleSave}
            isLoading={saving}
            variant="primary"
            label="Guardar Confianza"
            icon={<Save className="h-4 w-4" strokeWidth={1.5} />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {badges.map((badge, idx) => (
          <TrustBadgeEditorRow
            key={badge.id || idx}
            badge={badge}
            index={idx}
            isOpen={expandedIndex === idx}
            onToggleOpen={() => setExpandedIndex((prev) => (prev === idx ? null : idx))}
            onChange={(patch) => updateBadge(idx, patch)}
            onDelete={() => handleDelete(idx)}
          />
        ))}
      </div>
    </section>
  );
}
