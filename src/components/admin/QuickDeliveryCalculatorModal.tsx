'use client';

import React, { useState, useMemo } from 'react';
import { X, Bike, Truck, Copy, Check, MessageCircle } from 'lucide-react';
import { BARINAS_ZONE_COORDS, getDeliveryTierInfo, calculateDistanceKm, formatDeliveryQuoteForWhatsApp } from '@/lib/delivery';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useBcvStore } from '@/store/useBcvStore';
import { formatUsd, formatVes } from '@/lib/currency';

interface QuickDeliveryCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ZONAS = Object.entries(BARINAS_ZONE_COORDS);

export function QuickDeliveryCalculatorModal({ isOpen, onClose }: QuickDeliveryCalculatorModalProps) {
  const storeConfig = useStoreConfigStore((state) => state.config);
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);

  const [inputMode, setInputMode] = useState<'zona' | 'km' | 'gps'>('zona');
  const [selectedZona, setSelectedZona] = useState<string>('Alto Barinas Norte');
  const [manualKm, setManualKm] = useState<number>(4.2);
  const [customerLat, setCustomerLat] = useState<string>('');
  const [customerLng, setCustomerLng] = useState<string>('');
  const [isHeavyLoad, setIsHeavyLoad] = useState<boolean>(false);
  const [boxCount, setBoxCount] = useState<number>(0);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Distancia calculada
  const distanceKm = useMemo(() => {
    if (inputMode === 'zona') {
      return BARINAS_ZONE_COORDS[selectedZona]?.approxKm ?? 3.5;
    }
    if (inputMode === 'km') {
      return Math.max(0.5, manualKm || 1.0);
    }
    if (inputMode === 'gps') {
      const lat = parseFloat(customerLat);
      const lng = parseFloat(customerLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const storeLat = Number(storeConfig?.tienda_lat ?? 8.6226);
        const storeLng = Number(storeConfig?.tienda_lng ?? -70.2075);
        return calculateDistanceKm(storeLat, storeLng, lat, lng);
      }
    }
    return 3.5;
  }, [inputMode, selectedZona, manualKm, customerLat, customerLng, storeConfig]);

  // Cotización calculada
  const quote = useMemo(() => {
    const tierInfo = getDeliveryTierInfo(distanceKm, storeConfig);
    const heavySurcharge = isHeavyLoad ? Number(storeConfig?.delivery_recargo_vehiculo_usd ?? 3.50) : 0;
    const totalUsd = Number((tierInfo.baseDeliveryUsd + heavySurcharge).toFixed(2));
    const totalVes = Number((totalUsd * bcvRate).toFixed(2));
    const transportType: 'motorizado' | 'vehiculo_carga' = isHeavyLoad ? 'vehiculo_carga' : 'motorizado';

    return {
      distanceKm,
      tierInfo,
      heavySurcharge,
      totalUsd,
      totalVes,
      transportType,
    };
  }, [distanceKm, storeConfig, isHeavyLoad, bcvRate]);

  // Texto para WhatsApp
  const whatsappMessage = useMemo(() => {
    const destinationName =
      inputMode === 'zona'
        ? selectedZona
        : inputMode === 'gps'
          ? `Coordenadas (${customerLat}, ${customerLng})`
          : `Dirección indicada (~${distanceKm} km)`;

    return formatDeliveryQuoteForWhatsApp({
      distanceKm,
      shippingUsd: quote.totalUsd,
      tierName: quote.tierInfo.tierName,
      transportType: quote.transportType,
      bcvRate,
      zonaOrDireccion: destinationName,
      totalBoxes: boxCount > 0 ? boxCount : undefined,
    });
  }, [inputMode, selectedZona, customerLat, customerLng, distanceKm, quote, bcvRate, boxCount]);

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(whatsappMessage);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-catador-blue px-4 py-3.5 text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10">
              <Bike className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide">Cotizador Rápido de Delivery</h2>
              <p className="text-[11px] text-blue-100">Calcula la tarifa oficial de Barinas y pásala al cliente</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-blue-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Selector de modo de cálculo */}
          <div>
            <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wider mb-1.5">
              Método de Ubicación del Destino
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setInputMode('zona')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  inputMode === 'zona'
                    ? 'border-catador-blue bg-blue-50 text-catador-blue shadow-2xs font-black'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Por Zona
              </button>
              <button
                type="button"
                onClick={() => setInputMode('km')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  inputMode === 'km'
                    ? 'border-catador-blue bg-blue-50 text-catador-blue shadow-2xs font-black'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Distancia (Km)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('gps')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  inputMode === 'gps'
                    ? 'border-catador-blue bg-blue-50 text-catador-blue shadow-2xs font-black'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Coordenadas GPS
              </button>
            </div>
          </div>

          {/* Input según modo */}
          {inputMode === 'zona' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Zona o Sector en Barinas</label>
              <select
                value={selectedZona}
                onChange={(e) => setSelectedZona(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 bg-white"
              >
                {ZONAS.map(([name, data]) => (
                  <option key={name} value={name}>
                    {name} (~{data.approxKm} km)
                  </option>
                ))}
              </select>
            </div>
          )}

          {inputMode === 'km' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Distancia estimada en Kilómetros (Km)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="100"
                  value={manualKm}
                  onChange={(e) => setManualKm(parseFloat(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-black text-slate-900"
                />
                <span className="font-bold text-slate-500 shrink-0">km</span>
              </div>
            </div>
          )}

          {inputMode === 'gps' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Latitud Cliente</label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="Ej: 8.6135"
                  value={customerLat}
                  onChange={(e) => setCustomerLat(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Longitud Cliente</label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="Ej: -70.2412"
                  value={customerLng}
                  onChange={(e) => setCustomerLng(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Tipo de Carga / Volumen */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
            <span className="block font-black text-slate-800 text-xs">
              ¿Lleva mucha cantidad o cajas cerradas?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsHeavyLoad(false);
                  setBoxCount(0);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  !isHeavyLoad
                    ? 'border-catador-blue bg-white text-catador-blue ring-2 ring-catador-blue/20'
                    : 'border-slate-200 bg-white/60 text-slate-600'
                }`}
              >
                <Bike className="h-4 w-4 shrink-0 text-catador-blue" />
                <div>
                  <span className="font-extrabold block text-xs">Motorizado Express</span>
                  <span className="text-[10px] text-slate-500 block">Hasta 2 cajas o 24 botellas</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsHeavyLoad(true)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  isHeavyLoad
                    ? 'border-amber-500 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white/60 text-slate-600'
                }`}
              >
                <Truck className="h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <span className="font-extrabold block text-xs">Vehículo de Carga (+${storeConfig?.delivery_recargo_vehiculo_usd ?? 3.50})</span>
                  <span className="text-[10px] text-slate-500 block">3+ cajas o carga pesada</span>
                </div>
              </button>
            </div>

            {isHeavyLoad && (
              <div className="pt-1 flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-700 shrink-0">Cantidad de Cajas aproximadas:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={boxCount || 3}
                  onChange={(e) => setBoxCount(parseInt(e.target.value, 10) || 1)}
                  className="w-20 rounded-lg border border-slate-200 p-1 text-center font-black text-xs bg-white"
                />
              </div>
            )}
          </div>

          {/* Resultado de la Cotización */}
          <div className="rounded-2xl border-2 border-catador-blue/20 bg-linear-to-br from-blue-50/60 to-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-catador-blue block">
                  {quote.tierInfo.tierBadge} • {quote.transportType === 'vehiculo_carga' ? 'Vehículo de Carga' : 'Motorizado'}
                </span>
                <span className="text-sm font-extrabold text-slate-900">{quote.tierInfo.tierName}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Distancia: <strong>{quote.distanceKm} km</strong> desde sede Gran Catador
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-catador-blue block">{formatUsd(quote.totalUsd)}</span>
                <span className="text-xs font-bold text-slate-600 block">{formatVes(quote.totalVes)}</span>
              </div>
            </div>

            {quote.heavySurcharge > 0 && (
              <p className="text-[10px] text-amber-800 bg-amber-50 rounded-lg p-1.5 border border-amber-200 font-medium">
                🚚 Incluye tarifa base ${quote.tierInfo.baseDeliveryUsd.toFixed(2)} + Recargo de vehículo de carga ${quote.heavySurcharge.toFixed(2)} por volumen.
              </p>
            )}
          </div>

          {/* Teléfono opcional del cliente para enviar directo a su WhatsApp */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Teléfono del Cliente (Opcional, para abrir chat directo):
            </label>
            <input
              type="tel"
              placeholder="Ej: 04141234567 o 584141234567"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900"
            />
          </div>
        </div>

        {/* Acciones de pie */}
        <div className="border-t border-slate-100 bg-slate-50 p-3.5 flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:flex-1 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>¡Copiado al Portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copiar Cotización para WhatsApp</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full sm:flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Abrir en WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
