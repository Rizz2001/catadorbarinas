'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone } from 'lucide-react';
import { APP_CONFIG } from '@/constants/config';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';

export function Footer() {
  const pathname = usePathname();
  const storeConfig = useStoreConfigStore((state) => state.config);
  const fetchConfig = useStoreConfigStore((state) => state.fetchConfig);
  const hasLoaded = useStoreConfigStore((state) => state.hasLoaded);

  useEffect(() => {
    if (!hasLoaded) {
      fetchConfig();
    }
  }, [hasLoaded, fetchConfig]);

  // Ocultar footer de la tienda en panel CMS
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const freeShipping =
    storeConfig?.delivery_gratis_minimo_usd ?? APP_CONFIG.freeShippingThresholdUsd;

  const defaultGarantias = [
    {
      figura: `Gratis desde $${freeShipping}`,
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
  ];

  const garantias =
    storeConfig?.footer_garantias && storeConfig.footer_garantias.length > 0
      ? storeConfig.footer_garantias
      : defaultGarantias;

  return (
    <footer className="bg-slate-950 text-slate-300 mt-16 border-t-4 border-catador-blue">
      {/* Banda Arquitectónica Superior */}
      <div className="border-b border-slate-800/80">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
          {garantias.map((g, idx) => (
            <div key={idx} className="py-5 sm:px-5 first:pl-0 last:pr-0">
              <span className="text-sm font-black text-catador-amber tabular-nums block">
                {g.figura}
              </span>
              <h4 className="text-xs font-extrabold text-white mt-0.5">{g.titulo}</h4>
              <p className="text-[11px] text-slate-400">{g.subtitulo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Columnas de Información */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
        <div className="space-y-3">
          <div
            className="relative mb-2"
            style={{
              height: `${Math.min(storeConfig?.logo_alto_px || 40, 48)}px`,
              width: `${Math.min(storeConfig?.logo_ancho_px || 180, 200)}px`,
            }}
          >
            <Image
              src={storeConfig?.logo_url || '/logo-catador.svg'}
              alt={storeConfig?.nombre_tienda || APP_CONFIG.name}
              fill
              sizes="200px"
              className="object-contain object-left brightness-0 invert opacity-95"
            />
          </div>
          <h3 className="text-sm font-black text-white tracking-tight">
            {storeConfig?.nombre_tienda || APP_CONFIG.name}
          </h3>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {storeConfig?.razon_social || APP_CONFIG.legalName} (RIF:{' '}
            {storeConfig?.rif || 'J-50123456-7'}).{' '}
            {storeConfig?.footer_descripcion ||
              'Distribuidora y bodegón en Barinas con venta al detal por unidad y al mayor por caja cerrada.'}
          </p>
          <div className="space-y-1.5 text-[11px] text-slate-400 pt-1">
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-catador-amber shrink-0" />
              <span>{storeConfig?.direccion_fisica || APP_CONFIG.address}</span>
            </p>
            <p className="flex items-center gap-1.5 tabular-nums">
              <Phone className="h-3.5 w-3.5 text-catador-amber shrink-0" />
              <span>{storeConfig?.telefono_atencion || APP_CONFIG.phone}</span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-white">Departamentos</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/catalogo/01" className="hover:text-white transition-colors">Licores y Destilados</Link></li>
            <li><Link href="/catalogo/09" className="hover:text-white transition-colors">Cervezas y Maltas</Link></li>
            <li><Link href="/catalogo/11" className="hover:text-white transition-colors">Alimentos y Víveres</Link></li>
            <li><Link href="/catalogo/02" className="hover:text-white transition-colors">Refrescos y Bebidas</Link></li>
            <li><Link href="/catalogo/05" className="hover:text-white transition-colors">Confitería y Snacks</Link></li>
            <li><Link href="/catalogo/03" className="hover:text-white transition-colors">Hielo y Eventos</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-white">Atención al Cliente y Legal</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <Link href="/preguntas-frecuentes" className="hover:text-white transition-colors font-semibold">
                Ayuda y Preguntas Frecuentes (FAQ)
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-white transition-colors">
                Políticas de Privacidad y Cookies
              </Link>
            </li>
            <li>
              <Link href="/terminos" className="hover:text-white transition-colors">
                Términos y Condiciones (+18)
              </Link>
            </li>
            <li>
              <Link href="/favoritos" className="hover:text-white transition-colors">
                Mis Productos Favoritos
              </Link>
            </li>
            <li>
              <Link href="/cuenta" className="hover:text-white transition-colors">
                Mi Cuenta y Pedidos
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-white">Transparencia Bimonetaria</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {storeConfig?.footer_transparencia_texto ||
              'Todos nuestros precios están expresados en Dólares ($ USD) y Bolívares (Bs. / VES) calculados a la tasa oficial vigente del Banco Central de Venezuela (BCV).'}
          </p>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px]">
            <span className="text-slate-400 font-semibold block">Horario de Despacho:</span>
            <span className="text-catador-amber font-bold mt-0.5 block">
              {storeConfig?.horario_despacho || 'Lunes a Domingo: 8:00 AM - 9:00 PM'}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 py-5 bg-black/40">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} {storeConfig?.razon_social || APP_CONFIG.legalName}. Todos
            los derechos reservados.
          </p>
          <p className="font-semibold text-slate-400">
            {storeConfig?.footer_subdireccion || 'Av. 23 de Enero • Barinas, Estado Barinas, Venezuela'}
          </p>
        </div>
      </div>
    </footer>
  );
}
