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
 * Calcula la distancia vial estimada en kilómetros entre dos coordenadas GPS (Fórmula de Haversine × factor vial urbano 1.25)
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
  // Factor vial urbano en Barinas (1.25x sobre distancia lineal, mínimo 1.0 km)
  return Number(Math.max(1.0, linearKm * 1.25).toFixed(1));
}

/**
 * Información de franja tarifaria de delivery
 */
export interface DeliveryTierInfo {
  tierName: string;
  tierBadge: string;
  baseDeliveryUsd: number;
  description: string;
}

/**
 * Calcula la franja y tarifa base por distancia según las reglas oficiales de Gran Catador:
 * - Carrera corta (0 a 3 km): $1.50
 * - Carrera media (> 3 a 6 km): $2.50
 * - Carrera larga (> 6 a 9 km): $3.50
 * - Carrera extra larga (> 9 a 12 km): $4.50
 * - Carrera intermedia (> 12 a 20 km): $4.50 + $0.45 por km adicional
 * - Carrera por Km foránea (desde 20 km en adelante): $0.45 por km
 */
export function getDeliveryTierInfo(
  distanceKm: number,
  storeConfig?: Partial<StoreConfig> | null
): DeliveryTierInfo {
  const cortaUsd = Number(storeConfig?.delivery_corta_usd ?? 1.50);
  const mediaUsd = Number(storeConfig?.delivery_media_usd ?? 2.50);
  const largaUsd = Number(storeConfig?.delivery_larga_usd ?? 3.50);
  const extraLargaUsd = Number(storeConfig?.delivery_extralarga_usd ?? 4.50);
  const perKmUsd = Number(storeConfig?.delivery_por_km_usd ?? 0.45);

  if (distanceKm <= 3.0) {
    return {
      tierName: 'Carrera Corta (0 a 3 km)',
      tierBadge: 'Corta (≤3 km)',
      baseDeliveryUsd: cortaUsd,
      description: `Carrera corta en Barinas hasta 3 km ($${cortaUsd.toFixed(2)})`,
    };
  }
  if (distanceKm <= 6.0) {
    return {
      tierName: 'Carrera Media (3 a 6 km)',
      tierBadge: 'Media (3-6 km)',
      baseDeliveryUsd: mediaUsd,
      description: `Carrera media en Barinas de 3 a 6 km ($${mediaUsd.toFixed(2)})`,
    };
  }
  if (distanceKm <= 9.0) {
    return {
      tierName: 'Carrera Larga (6 a 9 km)',
      tierBadge: 'Larga (6-9 km)',
      baseDeliveryUsd: largaUsd,
      description: `Carrera larga en Barinas de 6 a 9 km ($${largaUsd.toFixed(2)})`,
    };
  }
  if (distanceKm <= 12.0) {
    return {
      tierName: 'Carrera Extra Larga (9 a 12 km)',
      tierBadge: 'Extra Larga (9-12 km)',
      baseDeliveryUsd: extraLargaUsd,
      description: `Carrera extra larga de 9 a 12 km ($${extraLargaUsd.toFixed(2)})`,
    };
  }
  if (distanceKm < 20.0) {
    const extraKm = Number((distanceKm - 12.0).toFixed(1));
    const totalUsd = Number((extraLargaUsd + extraKm * perKmUsd).toFixed(2));
    return {
      tierName: `Carrera Intermedia (${distanceKm} km)`,
      tierBadge: 'Intermedia (12-20 km)',
      baseDeliveryUsd: totalUsd,
      description: `Carrera de 12 a 20 km ($${extraLargaUsd.toFixed(2)} base + ${extraKm} km extra a $${perKmUsd.toFixed(2)}/km)`,
    };
  }

  // Desde 20 km en adelante: Carrera por Km (0.45$ / km)
  const totalKmUsd = Number((distanceKm * perKmUsd).toFixed(2));
  return {
    tierName: `Carrera Foránea (${distanceKm} km • $${perKmUsd.toFixed(2)}/km)`,
    tierBadge: 'Foránea (≥20 km)',
    baseDeliveryUsd: totalKmUsd,
    description: `Carrera foránea de larga distancia: ${distanceKm} km a $${perKmUsd.toFixed(2)}/km`,
  };
}

