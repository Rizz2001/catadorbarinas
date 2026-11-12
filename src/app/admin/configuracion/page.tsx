'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { useToast } from '@astryxdesign/core/Toast';
import { StoreConfig } from '@/types';
import { useStoreConfigStore, DEFAULT_STORE_CONFIG } from '@/store/useStoreConfigStore';
import {
  ConfigIdentidadSection,
  ConfigDeliverySection,
  ConfigBancariaSection,
  ConfigBcvSection,
  ConfigCatalogoSection,
} from '@/components/admin/config';

export default function AdminConfiguracionPage() {
  const { config, fetchConfig, updateConfig, isLoading } = useStoreConfigStore();
  const showToast = useToast();
  const [form, setForm] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      const timer = setTimeout(() => setForm(config), 0);
      return () => clearTimeout(timer);
    }
  }, [config]);

  const handleChange = (patch: Partial<StoreConfig>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleQuickSaveLogo = async () => {
    await updateConfig({
      logo_url: form.logo_url,
      logo_alto_px: form.logo_alto_px,
      logo_ancho_px: form.logo_ancho_px,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      setSaving(true);
      await updateConfig(form);
      setSaved(true);
      showToast({ body: 'Configuración guardada y sincronizada en la tienda.' });
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error guardando configuración';
      setErrorMsg(msg);
      showToast({ body: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4 sm:p-6 space-y-5 max-w-4xl">
      <div className="border-b border-slate-200 pb-3.5">
        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
          Configuración General, BCV y Tarifas de Delivery GPS
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Identidad comercial, cálculo logístico (Motorizado vs. Carga), cuentas receptoras y tasa oficial
        </p>
      </div>

      {saved && (
        <Banner
          status="success"
          title="Configuración guardada exitosamente"
          description="Los cambios ya están activos en toda la tienda."
          isDismissable
          onDismiss={() => setSaved(false)}
        />
      )}

      {errorMsg && (
        <Banner
          status="error"
          title="No se pudo guardar la configuración"
          description={errorMsg}
          isDismissable
          onDismiss={() => setErrorMsg(null)}
        />
      )}

      {isLoading && !form.id ? (
        <div className="p-12 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-catador-blue" strokeWidth={1.5}/>
          <span className="text-xs font-bold text-slate-500">Cargando configuración...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <ConfigIdentidadSection
            form={form}
            onChange={handleChange}
            onQuickSave={handleQuickSaveLogo}
          />
          <ConfigDeliverySection form={form} onChange={handleChange} />
          <ConfigCatalogoSection form={form} onChange={handleChange} />
          <ConfigBancariaSection form={form} onChange={handleChange} />
          <ConfigBcvSection form={form} onChange={handleChange} />

          <div className="pt-2">
            <Button
              type="submit"
              label={saving ? 'Guardando...' : 'Guardar Toda la Configuración'}
              variant="primary"
              size="lg"
              icon={<Save className="h-4 w-4" strokeWidth={1.5}/>}
              isLoading={saving}
            />
          </div>
        </form>
      )}
    </main>
  );
}
