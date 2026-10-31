import { CartItem, DeliveryQuoteResult, StoreConfig } from '@/types';
import { getUnitsPerPurchaseMode } from './inventory';

/**
 * Coordenadas referenciales de las zonas de Barinas (en caso de selección manual sin GPS)
 */
export const BARINAS_ZONE_COORDS: Record<string, { lat: number; lng: number; approxKm: number }> = {
  'Alto Barinas Norte': { lat: 8.6135, lng: -70.2412, approxKm: 4.2 },
  'Alto Barinas Sur': { lat: 8.5988, lng: -70.2385, approxKm: 4.8 },
  'Centro / Casco Histórico': { lat: 8.6226, lng: -70.2075, approxKm: 1.5 },
  'Barinas II / Ciudad Tavacare': { lat: 8.5812, lng: -70.2640, approxKm: 7.5 },
  'Don Samuel / Los Pozones': { lat: 8.6042, lng: -70.1940, approxKm: 3.6 },
  'La Cinqueña (I, II, III)': { lat: 8.6190, lng: -70.2210, approxKm: 2.5 },
  'El Cambio / La Carolina': { lat: 8.6285, lng: -70.2145, approxKm: 2.2 },
  'Llano Alto / Palma de Oro': { lat: 8.6060, lng: -70.2530, approxKm: 5.8 },
  'Punta Gorda / Troncal 5': { lat: 8.5740, lng: -70.1810, approxKm: 6.8 },
  'Otra zona (Barinas)': { lat: 8.6110, lng: -70.2250, approxKm: 4.5 },
};

/**
 * Calcula la distancia vial estimada en kilómetros entre dos coordenadas GPS (Fórmula de Haversine × factor urbano 1.25)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const linearKm = R * c;
  // Factor de ruta vial urbana en Barinas (1.25x sobre distancia lineal, mínimo 1.0 km)
  return Number(Math.max(1.0, linearKm * 1.25).toFixed(1));
}

/**
 * Cotiza automáticamente el delivery según:
 * 1) Ubicación GPS del cliente (o zona seleccionada en Barinas)
 * 2) Volumen de carga (Cajas y Unidades totales): determina si lo lleva un Motorizado o requiere Vehículo de Carga.
 * 3) Parámetros configurados por el administrador en el CMS (`StoreConfig`).
 */
export function calculateSmartDeliveryQuote(params: {
  items: CartItem[];
  subtotalUsd: number;
  deliveryType: 'delivery' | 'pickup';
  userLat?: number | null;
  userLng?: number | null;
  zonaBarinas?: string;
  storeConfig?: StoreConfig | null;
}): DeliveryQuoteResult {
  const {
    items,
    subtotalUsd,
    deliveryType,
    userLat,
    userLng,
    zonaBarinas,
    storeConfig,
  } = params;

  // Calcular volumen total en unidades y equivalente en cajas
  let totalUnitsEquivalent = 0;
  let explicitBoxesCount = 0;

  items.forEach((item) => {
    const mode = item.purchaseMode || 'unidad';
    const units = getUnitsPerPurchaseMode(item.product, mode) * item.quantity;
    totalUnitsEquivalent += units;
    if (mode === 'caja') {
      explicitBoxesCount += item.quantity;
    }
  });

  const totalBoxesEquivalent = Number(
    Math.max(explicitBoxesCount, totalUnitsEquivalent / 12).toFixed(1)
  );

  if (deliveryType === 'pickup' || items.length === 0) {
    return {
      distanceKm: 0,
      transportType: 'pickup',
      shippingUsd: 0,
      baseFeeUsd: 0,
      distanceFeeUsd: 0,
      heavyLoadSurchargeUsd: 0,
      isFreeShipping: true,
      totalBoxesEquivalent,
      totalUnitsEquivalent,
      reasonText: 'Retiro Pick-Up en sede Gran Catador (Sin costo de envío)',
    };
  }

  const storeLat = Number(storeConfig?.tienda_lat ?? 8.6226);
  const storeLng = Number(storeConfig?.tienda_lng ?? -70.2075);
  const baseFeeUsd = Number(storeConfig?.delivery_base_usd ?? 2.0);
  const perKmUsd = Number(storeConfig?.delivery_por_km_usd ?? 0.45);
  const freeMinUsd = Number(storeConfig?.delivery_gratis_minimo_usd ?? 30.0);
  const maxBoxesMoto = Number(storeConfig?.delivery_max_cajas_motorizado ?? 2);
  const maxUnitsMoto = Number(storeConfig?.delivery_max_unidades_motorizado ?? 24);
  const heavyLoadSurcharge = Number(storeConfig?.delivery_recargo_vehiculo_usd ?? 3.5);

  // Calcular distancia en km
  let distanceKm = 2.5;
  if (typeof userLat === 'number' && typeof userLng === 'number') {
    distanceKm = calculateDistanceKm(storeLat, storeLng, userLat, userLng);
  } else if (zonaBarinas && BARINAS_ZONE_COORDS[zonaBarinas]) {
    distanceKm = BARINAS_ZONE_COORDS[zonaBarinas].approxKm;
  }

  // Evaluar si requiere vehículo de carga por volumen (más cajas o botellas de las que lleva un motorizado)
  const exceedsMotoCapacity =
    explicitBoxesCount > maxBoxesMoto ||
    totalBoxesEquivalent > maxBoxesMoto ||
    totalUnitsEquivalent > maxUnitsMoto;

  const transportType = exceedsMotoCapacity ? 'vehiculo_carga' : 'motorizado';

  // Los primeros 2 km están incluidos en la tarifa base; kilómetros adicionales suman perKmUsd
  const extraKm = Math.max(0, distanceKm - 2.0);
  const distanceFeeUsd = Number((extraKm * perKmUsd).toFixed(2));
  const appliedHeavySurcharge = exceedsMotoCapacity ? heavyLoadSurcharge : 0;

  // Si supera el mínimo de envío gratis, el envío base en motorizado es gratis,
  // pero si es carga pesada (varias cajas) o distancia extra larga (>5km), mantiene el recargo logístico de carga
  const qualifiesBaseFree = subtotalUsd >= freeMinUsd;
  let shippingUsd = 0;

  if (qualifiesBaseFree && !exceedsMotoCapacity && distanceKm <= 6.0) {
    shippingUsd = 0;
  } else if (qualifiesBaseFree && exceedsMotoCapacity) {
    shippingUsd = Number((appliedHeavySurcharge + distanceFeeUsd * 0.5).toFixed(2));
  } else {
    shippingUsd = Number((baseFeeUsd + distanceFeeUsd + appliedHeavySurcharge).toFixed(2));
  }

  const reasonText = exceedsMotoCapacity
    ? `Despacho en Vehículo de Carga (${totalUnitsEquivalent} und / ~${Math.ceil(totalBoxesEquivalent)} cajas • ${distanceKm} km)`
    : shippingUsd === 0
      ? `Delivery Motorizado Gratis (${distanceKm} km)`
      : `Delivery en Motorizado Express (${distanceKm} km)`;

  return {
    distanceKm,
    transportType,
    shippingUsd,
    baseFeeUsd,
    distanceFeeUsd,
    heavyLoadSurchargeUsd: appliedHeavySurcharge,
    isFreeShipping: shippingUsd === 0,
    totalBoxesEquivalent,
    totalUnitsEquivalent,
    reasonText,
  };
}

