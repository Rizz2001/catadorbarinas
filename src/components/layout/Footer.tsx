'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Clock } from 'lucide-react';
import { APP_CONFIG } from '@/constants/config';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';

const PAYMENT_PILLS = ['Pago Móvil', 'Transferencia', 'Zelle', 'Efectivo USD'];

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

  const activePaymentPills = PAYMENT_PILLS.filter(
    (method) => method !== 'Transferencia' || storeConfig?.transferencia_activa !== false
  );

  return (
    <footer className="bg-catador-blue-dark text-slate-200 mt-10 sm:mt-14 pb-28 md:pb-0 border-t border-white/10">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-14 grid grid-cols-2 lg:grid-cols-12 gap-x-5 gap-y-7 sm:gap-10 lg:gap-12">
        <div className="col-span-2 sm:col-span-1 lg:col-span-4 space-y-3.5 sm:space-y-4">
          <div className="inline-flex items-center rounded-2xl bg-white px-3.5 py-2 shadow-xs">
            <div
              className="relative shrink-0"
              style={{
                height: `${Math.min(storeConfig?.logo_alto_px || 42, 46)}px`,
                width: `${Math.min(storeConfig?.logo_ancho_px || 170, 185)}px`,
              }}
            >
              <Image
                src={storeConfig?.logo_url || '/logo-catador.svg'}
                alt={storeConfig?.nombre_tienda || APP_CONFIG.name}
                fill
                sizes="185px"
                className="object-contain object-left"
              />
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-white tracking-tight">
              {storeConfig?.nombre_tienda || APP_CONFIG.name}
            </h3>
            <p className="hidden sm:block text-slate-300 leading-relaxed text-[13px] sm:text-sm mt-1">
              {storeConfig?.razon_social || APP_CONFIG.legalName} (RIF:{' '}
              {storeConfig?.rif || 'J-41037406-3'}).{' '}
              {storeConfig?.footer_descripcion ||
                'Distribuidora y bodegón en Barinas con venta al detal por unidad y al mayor por caja cerrada.'}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 space-y-2 sm:space-y-2.5 text-[13px] sm:text-sm text-slate-200">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-catador-amber-oak shrink-0 mt-0.5" strokeWidth={1.5}/>
              <span>{storeConfig?.direccion_fisica || APP_CONFIG.address}</span>
            </div>
            <div className="flex items-center gap-2.5 tabular-nums">
              <Phone className="h-4 w-4 text-catador-amber-oak shrink-0" strokeWidth={1.5}/>
              <span className="font-semibold text-white">
                {storeConfig?.telefono_atencion || APP_CONFIG.phone}
              </span>
            </div>
            <div className="flex items-center gap-2.5 pt-2 border-t border-white/10 text-slate-300">
              <Clock className="h-4 w-4 text-catador-amber-oak shrink-0" strokeWidth={1.5}/>
              <span>
                {storeConfig?.horario_despacho || 'Lunes a Domingo: 8:00 AM - 9:00 PM'}
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-3 sm:space-y-4">
          <h4 className="text-sm sm:text-base font-black text-white tracking-tight border-b border-white/15 pb-2 sm:pb-2.5">
            Departamentos
          </h4>
          <ul className="space-y-2 sm:space-y-2.5 text-[13px] sm:text-sm text-slate-300">
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

        <div className="col-span-1 lg:col-span-3 space-y-3 sm:space-y-4">
          <h4 className="text-sm sm:text-base font-black text-white tracking-tight border-b border-white/15 pb-2 sm:pb-2.5">
            Atención al Cliente
          </h4>
          <ul className="space-y-2 sm:space-y-2.5 text-[13px] sm:text-sm text-slate-300">
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

        <div className="col-span-2 sm:col-span-1 lg:col-span-3 space-y-3 sm:space-y-4">
          <h4 className="text-sm sm:text-base font-black text-white tracking-tight border-b border-white/15 pb-2 sm:pb-2.5">
            Transparencia Bimonetaria
          </h4>
          <p className="hidden sm:block text-[13px] sm:text-sm text-slate-300 leading-relaxed">
            {storeConfig?.footer_transparencia_texto ||
              'Todos nuestros precios están expresados en Dólares ($ USD) y Bolívares (Bs. / VES) calculados a la tasa oficial vigente del Banco Central de Venezuela (BCV).'}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {activePaymentPills.map((method) => (
              <span
                key={method}
                className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-bold text-slate-100"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 sm:py-5 bg-[#00103D]">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left text-xs sm:text-[13px] text-slate-300">
          <p>
            © {new Date().getFullYear()} {storeConfig?.razon_social || APP_CONFIG.legalName}. Todos
            los derechos reservados.
          </p>
          <p className="font-semibold text-slate-200">
            {storeConfig?.footer_subdireccion ||
              storeConfig?.direccion_fisica ||
              'C.C. Ciudad Catador Local N1 · Barinas, Venezuela'}
          </p>
        </div>
      </div>
    </footer>
  );
}
