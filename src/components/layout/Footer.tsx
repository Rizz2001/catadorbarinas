'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, ShieldCheck, CreditCard, Truck, MessageSquare } from 'lucide-react';
import { APP_CONFIG } from '@/constants/config';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';

export function Footer() {
  const storeConfig = useStoreConfigStore((state) => state.config);
  const fetchConfig = useStoreConfigStore((state) => state.fetchConfig);
  const hasLoaded = useStoreConfigStore((state) => state.hasLoaded);

  useEffect(() => {
    if (!hasLoaded) {
      fetchConfig();
    }
  }, [hasLoaded, fetchConfig]);

  const freeShipping = storeConfig?.delivery_gratis_minimo_usd ?? APP_CONFIG.freeShippingThresholdUsd;

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16 border-t-4 border-catador-blue">
      {/* Ventajas de Compra */}
      <div className="border-b border-slate-800 py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-catador-blue/40 flex items-center justify-center text-catador-amber shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Delivery en Barinas</h4>
              <p className="text-[11px] text-slate-400">Gratis en compras mayores a ${freeShipping}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-catador-blue/40 flex items-center justify-center text-catador-amber shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Garantía de Calidad</h4>
              <p className="text-[11px] text-slate-400">100% licores y víveres originales</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-catador-blue/40 flex items-center justify-center text-catador-amber shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Múltiples Pagos</h4>
              <p className="text-[11px] text-slate-400">Pago Móvil, Zelle, Efectivo USD/Bs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-catador-blue/40 flex items-center justify-center text-catador-amber shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Soporte en Vivo</h4>
              <p className="text-[11px] text-slate-400">Chat y tracking directo en web</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones del Footer */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        {/* Info Bodegón */}
        <div className="space-y-3">
          <div
            className="relative mb-2 transition-all duration-150"
            style={{
              height: `${Math.min(storeConfig?.logo_alto_px || 40, 48)}px`,
              width: `${Math.min(storeConfig?.logo_ancho_px || 180, 200)}px`,
            }}
          >
            <Image
              src={storeConfig?.logo_url || '/logo-catador.svg'}
              alt={storeConfig?.nombre_tienda || APP_CONFIG.name}
              fill
              className="object-contain object-left brightness-0 invert opacity-95"
            />
          </div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            {storeConfig?.nombre_tienda || APP_CONFIG.name}
          </h3>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {storeConfig?.razon_social || APP_CONFIG.legalName} (RIF: {storeConfig?.rif || 'J-50123456-7'}). Tu bodegón y licorería de confianza en Barinas, con la más amplia variedad de licores importados, víveres de primera necesidad y charcutería selecta.
          </p>
          <div className="space-y-1.5 text-[11px] text-slate-400 pt-1">
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-catador-amber shrink-0" />
              {storeConfig?.direccion_fisica || APP_CONFIG.address}
            </p>
            <p className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-catador-amber shrink-0" />
              {storeConfig?.telefono_atencion || APP_CONFIG.phone}
            </p>
          </div>
        </div>

        {/* Departamentos */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Departamentos SmartVentas</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/catalogo/01" className="hover:text-catador-amber">Licores</Link></li>
            <li><Link href="/catalogo/09" className="hover:text-catador-amber">Cervezas</Link></li>
            <li><Link href="/catalogo/11" className="hover:text-catador-amber">Alimentos</Link></li>
            <li><Link href="/catalogo/02" className="hover:text-catador-amber">Refrescos</Link></li>
            <li><Link href="/catalogo/05" className="hover:text-catador-amber">Confitería</Link></li>
            <li><Link href="/catalogo/03" className="hover:text-catador-amber">Hielos</Link></li>
          </ul>
        </div>

        {/* Información & Ayuda */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Servicio al Cliente</h4>
          <ul className="space-y-2 text-slate-400">
            <li><span className="text-slate-400">Delivery en toda la ciudad de Barinas</span></li>
            <li><span className="text-slate-400">Métodos: Pago Móvil, Zelle y Efectivo $</span></li>
            <li><span className="text-slate-400">Chat y Soporte en Vivo por Pedido</span></li>
            <li><span className="text-slate-400">100% de la gestión dentro de la Web</span></li>
          </ul>
        </div>

        {/* Bimonetarismo & Tasa Oficial */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Transparencia de Precios</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Todos los precios mostrados en nuestra plataforma están expresados en Dólares ($ USD) y Bolívares (Bs. / VES) calculados a la tasa oficial del Banco Central de Venezuela (BCV).
          </p>
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-[11px]">
            <span className="text-slate-300 font-semibold block">Horario de Despacho:</span>
            <span className="text-catador-amber font-bold">{storeConfig?.horario_despacho || 'Lunes a Domingo: 8:00 AM - 9:00 PM'}</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-4 bg-slate-950 text-center text-[11px] text-slate-500">
        <p>© {new Date().getFullYear()} {storeConfig?.razon_social || APP_CONFIG.legalName}. Todos los derechos reservados. Barinas, Venezuela.</p>
      </div>
    </footer>
  );
}
