'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Clock } from 'lucide-react';
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

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#0B1120] text-slate-200 mt-16 border-t-4 border-catador-blue">
      {/* Columnas de Información con Alto Contraste (13-14px) y Mayor Espaciado */}
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Columna 1 (4 cols): Identidad + Tarjeta de Sede sin Espacio Muerto */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="relative shrink-0"
              style={{
                height: `${Math.min(storeConfig?.logo_alto_px || 44, 48)}px`,
                width: `${Math.min(storeConfig?.logo_ancho_px || 180, 190)}px`,
              }}
            >
              <Image
                src={storeConfig?.logo_url || '/logo-catador.svg'}
                alt={storeConfig?.nombre_tienda || APP_CONFIG.name}
                fill
                sizes="190px"
                className="object-contain object-left brightness-0 invert opacity-95"
              />
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-white tracking-tight">
              {storeConfig?.nombre_tienda || APP_CONFIG.name}
            </h3>
            <p className="text-slate-300 leading-relaxed text-[13px] sm:text-sm mt-1">
              {storeConfig?.razon_social || APP_CONFIG.legalName} (RIF:{' '}
              {storeConfig?.rif || 'J-41037406-3'}).{' '}
              {storeConfig?.footer_descripcion ||
                'Distribuidora y bodegón en Barinas con venta al detal por unidad y al mayor por caja cerrada.'}
            </p>
          </div>

          {/* Tarjeta Estructurada de Sede y Contacto Directo */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2.5 text-[13px] sm:text-sm text-slate-200">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{storeConfig?.direccion_fisica || APP_CONFIG.address}</span>
            </div>
            <div className="flex items-center gap-2.5 tabular-nums">
              <Phone className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="font-semibold text-white">
                {storeConfig?.telefono_atencion || APP_CONFIG.phone}
              </span>
            </div>
            <div className="flex items-center gap-2.5 pt-1 border-t border-slate-800/80 text-slate-300">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                {storeConfig?.horario_despacho || 'Lunes a Domingo: 8:00 AM - 9:00 PM'}
              </span>
            </div>
          </div>
        </div>

        {/* Columna 2 (2 cols): Departamentos */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-sm sm:text-base font-black text-white tracking-tight border-b border-slate-800 pb-2.5">
            Departamentos
          </h4>
          <ul className="space-y-2.5 text-[13px] sm:text-sm text-slate-300">
            <li>
              <Link href="/catalogo/01" className="hover:text-white transition-colors">
                Licores y Destilados
              </Link>
            </li>
            <li>
              <Link href="/catalogo/09" className="hover:text-white transition-colors">
                Cervezas y Maltas
              </Link>
            </li>
            <li>
              <Link href="/catalogo/11" className="hover:text-white transition-colors">
                Alimentos y Víveres
              </Link>
            </li>
            <li>
              <Link href="/catalogo/02" className="hover:text-white transition-colors">
                Refrescos y Bebidas
              </Link>
            </li>
            <li>
              <Link href="/catalogo/05" className="hover:text-white transition-colors">
                Confitería y Snacks
              </Link>
            </li>
            <li>
              <Link href="/catalogo/03" className="hover:text-white transition-colors">
                Hielo y Eventos
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3 (3 cols): Atención al Cliente y Legal */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="text-sm sm:text-base font-black text-white tracking-tight border-b border-slate-800 pb-2.5">
            Atención al Cliente
          </h4>
          <ul className="space-y-2.5 text-[13px] sm:text-sm text-slate-300">
            <li>
              <Link
                href="/preguntas-frecuentes"
                className="hover:text-white transition-colors font-semibold"
              >
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
                Mi Cuenta y Seguimiento de Pedidos
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 4 (3 cols): Transparencia Bimonetaria */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="text-sm sm:text-base font-black text-white tracking-tight border-b border-slate-800 pb-2.5">
            Transparencia Bimonetaria
          </h4>
          <p className="text-[13px] sm:text-sm text-slate-300 leading-relaxed">
            {storeConfig?.footer_transparencia_texto ||
              'Todos nuestros precios están expresados en Dólares ($ USD) y Bolívares (Bs. / VES) calculados a la tasa oficial vigente del Banco Central de Venezuela (BCV).'}
          </p>
        </div>
      </div>

      {/* Firma Legal de Cierre */}
      <div className="border-t border-slate-800/90 py-5 bg-slate-950">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-slate-400">
          <p>
            © {new Date().getFullYear()} {storeConfig?.razon_social || APP_CONFIG.legalName}. Todos
            los derechos reservados.
          </p>
          <p className="font-semibold text-slate-300">
            {storeConfig?.footer_subdireccion ||
              storeConfig?.direccion_fisica ||
              'C.C. Ciudad Catador • Barinas, Estado Barinas, Venezuela'}
          </p>
        </div>
      </div>
    </footer>
  );
}
