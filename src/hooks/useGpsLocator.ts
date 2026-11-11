'use client';

import { useState } from 'react';

/**
 * Encapsula la captura de coordenadas GPS desde el navegador para registro y perfil.
 */
export function useGpsLocator(onLocated: (lat: number, lng: number) => void) {
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  const detectGps = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsStatus('Tu navegador no soporta geolocalización GPS.');
      return;
    }

    setLocatingGps(true);
    setGpsStatus(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocated(
          Number(pos.coords.latitude.toFixed(6)),
          Number(pos.coords.longitude.toFixed(6))
        );
        setGpsStatus('¡Coordenadas GPS capturadas con éxito!');
        setLocatingGps(false);
      },
      () => {
        setGpsStatus('No pudimos acceder a tu ubicación GPS. Revisa los permisos.');
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return { locatingGps, gpsStatus, detectGps };
}

