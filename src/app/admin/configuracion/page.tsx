'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
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
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error guardando configuración');
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
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Configuración guardada exitosamente. Los cambios ya están activos en la tienda.</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 font-bold">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading && !form.id ? (
        <div className="p-12 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-catador-blue" />
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
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 px-6 py-3 font-extrabold text-white text-xs transition-colors cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Guardando...' : 'Guardar Toda la Configuración'}</span>
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
