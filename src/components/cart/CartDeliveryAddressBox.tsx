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
        'rounded-2xl border border-slate-200 bg-[#F7F8FA] space-y-2.5',
        variant === 'drawer' ? 'p-3' : 'p-3.5'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-full bg-white p-0.5 border border-slate-200">
          <button
            type="button"
            onClick={() => setDeliveryType('delivery')}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer',
              deliveryType === 'delivery'
                ? 'bg-catador-blue text-white'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Truck className="h-3 w-3" />
            <span>Delivery</span>
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType('pickup')}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer',
              deliveryType === 'pickup'
                ? 'bg-catador-blue text-white'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Store className="h-3 w-3" />
            <span>Retiro Gratis</span>
          </button>
        </div>

        {isAuthenticated && (
          <Link
            href="/cuenta?tab=perfil"
            onClick={onNavigate}
            className="text-[11px] font-extrabold text-catador-blue hover:underline shrink-0"
          >
            {profileAddress ? 'Editar perfil' : 'Guardar en perfil'}
          </Link>
        )}
      </div>

      {deliveryType === 'pickup' ? (
        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 px-1">
          <Store className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Retiro en {storeAddress} · Gratis</span>
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-catador-blue shrink-0" />
              <span>Dirección de entrega</span>
            </span>
            {isSavedFromProfile && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                <CheckCircle2 className="h-2.5 w-2.5" />
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
            className="w-full min-h-[38px] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue"
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
              className="flex-1 min-w-0 min-h-[36px] rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-catador-blue"
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
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-catador-amber-soft hover:bg-[#FDE68A] border border-catador-amber-oak/70 px-3 min-h-[36px] text-[11px] font-extrabold text-[#8B3E03] transition-colors cursor-pointer shrink-0"
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
            <p className="text-[11px] font-bold text-emerald-700 px-0.5">{gpsStatus}</p>
          )}
        </div>
      )}
    </div>
  );
}

