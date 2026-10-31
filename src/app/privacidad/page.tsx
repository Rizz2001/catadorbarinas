import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Cookie, MapPin, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Políticas de Privacidad y Uso de Cookies | Gran Catador Barinas',
  description:
    'Políticas de tratamiento de datos personales, geolocalización de pedidos, uso de cookies y venta responsable (+18) de Distribuidora Bodegón del Catador C.A.',
};

export default function PrivacidadPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a la Tienda
        </Link>
      </div>

      <article className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
        <header className="border-b border-slate-100 pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-catador-blue bg-blue-50 px-3 py-1 rounded-full">
            <ShieldCheck className="h-4 w-4" /> Marco Legal y Protección al Consumidor
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Políticas de Privacidad, Datos Personales y Cookies
          </h1>
          <p className="text-xs text-slate-500">
            Última actualización: Octubre 2026 • Distribuidora Bodegón del Catador C.A. — Barinas, Venezuela
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-catador-blue" />
            1. Información que Recopilamos y Finalidad Comercial
          </h2>
          <p>
            En <strong>Gran Catador / Distribuidora Bodegón del Catador C.A.</strong> recopilamos únicamente los datos indispensables para procesar, facturar y despachar tus pedidos de licores, bebidas y víveres en la ciudad de Barinas:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Datos de Identificación y Facturación:</strong> Nombre completo, Cédula de Identidad o RIF, teléfono de contacto y correo electrónico.
            </li>
            <li>
              <strong>Datos de Pago Bimonetario:</strong> Referencias bancarias de Pago Móvil, Zelle o modalidad en efectivo para conciliación administrativa interna.
            </li>
            <li>
              <strong>Búsquedas en el Catálogo:</strong> Registramos los términos consultados en el buscador para mejorar nuestro inventario en el Depósito 01 y ofrecerte disponibilidad continua de las marcas que prefieres.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-catador-amber" />
            2. Uso de Ubicación GPS para Cotización de Delivery
          </h2>
          <p>
            Cuando utilizas el botón <strong>«Elegir mi ubicación actual (GPS)»</strong> en el Checkout, tu navegador solicita permiso explícito para compartir tus coordenadas puntuales únicamente con el fin de:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Calcular con precisión la distancia en kilómetros desde nuestra sede en Barinas hasta tu punto de entrega.</li>
            <li>Cotizar automáticamente la tarifa justa de envío en <strong>Motorizado Express</strong> o <strong>Vehículo de Carga</strong> (según la cantidad de cajas/unidades de tu pedido).</li>
            <li>Facilitar al repartidor asignado la llegada exacta a tu domicilio sin demoras.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Cookie className="h-4 w-4 text-emerald-600" />
            3. Política de Cookies y Almacenamiento Local
          </h2>
          <p>
            Nuestra plataforma utiliza cookies esenciales y almacenamiento local (<code>localStorage</code>) para:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Mantener activa tu sesión segura de usuario y conservar los artículos agregados a tu Carrito y Lista de Favoritos.</li>
            <li>Recordar tu confirmación de mayoría de edad (+18 años) y aceptación de cookies.</li>
            <li>Optimizar la velocidad de carga del catálogo sincronizado con SmartVentas (FoxData).</li>
          </ul>
        </section>

        <section className="space-y-2 pt-2 border-t border-slate-100">
          <h2 className="text-base font-black text-slate-900">
            4. Cumplimiento Legal de Mayoría de Edad (+18 Años)
          </h2>
          <p>
            La venta y entrega de bebidas alcohólicas está estrictamente reservada a personas mayores de <strong>18 años</strong> conforme a la legislación vigente en la República Bolivariana de Venezuela. Nuestros repartidores o personal en sede podrán solicitar la presentación de la Cédula de Identidad al momento de la entrega.
          </p>
        </section>
      </article>
    </main>
  );
}

