import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { CartItemList, CartOrderSummary, CartCheckoutForm } from '@/components/cart';

export const metadata: Metadata = {
  title: 'Carrito de Compras | EL CATADOR. Barinas',
  description: 'Revisa tu pedido de licores, víveres y bodegón con precios bimonetarios oficiales en dólares y bolívares.',
};

export default function CarritoPage() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-6 md:py-8 space-y-6">
      <nav className="flex items-center gap-2 text-xs text-slate-600">
        <Link href="/" className="hover:text-catador-blue transition-colors font-semibold">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-extrabold text-slate-900">Carrito de Compras</span>
      </nav>

      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-catador-blue text-white shrink-0">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Tu Carrito de Compras
          </h1>
          <p className="text-[13px] text-slate-600">
            Revisa tus artículos y coordina tu entrega GPS o retiro en EL CATADOR. Barinas
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
