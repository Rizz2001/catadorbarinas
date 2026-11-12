'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink, Flame, LayoutGrid, Loader2, Tags } from 'lucide-react';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { buildHomeCmsPayload } from '@/adapters';
import {
  BentoCardNode,
  FlashSaleCampaign,
  StoreConfig,
  TrustBadgeNode,
} from '@/types';
import { getStoreConfig } from '@/services/cms.service';
import {
  BentoCardsManager,
  FlashSaleCampaignManager,
  FlashSaleProductsSelector,
  QuickCategoriesEditor,
  TrustBadgesManager,
} from '@/components/admin';

type HomeCmsTab = 'nodes' | 'categories' | 'flash';

export default function AdminInicioCmsPage() {
  const [activeTab, setActiveTab] = useState<HomeCmsTab>('nodes');
  const [loading, setLoading] = useState(true);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);

  const initialPayload = useMemo(
    () => buildHomeCmsPayload(storeConfig, undefined),
    [storeConfig]
  );

  const [bentoCards, setBentoCards] = useState<BentoCardNode[]>(initialPayload.bentoCards);
  const [trustBadges, setTrustBadges] = useState<TrustBadgeNode[]>(initialPayload.trustBadges);
  const [trustActive, setTrustActive] = useState<boolean>(true);
  const [flashCampaign, setFlashCampaign] = useState<FlashSaleCampaign>(
    initialPayload.flashSaleCampaign
  );

  useEffect(() => {
    let active = true;
    getStoreConfig()
      .then((cfg) => {
        if (!active) return;
        setStoreConfig(cfg);
        const resolved = buildHomeCmsPayload(cfg, undefined);
        setBentoCards(resolved.bentoCards);
        setTrustBadges(resolved.trustBadges);
        setTrustActive(cfg?.seccion_confianza_activa !== false);
        setFlashCampaign(resolved.flashSaleCampaign);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-catador-blue" strokeWidth={1.5} />
        <span className="text-xs font-bold text-slate-500">
          Cargando configuración visual de portada...
        </span>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
            Apariencia y Secciones de Portada (Inicio CMS)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administra los nodos Bento/Confianza (JSONB), categorías rápidas y campañas de ofertas relámpago.
          </p>
        </div>

        <Link
          href="/"
          className="min-h-[40px] px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-extrabold text-slate-800 inline-flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
        >
          <span>Ver Tienda en Vivo</span>
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>

      <TabList
        value={activeTab}
        onChange={(v) => setActiveTab(v as HomeCmsTab)}
        overflow="scroll"
        hasDivider
      >
        <Tab
          value="nodes"
          label="Nodos Bento y Confianza"
          icon={<LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />}
        />
        <Tab
          value="categories"
          label="Categorías Rápidas"
          icon={<Tags className="h-3.5 w-3.5" strokeWidth={1.5} />}
        />
        <Tab
          value="flash"
          label="Ofertas Relámpago"
          icon={<Flame className="h-3.5 w-3.5" strokeWidth={1.5} />}
        />
      </TabList>

      {activeTab === 'nodes' && (
        <div className="space-y-5">
          <BentoCardsManager
            cards={bentoCards}
            onCardsChange={setBentoCards}
            onConfigSaved={setStoreConfig}
          />
          <TrustBadgesManager
            badges={trustBadges}
            active={trustActive}
            onBadgesChange={setTrustBadges}
            onActiveChange={setTrustActive}
            onConfigSaved={setStoreConfig}
          />
        </div>
      )}

      {activeTab === 'categories' && <QuickCategoriesEditor />}

      {activeTab === 'flash' && (
        <div className="space-y-5">
          <FlashSaleCampaignManager
            campaign={flashCampaign}
            bentoCards={bentoCards}
            onCampaignChange={setFlashCampaign}
            onConfigSaved={setStoreConfig}
          />
          <FlashSaleProductsSelector />
        </div>
      )}
    </main>
  );
}
