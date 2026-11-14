'use client';

import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { Button } from '@astryxdesign/core/Button';
import { useToast } from '@astryxdesign/core/Toast';
import { BentoCardNode, StoreConfig } from '@/types';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { BentoCardEditorRow } from './BentoCardEditorRow';

interface BentoCardsManagerProps {
  cards: BentoCardNode[];
  onCardsChange: (next: BentoCardNode[]) => void;
  onConfigSaved: (saved: StoreConfig) => void;
}

export function BentoCardsManager({
  cards,
  onCardsChange,
  onConfigSaved,
}: BentoCardsManagerProps) {
  const showToast = useToast();
  const [saving, setSaving] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const updateCard = (idx: number, patch: Partial<BentoCardNode>) => {
    onCardsChange(cards.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const handleAdd = () => {
    const newCard: BentoCardNode = {
      id: `bento-${Date.now()}`,
      kind: 'link_card',
      title: 'Nueva Tarjeta',
      subtitle: 'Descripción corta',
      href: '/catalogo',
      pillText: 'Destacado',
      icon: 'Tag',
      active: true,
      order: cards.length + 1,
    };
    onCardsChange([...cards, newCard]);
    setExpandedIndex(cards.length);
  };

  const handleDelete = (idx: number) => {
    onCardsChange(
      cards.filter((_, i) => i !== idx).map((item, newIdx) => ({ ...item, order: newIdx + 1 }))
    );
    setExpandedIndex((prev) => (prev === idx ? null : prev && prev > idx ? prev - 1 : prev));
  };

  const handleMove = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= cards.length) return;
    const clone = [...cards];
    const [moved] = clone.splice(idx, 1);
    clone.splice(target, 0, moved);
    onCardsChange(clone.map((item, newIdx) => ({ ...item, order: newIdx + 1 })));
    setExpandedIndex(target);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = cards.map((card, i) => ({
        ...card,
        title: card.title.trim() || 'Tarjeta',
        href: card.href.trim() || '/catalogo',
        icon: card.icon?.trim() || 'Tag',
        order: i + 1,
      }));
      const saved = await useStoreConfigStore.getState().updateConfig({ bento_cards: normalized });
      onConfigSaved(saved);
      showToast({ body: 'Tarjetas Bento (JSONB) guardadas y sincronizadas.' });
    } catch (err) {
      showToast({
        body: err instanceof Error ? err.message : 'Error guardando Tarjetas Bento.',
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
            Tarjetas Bento del Hero (JSONB: <code className="text-xs font-mono">bento_cards</code>)
          </h2>
          <p className="text-xs text-slate-500">
            Agrega, edita o reordena los nodos modulares que flotan al pie del Hero en portada.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAdd}
            className="min-h-[38px] px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Agregar Bento</span>
          </button>

          <Button
            onClick={handleSave}
            isLoading={saving}
            variant="primary"
            label="Guardar Bento"
            icon={<Save className="h-4 w-4" strokeWidth={1.5} />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {cards.map((card, idx) => (
          <BentoCardEditorRow
            key={card.id}
            card={card}
            index={idx}
            total={cards.length}
            isOpen={expandedIndex === idx}
            onToggleOpen={() => setExpandedIndex((prev) => (prev === idx ? null : idx))}
            onChange={(patch) => updateCard(idx, patch)}
            onMove={(dir) => handleMove(idx, dir)}
            onDelete={() => handleDelete(idx)}
          />
        ))}
      </div>
    </section>
  );
}