/**
 * Cotiza automáticamente el delivery según:
 * 1) Distancia vial desde Gran Catador hasta la ubicación GPS (o zona elegida)
 * 2) Franjas oficiales (Corta $1.50, Media $2.50, Larga $3.50, Extra Larga $4.50, Foránea $0.45/km)
 * 3) Volumen de carga: evalúa si cabe en motorizado o requiere vehículo de carga (+ recargo por mucha cantidad)
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
      tierName: 'Retiro Pick-Up',
      tierBadge: 'Pick-Up',
      detailsBreakdown: 'Retiro directo en tienda sin costo de envío',
    };
  }

  const storeLat = Number(storeConfig?.tienda_lat ?? 8.6226);
  const storeLng = Number(storeConfig?.tienda_lng ?? -70.2075);
  const maxBoxesMoto = Number(storeConfig?.delivery_max_cajas_motorizado ?? 2);
  const maxUnitsMoto = Number(storeConfig?.delivery_max_unidades_motorizado ?? 24);
  const heavyLoadSurcharge = Number(storeConfig?.delivery_recargo_vehiculo_usd ?? 3.50);

  // 1. Calcular distancia en km desde la tienda hasta el destino
  let distanceKm = 2.5;
  if (typeof userLat === 'number' && typeof userLng === 'number') {
    distanceKm = calculateDistanceKm(storeLat, storeLng, userLat, userLng);
  } else if (zonaBarinas && BARINAS_ZONE_COORDS[zonaBarinas]) {
    distanceKm = BARINAS_ZONE_COORDS[zonaBarinas].approxKm;
  }

  // 2. Obtener la franja tarifaria por distancia
  const tierInfo = getDeliveryTierInfo(distanceKm, storeConfig);

  // 3. Evaluar si supera la capacidad de un motorizado (mucha cantidad -> vehículo de carga)
  const exceedsMotoCapacity =
    explicitBoxesCount > maxBoxesMoto ||
    totalBoxesEquivalent > maxBoxesMoto ||
    totalUnitsEquivalent > maxUnitsMoto;

  const transportType = exceedsMotoCapacity ? 'vehiculo_carga' : 'motorizado';
  const appliedHeavySurcharge = exceedsMotoCapacity ? heavyLoadSurcharge : 0;

  // 4. Monto final de envío
  const shippingUsd = Number((tierInfo.baseDeliveryUsd + appliedHeavySurcharge).toFixed(2));

  // 5. Explicaciones legibles
  const reasonText = exceedsMotoCapacity
    ? `Despacho en Vehículo de Carga (${tierInfo.tierBadge} • ${totalUnitsEquivalent} und / ~${Math.ceil(totalBoxesEquivalent)} cajas • ${distanceKm} km)`
    : `${tierInfo.tierName} en Motorizado Express (${distanceKm} km)`;

  const detailsBreakdown = exceedsMotoCapacity
    ? `Tarifa distancia: $${tierInfo.baseDeliveryUsd.toFixed(2)} (${tierInfo.tierBadge}) + Recargo carga por volumen: $${appliedHeavySurcharge.toFixed(2)}`
    : `Tarifa oficial por distancia: $${tierInfo.baseDeliveryUsd.toFixed(2)} (${tierInfo.tierName})`;

  return {
    distanceKm,
    transportType,
    shippingUsd,
    baseFeeUsd: tierInfo.baseDeliveryUsd,
    distanceFeeUsd: 0,
    heavyLoadSurchargeUsd: appliedHeavySurcharge,
    isFreeShipping: shippingUsd === 0,
    totalBoxesEquivalent,
    totalUnitsEquivalent,
    reasonText,
    tierName: tierInfo.tierName,
    tierBadge: tierInfo.tierBadge,
    detailsBreakdown,
  };
}

/**
 * Genera texto formateado para enviar la cotización de delivery al cliente por WhatsApp con 1 toque
 */
export function formatDeliveryQuoteForWhatsApp(params: {
  distanceKm: number;
  shippingUsd: number;
  tierName?: string;
  transportType?: 'motorizado' | 'vehiculo_carga' | 'pickup';
  bcvRate?: number;
  zonaOrDireccion?: string;
  totalBoxes?: number;
  totalUnits?: number;
}): string {
  const {
    distanceKm,
    shippingUsd,
    tierName = 'Carrera',
    transportType = 'motorizado',
    bcvRate = 1,
    zonaOrDireccion = 'Barinas',
    totalBoxes,
    totalUnits,
  } = params;

  const vesAmount = (shippingUsd * bcvRate).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const transportLabel =
    transportType === 'vehiculo_carga'
      ? 'Camioneta / Vehículo de Carga (Pedido de Mayor Volumen)'
      : 'Motorizado Express';

  let msg = `*Cotización de Delivery - Gran Catador*\n`;
  msg += `*Destino:* ${zonaOrDireccion} (~${distanceKm} km)\n`;
  msg += `*Tipo:* ${tierName}\n`;
  msg += `*Transporte:* ${transportLabel}\n`;
  if (totalBoxes && totalBoxes > 0) {
    msg += `*Carga:* ${totalUnits || Math.ceil(totalBoxes * 12)} und (~${Math.ceil(totalBoxes)} cajas)\n`;
  }
  msg += `*Monto:* $${shippingUsd.toFixed(2)} USD (Bs. ${vesAmount} BCV)\n`;
  msg += `*Tiempo estimado de entrega:* 25 a 45 minutos tras verificar su pago.`;
  return msg;
}
