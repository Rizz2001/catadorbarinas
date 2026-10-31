import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { fetchArticulosSmartVentas, fetchProductById } from '@/services/foxdata.service';
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
  const description = `${product.description} Compra por unidad o caja en Gran Catador Barinas por ${priceFormatted} ($ USD y Bs. BCV). Delivery express y Pick-Up.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.images,
      type: 'website',
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

  // Cargar productos relacionados del mismo grupo y subgrupo
  const groupProducts = await fetchArticulosSmartVentas(
    product.codGrupo || sp.grupo || '01',
    product.codSubgrupo
  );
  const relatedProducts = groupProducts
    .filter((p) => p.id !== product.id && p.inStock)
    .slice(0, 5);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.priceUsd.toFixed(2),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Distribuidora Bodegón del Catador C.A.',
      },
    },
  };

  return (
    <main className="container mx-auto px-4 py-6 md:py-8 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Breadcrumb de Navegación */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
        <Link href="/" className="hover:text-catador-blue transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
        <Link
          href={product.codGrupo ? `/catalogo/${product.codGrupo}` : '/catalogo'}
          className="hover:text-catador-blue transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
        <span className="font-bold text-slate-800 truncate">{product.name}</span>
      </nav>

      {/* Botón Volver */}
      <div>
        <Link
          href={product.codGrupo ? `/catalogo/${product.codGrupo}` : '/catalogo'}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a {product.category}
        </Link>
      </div>

      {/* Ficha Completa del Producto + Relacionados */}
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </main>
  );
}
