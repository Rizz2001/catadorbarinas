'use client';

import { useState } from 'react';
import { Flame, Save } from 'lucide-react';
import { Switch } from '@astryxdesign/core/Switch';
import { Button } from '@astryxdesign/core/Button';
import { useToast } from '@astryxdesign/core/Toast';
import { BentoCardNode, FlashSaleCampaign, StoreConfig } from '@/types';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { FlashSaleDatetimeField } from './FlashSaleDatetimeField';

interface FlashSaleCampaignManagerProps {
  campaign: FlashSaleCampaign;
  bentoCards: BentoCardNode[];
  onCampaignChange: (next: FlashSaleCampaign) => void;
  onConfigSaved: (saved: StoreConfig) => void;
}

export function FlashSaleCampaignManager({
  campaign,
  bentoCards,
  onCampaignChange,
  onConfigSaved,
}: FlashSaleCampaignManagerProps) {
  const showToast = useToast();
  const [saving, setSaving] = useState(false);
  const resolvedIso = campaign.campaign_end_date || campaign.endsAt;

  const handleSaveCampaign = async () => {
    setSaving(true);
    try {
      const nextCampaign: FlashSaleCampaign = {
        ...campaign,
        endsAt: resolvedIso,
        campaign_end_date: resolvedIso,
      };
      const syncedBentos = bentoCards.map((card) =>
        card.kind === 'offers_countdown' ? { ...card, endsAt: resolvedIso } : card
      );

      const saved = await useStoreConfigStore.getState().updateConfig({
        seccion_ofertas_activa: nextCampaign.active,
        seccion_ofertas_titulo: nextCampaign.title,
        flash_sale_campaign: nextCampaign,
        bento_cards: syncedBentos,
      });

      onConfigSaved(saved);
      showToast({ body: 'Campaña de Ofertas Relámpago y contador guardados.' });
    } catch (err) {
      showToast({
        body: err instanceof Error ? err.message : 'Error guardando campaña de ofertas.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Flame className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              Campaña y Temporizador (<code className="text-xs font-mono">campaign_end_date</code>)
            </h2>
            <p className="text-xs text-slate-500">
              Define textos y la fecha límite exacta que alimenta los contadores de portada.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Switch
            label={campaign.active ? 'Activa' : 'Oculta'}
            labelPosition="start"
            size="sm"
            value={campaign.active}
            onChange={(active) => onCampaignChange({ ...campaign, active })}
          />
          <Button
            onClick={handleSaveCampaign}
            isLoading={saving}
            variant="primary"
            label="Guardar Campaña"
            icon={<Save className="h-4 w-4" strokeWidth={1.5} />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Badge Superior</label>
          <input
            type="text"
            value={campaign.badgeText}
            onChange={(e) => onCampaignChange({ ...campaign, badgeText: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Título Principal</label>
          <input
            type="text"
            value={campaign.title}
            onChange={(e) => onCampaignChange({ ...campaign, title: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Máx. Artículos Portada
          </label>
          <input
            type="number"
            min={1}
            max={12}
            value={campaign.maxItems}
            onChange={(e) =>
              onCampaignChange({ ...campaign, maxItems: Math.max(1, Number(e.target.value) || 4) })
            }
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 tabular-nums"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Subtítulo</label>
          <input
            type="text"
            value={campaign.subtitle}
            onChange={(e) => onCampaignChange({ ...campaign, subtitle: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
          />
        </div>

        <FlashSaleDatetimeField
          isoValue={resolvedIso}
          onChangeIso={(iso) =>
            onCampaignChange({ ...campaign, endsAt: iso, campaign_end_date: iso })
          }
        />
      </div>
    </section>
  );
}
