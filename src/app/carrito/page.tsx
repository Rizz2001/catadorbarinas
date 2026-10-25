import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { CartItemList, CartOrderSummary, CartCheckoutForm } from '@/components/cart';

export const metadata: Metadata = {
  title: 'Carrito de Compras | Gran Catador Barinas',
  description: 'Revisa tu pedido de licores, víveres y bodegón con precios bimonetarios oficiales en dólares y bolívares.',
};

export default function CarritoPage() {
  return (
    <main className="container mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Breadcrumb de Navegación */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-catador-blue transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-bold text-slate-800">Carrito de Compras</span>
      </nav>

      {/* Título de la Página */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-catador-blue text-white shadow-2xs">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Tu Carrito de Compras
          </h1>
          <p className="text-xs text-slate-500">
            Revisa tus artículos y coordina tu entrega a domicilio o retiro en Bodegón del Catador Barinas
          </p>
        </div>
      </div>

      {/* Grid Principal: Lista a la Izquierda y Resumen / Checkout a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna de Artículos (7 o 8 cols) */}
        <section className="lg:col-span-7 xl:col-span-8">
          <CartItemList />
        </section>

        {/* Columna de Checkout y Resumen (5 o 4 cols) */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-24">
          <CartOrderSummary />
          <CartCheckoutForm />
        </aside>
      </div>
    </main>
  );
}
