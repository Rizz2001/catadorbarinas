import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { fetchProductById } from '@/services/foxdata.service';
import { ProductDetailView } from '@/components/ecommerce';
import { formatUsd } from '@/lib/currency';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ grupo?: string }>;
}

export async function generateMetadata({ params, searchParams }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const product = await fetchProductById(id, sp.grupo);

  if (!product) {
    return {
      title: 'Producto no encontrado | Gran Catador Barinas',
    };
  }

  const priceFormatted = formatUsd(product.priceUsd);
  const title = `${product.name} (${priceFormatted}) | Gran Catador Barinas`;
  const description = `${product.name} disponible en Bodegón del Catador Barinas por ${priceFormatted}. Compra online con entrega a domicilio o retiro.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images,
    },
  };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const product = await fetchProductById(id, sp.grupo);

  if (!product) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Breadcrumb de Navegación */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-catador-blue transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
        <Link href="/#catalogo-en-vivo" className="hover:text-catador-blue transition-colors">
          Catálogo
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
        <span className="font-bold text-slate-800 truncate">{product.name}</span>
      </nav>

      {/* Botón Volver */}
      <div>
        <Link
          href="/#catalogo-en-vivo"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al Catálogo
        </Link>
      </div>

      {/* Ficha Completa del Producto */}
      <ProductDetailView product={product} />
    </main>
  );
}
