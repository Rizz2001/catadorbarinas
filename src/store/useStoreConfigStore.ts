'use client';

import { create } from 'zustand';
import { StoreConfig } from '@/types';
import { APP_CONFIG } from '@/constants/config';
import { getStoreConfig, updateStoreConfig as updateStoreConfigService } from '@/services/cms.service';

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  id: 'general',
  nombre_tienda: APP_CONFIG.name,
  razon_social: APP_CONFIG.legalName,
  rif: 'J-50123456-7',
  telefono_atencion: APP_CONFIG.phone,
  direccion_fisica: APP_CONFIG.address,
  horario_despacho: 'Lunes a Domingo: 8:00 AM - 9:00 PM',
  delivery_base_usd: APP_CONFIG.flatShippingRateUsd,
  delivery_gratis_minimo_usd: APP_CONFIG.freeShippingThresholdUsd,
  pago_movil_banco: 'Banesco (0134)',
  pago_movil_telefono: '0414-5738890',
  pago_movil_cedula: 'J-50123456-7',
  zelle_email: 'pagos@grancatadorbarinas.com',
  zelle_titular: 'Gran Catador LLC',
  bcv_tasa_manual: null,
  bcv_usar_manual: false,
  logo_url: '/logo-catador.svg',
  logo_alto_px: 44,
  logo_ancho_px: 200,
};

interface StoreConfigState {
  config: StoreConfig;
  isLoading: boolean;
  hasLoaded: boolean;
  fetchConfig: (force?: boolean) => Promise<void>;
  updateConfig: (patch: Partial<StoreConfig>) => Promise<StoreConfig>;
}

export const useStoreConfigStore = create<StoreConfigState>((set, get) => ({
  config: DEFAULT_STORE_CONFIG,
  isLoading: false,
  hasLoaded: false,

  fetchConfig: async (force = false) => {
    if (get().hasLoaded && !force) return;
    set({ isLoading: true });
    try {
      const data = await getStoreConfig();
      if (data) {
        set({ config: { ...DEFAULT_STORE_CONFIG, ...data }, hasLoaded: true });
      }
    } catch (err) {
      console.error('Error sincronizando store config:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateConfig: async (patch: Partial<StoreConfig>) => {
    set({ isLoading: true });
    try {
      const updated = await updateStoreConfigService(patch);
      set({ config: { ...get().config, ...updated }, hasLoaded: true });
      return updated;
    } finally {
      set({ isLoading: false });
    }
  },
}));
