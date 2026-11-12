'use client';

import { Camera, Loader2 } from 'lucide-react';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Product, ProductImageMapping } from '@/types';
import { ProductImageCard } from '../ProductImageCard';
import { MissingPhotoProductCard } from '../MissingPhotoProductCard';
import type { PhotoStatusTab } from './AdminProductsFiltersPanel';

interface AdminProductsPhotoGridProps {
  loading: boolean;
  selectedGroup: string;
  statusTab: PhotoStatusTab;
  globalFilteredImages: ProductImageMapping[];
  displayedProducts: Product[];
  deletingCode: string | null;
  uploadingProductCode: string | null;
  resolveProductImageRecord: (product: Product) => ProductImageMapping | undefined;
  resolveCategoryBadge: (product: Product) => string;
  onDelete: (codigo: string) => void;
  onReplace: (codigo: string, nombre: string | undefined, file: File) => Promise<void>;
  onQuickUpload: (product: Product, file: File) => Promise<void>;
}

/**
 * Grilla responsive del módulo fotográfico en el panel Admin.
 * Muestra tarjetas con foto asignada o tarjetas de captura rápida para faltantes.
 */
export function AdminProductsPhotoGrid({
  loading,
  selectedGroup,
  statusTab,
  globalFilteredImages,
  displayedProducts,
  deletingCode,
  uploadingProductCode,
  resolveProductImageRecord,
  resolveCategoryBadge,
  onDelete,
  onReplace,
  onQuickUpload,
}: AdminProductsPhotoGridProps) {
  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-catador-blue" strokeWidth={1.5}/>
        <span>Sincronizando productos y fotografías de la categoría...</span>
      </div>
    );
  }

  if (selectedGroup === 'GLOBAL_UPLOADED') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {globalFilteredImages.map((item) => (
          <ProductImageCard
            key={item.codigo_articulo}
            item={item}
            onDelete={onDelete}
            onReplace={onReplace}
            isDeleting={deletingCode === item.codigo_articulo}
            isReplacing={uploadingProductCode === item.codigo_articulo}
          />
        ))}
      </div>
    );
  }

  if (displayedProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10">
        <EmptyState
          icon={<Camera className="h-10 w-10 text-slate-400" strokeWidth={1.5}/>}
          title={
            statusTab === 'missing'
              ? '¡Excelente! No hay productos pendientes por fotografía con este filtro'
              : 'No se encontraron productos con fotografía en esta selección'
          }
          description="Prueba cambiando de categoría, subcategoría o desactivando el filtro de stock."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {displayedProducts.map((product) => {
        const imgRecord = resolveProductImageRecord(product);
        const categoryLabel = resolveCategoryBadge(product);

        if (imgRecord) {
          return (
            <ProductImageCard
              key={product.id}
              item={{
                ...imgRecord,
                nombre_articulo: product.name || imgRecord.nombre_articulo,
              }}
              categoryLabel={categoryLabel}
              stockQuantity={product.stockQuantity}
              onDelete={onDelete}
              onReplace={onReplace}
              isDeleting={deletingCode === imgRecord.codigo_articulo}
              isReplacing={uploadingProductCode === imgRecord.codigo_articulo}
            />
          );
        }

        return (
          <MissingPhotoProductCard
            key={product.id}
            product={product}
            categoryLabel={categoryLabel}
            onQuickUpload={onQuickUpload}
            isUploading={uploadingProductCode === product.id}
          />
        );
      })}
    </div>
  );
}
