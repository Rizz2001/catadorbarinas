import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileCheck, Package, Truck, DollarSign, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Condiciones de Servicio | Gran Catador Barinas',
  description:
    'Condiciones comerciales de venta por unidad y por caja, validación de inventario, pagos a tasa oficial BCV y políticas de despacho en Barinas.',
};

export default function TerminosPage() {
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
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-catador-amber bg-amber-50 px-3 py-1 rounded-full">
            <FileCheck className="h-4 w-4" /> Condiciones Comerciales Oficiales
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Términos y Condiciones de Compra y Despacho
          </h1>
          <p className="text-xs text-slate-500">
            Distribuidora Bodegón del Catador C.A. • Barinas, Estado Barinas
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Package className="h-4 w-4 text-catador-blue" />
            1. Ventas por Unidad, por Caja y Disponibilidad de Stock
          </h2>
          <p>
            Todos los productos publicados en nuestra tienda están sincronizados con nuestro inventario físico del <strong>Depósito 01 (Bodegón)</strong>. Cuando eliges comprar <strong>Por Caja</strong>, el sistema multiplica automáticamente el número de cajas por las unidades que componen el empaque (ej. 12 o 24 unidades) y verifica en tiempo real que existan las unidades suficientes antes de procesar la orden.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            2. Precios Bimonetarios ($ USD y Bs. BCV)
          </h2>
          <p>
            En estricto cumplimiento de las normativas cambiarias vigentes en Venezuela, todos los precios se expresan simultáneamente en Dólares Estadounidenses (<strong>$ USD</strong>) y en Bolívares (<strong>Bs.</strong>) calculados a la tasa oficial vigente del <strong>Banco Central de Venezuela (BCV)</strong> al momento de la transacción.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Truck className="h-4 w-4 text-catador-amber" />
            3. Tarifas de Delivery por Distancia y Volumen de Carga
          </h2>
          <p>
            El servicio de entrega a domicilio en Barinas se cotiza automáticamente en el Checkout tomando en cuenta dos factores:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Despacho en Motorizado:</strong> Aplica para pedidos ligeros que no excedan la capacidad segura de transporte de un motorizado.
            </li>
            <li>
              <strong>Despacho en Vehículo de Carga:</strong> Cuando el pedido comprende múltiples cajas o gran volumen de mercancía, el sistema asigna un vehículo de carga y refleja el ajuste de tarifa correspondiente antes de confirmar tu compra.
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
}

