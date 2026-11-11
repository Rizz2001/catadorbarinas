'use client';

import Link from 'next/link';
import { Crosshair, Loader2, MapPin, Store, Truck, CheckCircle2 } from 'lucide-react';
import { BARINAS_ZONE_COORDS } from '@/lib/delivery';
import { useGpsLocator } from '@/hooks/useGpsLocator';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { cn } from '@/lib/utils';

const ZONAS_BARINAS = Object.keys(BARINAS_ZONE_COORDS);

interface CartDeliveryAddressBoxProps {
  isAuthenticated: boolean;
  profileAddress?: string | null;
  variant?: 'drawer' | 'page';
  onNavigate?: () => void;
}

export function CartDeliveryAddressBox({
  isAuthenticated,
  profileAddress,
  variant = 'page',
  onNavigate,
}: CartDeliveryAddressBoxProps) {
  const storeConfig = useStoreConfigStore((s) => s.config);
  const deliveryType = useDeliveryStore((s) => s.deliveryType);
  const direccion = useDeliveryStore((s) => s.direccion);
  const zonaBarinas = useDeliveryStore((s) => s.zonaBarinas);
  const latitud = useDeliveryStore((s) => s.latitud);
  const longitud = useDeliveryStore((s) => s.longitud);

  const setDeliveryType = useDeliveryStore((s) => s.setDeliveryType);
  const setManualAddress = useDeliveryStore((s) => s.setManualAddress);
  const setZoneWithFallbackCoords = useDeliveryStore((s) => s.setZoneWithFallbackCoords);
  const setGpsLocation = useDeliveryStore((s) => s.setGpsLocation);

  const { locatingGps, gpsStatus, detectGps } = useGpsLocator((lat, lng) => {
    setGpsLocation(lat, lng, `Ubicación GPS (${lat}, ${lng})`);
  });

  const isSavedFromProfile = Boolean(
    profileAddress && direccion.trim() && direccion.trim() === profileAddress.trim()
  );
  const hasGps = typeof latitud === 'number' && typeof longitud === 'number';
  const storeAddress = storeConfig?.direccion_fisica || 'C.C. Ciudad Catador Local N1';

  return (
    <div
      id={variant === 'page' ? 'cotizar-delivery' : undefined}
      className={cn(
        'space-y-2.5 border-b border-gray-100',
        variant === 'drawer' ? 'pb-3' : 'pb-4'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          role="radiogroup"
          aria-label="Modalidad de entrega"
          className="grid grid-cols-2 rounded-lg bg-slate-100 p-0.5 flex-1 max-w-[230px]"
        >
          <button
            type="button"
            role="radio"
            aria-checked={deliveryType === 'delivery'}
            onClick={() => setDeliveryType('delivery')}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
              deliveryType === 'delivery'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Truck className="h-3.5 w-3.5" />
            <span>Delivery</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={deliveryType === 'pickup'}
            onClick={() => setDeliveryType('pickup')}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
              deliveryType === 'pickup'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Store className="h-3.5 w-3.5" />
            <span>Retiro Gratis</span>
          </button>
        </div>

        {isAuthenticated && (
          <Link
            href="/cuenta?tab=perfil"
            onClick={onNavigate}
            className="text-xs font-semibold text-catador-blue hover:underline shrink-0"
          >
            {profileAddress ? 'Editar perfil' : 'Guardar en perfil'}
          </Link>
        )}
      </div>

      {deliveryType === 'pickup' ? (
        <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
          <Store className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Retiro en {storeAddress} · Gratis</span>
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Dirección de entrega</span>
            </span>
            {isSavedFromProfile && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                De tu perfil
              </span>
            )}
          </div>

          <input
            type="text"
            value={direccion}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="Coloca tu dirección o guárdala en tu perfil"
            aria-label="Dirección de entrega guardada"
            className="w-full min-h-[40px] rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-base sm:text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/15"
          />

          <div className="flex items-center gap-2">
            <select
              value={zonaBarinas}
              onChange={(e) => {
                const z = e.target.value;
                const coords = BARINAS_ZONE_COORDS[z];
                setZoneWithFallbackCoords(z, coords?.lat ?? null, coords?.lng ?? null);
              }}
              aria-label="Sector de Barinas"
              className="flex-1 min-w-0 min-h-[38px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 transition-colors focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/15"
            >
              {ZONAS_BARINAS.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={detectGps}
              disabled={locatingGps}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-slate-50 hover:bg-slate-100 px-3 min-h-[38px] text-xs font-semibold text-catador-blue transition-colors cursor-pointer shrink-0"
            >
              {locatingGps ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Crosshair className="h-3.5 w-3.5" />
              )}
              <span>{hasGps ? 'Recotizar delivery' : 'Cotizar delivery'}</span>
            </button>
          </div>

          {gpsStatus && (
            <p className="text-[11px] font-medium text-emerald-700">{gpsStatus}</p>
          )}
        </div>
      )}
    </div>
  );
}

