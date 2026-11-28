'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink, Flame, LayoutGrid, Tags } from 'lucide-react';
import { AdminPageHeader, TabList, Tab } from '@/components/admin/ui';
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
      <main className="p-4 sm:p-6 space-y-5 max-w-6xl animate-pulse">
        <div className="space-y-2 border-b border-slate-200/80 pb-4">
          <div className="h-3 w-28 rounded bg-slate-200" />
          <div className="h-6 w-56 rounded bg-slate-200" />
          <div className="h-3.5 w-80 max-w-full rounded bg-slate-100" />
        </div>
        <div className="h-11 rounded-2xl bg-white border border-slate-200/80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 rounded-2xl bg-white border border-slate-200/80" />
          <div className="h-44 rounded-2xl bg-white border border-slate-200/80" />
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 space-y-5 max-w-6xl">
      <AdminPageHeader
        section="Portada"
        title="Portada de la Tienda"
        description="Personaliza las tarjetas destacadas del Hero, categorías rápidas, barra de confianza y ofertas relámpago."
        actions={
          <Link
            href="/"
            className="min-h-[36px] px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Abrir Portada</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
          </Link>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 px-2 sm:px-4 pt-1.5 overflow-x-auto scrollbar-none no-scrollbar">
        <TabList
          value={activeTab}
          onChange={(v) => setActiveTab(v as HomeCmsTab)}
          overflow="scroll"
          hasDivider={false}
          className="px-1"
        >
          <Tab
            value="nodes"
            label="Tarjetas Bento y Confianza"
            icon={<LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.75} />}
          />
          <Tab
            value="categories"
            label="Categorías Rápidas"
            icon={<Tags className="h-3.5 w-3.5" strokeWidth={1.75} />}
          />
          <Tab
            value="flash"
            label="Ofertas Relámpago"
            icon={<Flame className="h-3.5 w-3.5" strokeWidth={1.75} />}
          />
        </TabList>
      </div>

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
