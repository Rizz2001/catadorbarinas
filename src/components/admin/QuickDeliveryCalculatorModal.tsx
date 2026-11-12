'use client';

import { useState, useMemo } from 'react';
import { Bike, Truck, Copy, Check, MessageCircle } from 'lucide-react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Button } from '@astryxdesign/core/Button';
import { useToast } from '@astryxdesign/core/Toast';
import {
  BARINAS_ZONE_COORDS,
  getDeliveryTierInfo,
  calculateDistanceKm,
  formatDeliveryQuoteForWhatsApp,
} from '@/lib/delivery';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useBcvStore } from '@/store/useBcvStore';
import { formatUsd, formatVes } from '@/lib/currency';

interface QuickDeliveryCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ZONAS = Object.entries(BARINAS_ZONE_COORDS);

export function QuickDeliveryCalculatorModal({
  isOpen,
  onClose,
}: QuickDeliveryCalculatorModalProps) {
  const storeConfig = useStoreConfigStore((state) => state.config);
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const showToast = useToast();

  const [inputMode, setInputMode] = useState<'zona' | 'km' | 'gps'>('zona');
  const [selectedZona, setSelectedZona] = useState<string>('Alto Barinas Norte');
  const [manualKm, setManualKm] = useState<number>(4.2);
  const [customerLat, setCustomerLat] = useState<string>('');
  const [customerLng, setCustomerLng] = useState<string>('');
  const [isHeavyLoad, setIsHeavyLoad] = useState<boolean>(false);
  const [boxCount, setBoxCount] = useState<number>(0);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

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

  const quote = useMemo(() => {
    const tierInfo = getDeliveryTierInfo(distanceKm, storeConfig);
    const heavySurcharge = isHeavyLoad
      ? Number(storeConfig?.delivery_recargo_vehiculo_usd ?? 3.5)
      : 0;
    const totalUsd = Number((tierInfo.baseDeliveryUsd + heavySurcharge).toFixed(2));
    const totalVes = Number((totalUsd * bcvRate).toFixed(2));
    const transportType: 'motorizado' | 'vehiculo_carga' = isHeavyLoad
      ? 'vehiculo_carga'
      : 'motorizado';

    return {
      distanceKm,
      tierInfo,
      heavySurcharge,
      totalUsd,
      totalVes,
      transportType,
    };
  }, [distanceKm, storeConfig, isHeavyLoad, bcvRate]);

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
    showToast({ body: 'Cotización copiada para pegar en WhatsApp.' });
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

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      width={540}
      purpose="info"
    >
      <Layout
        height="fill"
        header={
          <DialogHeader
            title="Cotizador Rápido de Delivery"
            subtitle="Calcula la tarifa oficial de Barinas y compártela al cliente"
            onOpenChange={(open) => {
              if (!open) onClose();
            }}
            hasDivider
          />
        }
        content={
          <LayoutContent className="space-y-4 text-xs">
            {/* Selector de modo con Astryx SegmentedControl */}
            <div>
              <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wider mb-1.5">
                Método de Ubicación del Destino
              </label>
              <SegmentedControl
                layout="fill"
                label="Método de Ubicación"
                value={inputMode}
                onChange={(val) => setInputMode(val as 'zona' | 'km' | 'gps')}
              >
                <SegmentedControlItem value="zona" label="Por Zona" />
                <SegmentedControlItem value="km" label="Distancia (Km)" />
                <SegmentedControlItem value="gps" label="Coordenadas GPS" />
              </SegmentedControl>
            </div>

            {inputMode === 'zona' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Zona o Sector en Barinas
                </label>
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
                <label className="block font-bold text-slate-700 mb-1">
                  Distancia estimada en Kilómetros (Km)
                </label>
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
                  <Bike className="h-4 w-4 shrink-0 text-catador-blue" strokeWidth={1.5}/>
                  <div>
                    <span className="font-extrabold block text-xs">Motorizado Express</span>
                    <span className="text-[10px] text-slate-500 block">
                      Hasta 2 cajas o 24 botellas
                    </span>
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
                  <Truck className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={1.5}/>
                  <div>
                    <span className="font-extrabold block text-xs">
                      Vehículo de Carga (+$
                      {storeConfig?.delivery_recargo_vehiculo_usd ?? 3.5})
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      3+ cajas o carga pesada
                    </span>
                  </div>
                </button>
              </div>

              {isHeavyLoad && (
                <div className="pt-1 flex items-center gap-2">
                  <label className="text-[11px] font-bold text-slate-700 shrink-0">
                    Cantidad de Cajas aproximadas:
                  </label>
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
                    {quote.tierInfo.tierBadge} •{' '}
                    {quote.transportType === 'vehiculo_carga' ? 'Vehículo de Carga' : 'Motorizado'}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {quote.tierInfo.tierName}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Distancia: <strong>{quote.distanceKm} km</strong> desde sede El Catador
                  </span>
                </div>
                <div className="text-right tabular-nums">
                  <span className="text-xl font-black text-catador-blue block">
                    {formatUsd(quote.totalUsd)}
                  </span>
                  <span className="text-xs font-bold text-slate-600 block">
                    {formatVes(quote.totalVes)}
                  </span>
                </div>
              </div>

              {quote.heavySurcharge > 0 && (
                <p className="text-[10px] text-amber-800 bg-amber-50 rounded-lg p-1.5 border border-amber-200 font-medium">
                  Incluye tarifa base ${quote.tierInfo.baseDeliveryUsd.toFixed(2)} + Recargo de
                  vehículo de carga ${quote.heavySurcharge.toFixed(2)} por volumen.
                </p>
              )}
            </div>

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
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <Button
                label={copied ? '¡Copiado!' : 'Copiar Cotización'}
                variant="secondary"
                width="100%"
                icon={
                  copied ? (
                    <Check className="h-4 w-4 text-emerald-600" strokeWidth={1.5}/>
                  ) : (
                    <Copy className="h-4 w-4" strokeWidth={1.5}/>
                  )
                }
                onClick={handleCopy}
              />
              <Button
                label="Abrir en WhatsApp"
                variant="primary"
                width="100%"
                icon={<MessageCircle className="h-4 w-4" strokeWidth={1.5}/>}
                onClick={handleOpenWhatsApp}
              />
            </div>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
