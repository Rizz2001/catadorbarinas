import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, ShieldCheck, CreditCard, Truck } from 'lucide-react';
import { APP_CONFIG } from '@/constants/config';

export function Footer() {
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
              <p className="text-[11px] text-slate-400">Gratis en compras mayores a $30</p>
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
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Atención WhatsApp</h4>
              <p className="text-[11px] text-slate-400">Confirmación y despacho inmediato</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones del Footer */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        {/* Info Bodegón */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            {APP_CONFIG.name}
          </h3>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {APP_CONFIG.legalName}. Tu bodegón y licorería de confianza en Barinas, con la más amplia variedad de licores importados, víveres de primera necesidad y charcutería selecta.
          </p>
          <div className="space-y-1.5 text-[11px] text-slate-400 pt-1">
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-catador-amber shrink-0" />
              {APP_CONFIG.address}
            </p>
            <p className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-catador-amber shrink-0" />
              {APP_CONFIG.phone}
            </p>
          </div>
        </div>

        {/* Departamentos */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Departamentos</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="#licores-vinos" className="hover:text-catador-amber">Licores & Vinos</Link></li>
            <li><Link href="#viveres" className="hover:text-catador-amber">Víveres & Despensa</Link></li>
            <li><Link href="#charcuteria-quesos" className="hover:text-catador-amber">Charcutería & Quesos</Link></li>
            <li><Link href="#carniceria" className="hover:text-catador-amber">Carnicería</Link></li>
            <li><Link href="#snacks-dulces" className="hover:text-catador-amber">Snacks & Golosinas</Link></li>
          </ul>
        </div>

        {/* Información & Ayuda */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Servicio al Cliente</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="#delivery" className="hover:text-catador-amber">Zonas de Entrega en Barinas</Link></li>
            <li><Link href="#metodos-pago" className="hover:text-catador-amber">Métodos de Pago & Tasa BCV</Link></li>
            <li><Link href="#preguntas" className="hover:text-catador-amber">Preguntas Frecuentes</Link></li>
            <li><Link href="#contacto" className="hover:text-catador-amber">Contacto Directo</Link></li>
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
            <span className="text-catador-amber font-bold">Lunes a Domingo: 8:00 AM - 9:00 PM</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-4 bg-slate-950 text-center text-[11px] text-slate-500">
        <p>© {new Date().getFullYear()} {APP_CONFIG.legalName}. Todos los derechos reservados. Desarrollado para Barinas, Venezuela.</p>
      </div>
    </footer>
  );
}
