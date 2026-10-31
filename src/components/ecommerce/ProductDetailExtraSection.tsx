'use client';

import React, { useState } from 'react';
import { FileText, PackageCheck, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { getUnitsPerPurchaseMode } from '@/lib/inventory';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

interface ProductDetailExtraSectionProps {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductDetailExtraSection({
  product,
  relatedProducts = [],
}: ProductDetailExtraSectionProps) {
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');
  const unitsPerBox = getUnitsPerPurchaseMode(product, 'caja');

  return (
    <div className="space-y-8 pt-6">
      {/* Pestañas de Información Premium */}
      <section className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            className={cn(
              'flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-extrabold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
              activeTab === 'desc'
                ? 'border-catador-blue text-catador-blue bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            <FileText className="h-4 w-4 shrink-0" />
            Descripción del Artículo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={cn(
              'flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-extrabold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
              activeTab === 'specs'
                ? 'border-catador-blue text-catador-blue bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            <PackageCheck className="h-4 w-4 shrink-0" />
            Ficha Técnica y Empaque
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={cn(
              'flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-extrabold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
              activeTab === 'shipping'
                ? 'border-catador-blue text-catador-blue bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            <Truck className="h-4 w-4 shrink-0" />
            Delivery y Condiciones
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {activeTab === 'desc' && (
            <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
              <p className="font-medium text-slate-800 whitespace-pre-line">
                {product.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">100% Original y Sellado</h4>
                    <p className="text-[11px] text-slate-600">
                      Garantía directa de Distribuidora Bodegón del Catador C.A.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <PackageCheck className="h-5 w-5 text-catador-blue shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Venta Detal y Mayor</h4>
                    <p className="text-[11px] text-slate-600">
                      Control exacto de inventario en unidades y cajas cerradas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Truck className="h-5 w-5 text-catador-amber shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Despacho en Barinas</h4>
                    <p className="text-[11px] text-slate-600">
                      Cotización inteligente por ubicación GPS (Motorizado o Carga).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500 block">Código / SKU SmartVentas</span>
                <strong className="font-mono text-sm text-slate-900">{product.sku}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500 block">Marca / Línea</span>
                <strong className="text-sm text-slate-900">{product.brand}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500 block">Categoría</span>
                <strong className="text-sm text-slate-900">{product.category}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500 block">Unidad Base</span>
                <strong className="text-sm text-slate-900">{product.unit}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500 block">Empaque por Caja / Bulto</span>
                <strong className="text-sm text-slate-900">
                  {product.boxUnitLabel || 'CAJA'} de {unitsPerBox} unidades
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500 block">Existencia Real (Depósito 01)</span>
                <strong className="text-sm text-emerald-700">
                  {product.stockQuantity} unidades ({Math.floor(product.stockQuantity / unitsPerBox)} cajas)
                </strong>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <p>
                • <strong>Delivery Express en Motorizado:</strong> Ideal para pedidos de hasta 2 cajas (o 24 unidades). Tiempo estimado de entrega en Barinas: 25 a 45 minutos tras verificar tu pago.
              </p>
              <p>
                • <strong>Despacho en Vehículo de Carga:</strong> Para pedidos mayoristas o de alto volumen (3 cajas o más), nuestro sistema asigna automáticamente transporte vehicular para proteger tu mercancía.
              </p>
              <p>
                • <strong>Retiro Pick-Up sin costo:</strong> Puedes comprar en la web y retirar directamente en nuestra sede de Gran Catador sin colas.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Productos Relacionados */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-catador-amber" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Productos Relacionados en {product.category}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {relatedProducts.slice(0, 5).map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

