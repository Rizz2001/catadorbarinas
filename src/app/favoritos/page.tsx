'use client';

import Link from 'next/link';
import { Heart, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ProductCard } from '@/components/ecommerce/ProductCard';

export default function FavoritosPage() {
  const { items, clearFavorites } = useWishlistStore();

  return (
    <main className="container mx-auto max-w-7xl px-4 py-6 md:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Mis Productos Favoritos
            </h1>
            <p className="text-[13px] text-slate-600 tabular-nums">
              {items.length} {items.length === 1 ? 'artículo guardado' : 'artículos guardados'} para compra rápida por unidad o caja
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearFavorites}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-extrabold text-rose-700 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" /> Limpiar Favoritos
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-10 sm:p-14 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F7F8FA] text-slate-400">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Aún no tienes favoritos guardados</h2>
            <p className="text-[13px] text-slate-600 max-w-md mx-auto">
              Pulsa el icono de corazón en cualquier licor, cerveza o vívere del catálogo para guardarlo aquí y agregarlo cuando quieras.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark px-6 py-3 text-xs font-black text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Explorar Catálogo Completo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
