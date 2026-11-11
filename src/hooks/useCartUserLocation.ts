'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useDeliveryStore } from '@/store/useDeliveryStore';

export interface CartUserLocation {
  latitud?: number | null;
  longitud?: number | null;
  direccion?: string | null;
}

/**
 * Sincroniza sesión del usuario y carga automáticamente su dirección y GPS guardados
 * desde el perfil (o su pedido anterior) hacia el estado compartido del carrito.
 */
export function useCartUserLocation(activeTrigger: boolean = true) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileAddress, setProfileAddress] = useState<string | null>(null);

  const deliveryType = useDeliveryStore((s) => s.deliveryType);
  const direccion = useDeliveryStore((s) => s.direccion);
  const zonaBarinas = useDeliveryStore((s) => s.zonaBarinas);
  const latitud = useDeliveryStore((s) => s.latitud);
  const longitud = useDeliveryStore((s) => s.longitud);
  const hydrateFromProfile = useDeliveryStore((s) => s.hydrateFromProfile);

  useEffect(() => {
    if (!activeTrigger) return;
    let active = true;

    async function loadSessionAndProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!active) return;

        setIsAuthenticated(Boolean(user));
        setUserId(user?.id ?? null);
        if (!user) return;

        const { data: perfil } = await supabase
          .from('perfiles')
          .select('latitud, longitud, direccion')
          .eq('id', user.id)
          .single();

        let savedDireccion = perfil?.direccion?.trim() || '';
        let savedLat = typeof perfil?.latitud === 'number' ? perfil.latitud : null;
        let savedLng = typeof perfil?.longitud === 'number' ? perfil.longitud : null;

        if (!savedDireccion && savedLat === null) {
          const { data: lastOrder } = await supabase
            .from('pedidos')
            .select('direccion_entrega, latitud_entrega, longitud_entrega')
            .eq('usuario_id', user.id)
            .eq('tipo_entrega', 'delivery')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (lastOrder) {
            savedDireccion = lastOrder.direccion_entrega?.trim() || '';
            savedLat = typeof lastOrder.latitud_entrega === 'number' ? lastOrder.latitud_entrega : null;
            savedLng = typeof lastOrder.longitud_entrega === 'number' ? lastOrder.longitud_entrega : null;
          }
        }

        if (!active) return;
        setProfileAddress(savedDireccion || null);
        hydrateFromProfile({
          userId: user.id,
          direccion: savedDireccion || null,
          latitud: savedLat,
          longitud: savedLng,
        });
      } catch {
        if (active) setIsAuthenticated(false);
      }
    }

    void loadSessionAndProfile();
    return () => {
      active = false;
    };
  }, [activeTrigger, hydrateFromProfile]);

  return {
    isAuthenticated,
    userId,
    profileAddress,
    userLocation: {
      direccion: direccion || null,
      latitud,
      longitud,
      zonaBarinas,
      deliveryType,
    },
  };
}

