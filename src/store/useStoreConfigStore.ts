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
  delivery_base_usd: 1.5,
  delivery_corta_usd: 1.5,
  delivery_media_usd: 2.5,
  delivery_larga_usd: 3.5,
  delivery_extralarga_usd: 4.5,
  delivery_por_km_usd: 0.45,
  delivery_max_cajas_motorizado: 2,
  delivery_max_unidades_motorizado: 24,
  delivery_recargo_vehiculo_usd: 3.5,
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
  catalogo_titulo: 'Catálogo General Bodegón',
  catalogo_subtitulo: 'Inventario en tiempo real sincronizado con precios oficiales en $ USD y Bs. BCV',
  seccion_confianza_activa: true,
  metricas_confianza: [
    {
      figura: '< 45 min',
      titulo: 'Despacho Express en Barinas',
      subtitulo: 'Alto Barinas, Centro, Palma Sola y Varyná en motorizado o carga',
    },
    {
      figura: 'Tasa BCV',
      titulo: 'Cotización Bimonetaria Exacta',
      subtitulo: 'Precios sincronizados al día en Dólares ($ USD) y Bolívares',
    },
    {
      figura: 'Stock Garantizado',
      titulo: 'Inventario Real por Unidad o Caja',
      subtitulo: 'Licores con precinto oficial y víveres directo de nuestro almacén',
    },
    {
      figura: 'Bs. / $ USD',
      titulo: 'Pago Móvil, Zelle y Efectivo',
      subtitulo: 'Verificación inmediata y atención directa en nuestro Chat en Vivo',
    },
  ],
  footer_descripcion:
    'Distribuidora y bodegón en Barinas con venta al detal por unidad y al mayor por caja cerrada con despacho express.',
  footer_transparencia_texto:
    'Todos nuestros precios están expresados en Dólares ($ USD) y Bolívares (Bs. / VES) calculados a la tasa oficial vigente del Banco Central de Venezuela (BCV).',
  footer_subdireccion: 'Av. 23 de Enero • Barinas, Estado Barinas, Venezuela',
  footer_garantias: [
    {
      figura: 'Gratis desde $30',
      titulo: 'Delivery en Barinas',
      subtitulo: 'Cotización automática por GPS y volumen',
    },
    {
      figura: '100% Original',
      titulo: 'Precinto Oficial',
      subtitulo: 'Licores importados y despensa garantizada',
    },
    {
      figura: 'Bs. BCV / $ USD',
      titulo: 'Pagos Bimonetarios',
      subtitulo: 'Pago Móvil, Zelle y Efectivo Divisas',
    },
    {
      figura: 'Sala en Vivo',
      titulo: 'Atención Directa',
      subtitulo: 'Chat en tiempo real en cada pedido',
    },
  ],
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
