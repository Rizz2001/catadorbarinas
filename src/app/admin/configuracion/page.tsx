'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bike, Building2, CreditCard, RotateCcw, Save, Sliders } from 'lucide-react';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { useToast } from '@astryxdesign/core/Toast';
import { StoreConfig } from '@/types';
import { useStoreConfigStore, DEFAULT_STORE_CONFIG } from '@/store/useStoreConfigStore';
import { AdminPageHeader, Tab, TabList } from '@/components/admin/ui';
import {
  ConfigIdentidadSection,
  ConfigDeliverySection,
  ConfigBancariaSection,
  ConfigBcvSection,
  ConfigCatalogoSection,
} from '@/components/admin/config';

type ConfigTab = 'negocio' | 'finanzas' | 'delivery' | 'catalogo';

export default function AdminConfiguracionPage() {
  const { config, fetchConfig, updateConfig, isLoading } = useStoreConfigStore();
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState<ConfigTab>('negocio');
  const [form, setForm] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [savedSnapshot, setSavedSnapshot] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (!config) return;
    const timer = setTimeout(() => {
      setForm(config);
      setSavedSnapshot(config);
    }, 0);
    return () => clearTimeout(timer);
  }, [config]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedSnapshot),
    [form, savedSnapshot]
  );

  const handleChange = (patch: Partial<StoreConfig>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleDiscard = () => {
    setForm(savedSnapshot);
    setErrorMsg(null);
  };

  const handleQuickSaveLogo = async () => {
    await updateConfig({
      logo_url: form.logo_url,
      logo_alto_px: form.logo_alto_px,
      logo_ancho_px: form.logo_ancho_px,
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    try {
      setSaving(true);
      await updateConfig(form);
      setSavedSnapshot(form);
      showToast({ body: 'Configuración guardada y sincronizada en la tienda.' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error guardando configuración';
      setErrorMsg(msg);
      showToast({ body: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4 sm:p-6 pb-28 space-y-5 max-w-5xl">
      <AdminPageHeader
        section="Configuración"
        title="Configuración del Negocio"
        description="Identidad de la tienda, tasa BCV, cuentas de pago, tarifas GPS y reglas del catálogo."
        showBcvPill
        actions={
          <Button
            type="button"
            label={saving ? 'Guardando...' : 'Guardar cambios'}
            variant="primary"
            size="md"
            icon={<Save className="h-4 w-4" strokeWidth={1.75} />}
            isLoading={saving}
            onClick={() => void handleSubmit()}
          />
        }
      />

      {errorMsg && (
        <Banner
          status="error"
          title="No se pudo guardar la configuración"
          description={errorMsg}
          isDismissable
          onDismiss={() => setErrorMsg(null)}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 px-2 sm:px-4 pt-1.5 overflow-x-auto scrollbar-none no-scrollbar">
        <TabList
          value={activeTab}
          onChange={(val) => setActiveTab(val as ConfigTab)}
          overflow="scroll"
          hasDivider={false}
          className="px-1"
        >
          <Tab value="negocio" label="Negocio e Identidad" icon={<Building2 className="h-4 w-4" strokeWidth={1.75} />} />
          <Tab value="finanzas" label="BCV y Pagos" icon={<CreditCard className="h-4 w-4" strokeWidth={1.75} />} />
          <Tab value="delivery" label="Delivery GPS" icon={<Bike className="h-4 w-4" strokeWidth={1.75} />} />
          <Tab value="catalogo" label="Catálogo" icon={<Sliders className="h-4 w-4" strokeWidth={1.75} />} />
        </TabList>
      </div>

      {isLoading && !form.id ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-48 rounded-2xl bg-white border border-slate-200/80 p-5 space-y-3">
            <div className="h-4 w-44 rounded bg-slate-200" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="h-10 rounded-lg bg-slate-100" />
              <div className="h-10 rounded-lg bg-slate-100" />
              <div className="h-10 rounded-lg bg-slate-100" />
              <div className="h-10 rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {activeTab === 'negocio' && (
            <ConfigIdentidadSection
              form={form}
              onChange={handleChange}
              onQuickSave={handleQuickSaveLogo}
            />
          )}
          {activeTab === 'finanzas' && (
            <div className="space-y-5">
              <ConfigBcvSection form={form} onChange={handleChange} />
              <ConfigBancariaSection form={form} onChange={handleChange} />
            </div>
          )}
          {activeTab === 'delivery' && (
            <ConfigDeliverySection form={form} onChange={handleChange} />
          )}
          {activeTab === 'catalogo' && (
            <ConfigCatalogoSection form={form} onChange={handleChange} />
          )}
        </form>
      )}

      {isDirty && (
        <div className="fixed bottom-20 md:bottom-5 left-4 right-4 md:left-auto md:right-6 z-40 md:w-auto max-w-xl mx-auto">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#0F172A] text-white px-4 py-3 shadow-2xl border border-white/10">
            <span className="text-xs sm:text-[13px] font-medium text-slate-200">
              Tienes cambios sin guardar
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 min-h-[36px] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Descartar</span>
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 min-h-[36px] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" strokeWidth={2} />
                <span>{saving ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
