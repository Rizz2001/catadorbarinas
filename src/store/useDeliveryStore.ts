'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedProfileLocationInput {
  userId?: string | null;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
}

interface DeliveryState {
  deliveryType: 'delivery' | 'pickup';
  direccion: string;
  zonaBarinas: string;
  latitud: number | null;
  longitud: number | null;
  lastSavedSource: 'none' | 'profile' | 'manual' | 'gps';
  syncedUserId: string | null;
  setDeliveryType: (type: 'delivery' | 'pickup') => void;
  setManualAddress: (direccion: string) => void;
  setZoneWithFallbackCoords: (zonaBarinas: string, fallbackLat?: number | null, fallbackLng?: number | null) => void;
  setGpsLocation: (lat: number, lng: number, autoAddressIfEmpty?: string) => void;
  clearGpsLocation: () => void;
  hydrateFromProfile: (input: SavedProfileLocationInput) => void;
  applyProfileSavedLocation: (input: SavedProfileLocationInput) => void;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set, get) => ({
      deliveryType: 'delivery',
      direccion: '',
      zonaBarinas: 'Alto Barinas Norte',
      latitud: null,
      longitud: null,
      lastSavedSource: 'none',
      syncedUserId: null,

      setDeliveryType: (deliveryType) => set({ deliveryType }),

      setManualAddress: (direccion) =>
        set({
          direccion,
          lastSavedSource: direccion.trim() ? 'manual' : get().lastSavedSource,
        }),

      setZoneWithFallbackCoords: (zonaBarinas, fallbackLat = null, fallbackLng = null) =>
        set((state) => ({
          zonaBarinas,
          latitud: fallbackLat ?? state.latitud,
          longitud: fallbackLng ?? state.longitud,
        })),

      setGpsLocation: (lat, lng, autoAddressIfEmpty) =>
        set((state) => ({
          latitud: lat,
          longitud: lng,
          direccion: state.direccion.trim()
            ? state.direccion
            : autoAddressIfEmpty || state.direccion,
          lastSavedSource: 'gps',
        })),

      clearGpsLocation: () => set({ latitud: null, longitud: null }),

      hydrateFromProfile: ({ userId, direccion, latitud, longitud }) => {
        const state = get();
        const cleanProfileAddress = (direccion || '').trim();
        const hasProfileCoords = typeof latitud === 'number' && typeof longitud === 'number';
        const hasChangedUser = Boolean(userId && state.syncedUserId && state.syncedUserId !== userId);

        if (!cleanProfileAddress && !hasProfileCoords) {
          if (hasChangedUser) {
            set({
              direccion: '',
              latitud: null,
              longitud: null,
              lastSavedSource: 'none',
              syncedUserId: userId || null,
            });
          }
          return;
        }

        const shouldFillAddress = hasChangedUser || !state.direccion.trim();
        const shouldFillCoords =
          hasChangedUser || (state.latitud === null && state.longitud === null);

        set({
          direccion: shouldFillAddress && cleanProfileAddress ? cleanProfileAddress : state.direccion,
          latitud: shouldFillCoords && hasProfileCoords ? latitud! : state.latitud,
          longitud: shouldFillCoords && hasProfileCoords ? longitud! : state.longitud,
          lastSavedSource:
            shouldFillAddress && cleanProfileAddress ? 'profile' : state.lastSavedSource,
          syncedUserId: userId || state.syncedUserId,
        });
      },

      applyProfileSavedLocation: ({ userId, direccion, latitud, longitud }) => {
        const cleanAddress = (direccion || '').trim();
        const hasCoords = typeof latitud === 'number' && typeof longitud === 'number';
        set({
          direccion: cleanAddress,
          latitud: hasCoords ? latitud! : null,
          longitud: hasCoords ? longitud! : null,
          lastSavedSource: cleanAddress || hasCoords ? 'profile' : 'none',
          syncedUserId: userId || null,
        });
      },
    }),
    {
      name: 'gran-catador-delivery',
    }
  )
);

