'use client';

import React, { useRef, useState } from 'react';
import {
  Camera,
  Upload,
  Barcode,
  Copy,
  Check,
  Loader2,
  Package,
  Tag,
} from 'lucide-react';
import { Product } from '@/types';
import { formatUsd } from '@/lib/currency';

interface MissingPhotoProductCardProps {
  product: Product;
  categoryLabel: string;
  onQuickUpload: (product: Product, file: File) => Promise<void>;
  isUploading: boolean;
}

export function MissingPhotoProductCard({
  product,
  categoryLabel,
  onQuickUpload,
  isUploading,
}: MissingPhotoProductCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(product.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignorar si portapapeles no está disponible
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onQuickUpload(product, file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-2xl border border-amber-200/90 bg-white p-3.5 shadow-2xs hover:border-catador-amber transition-all flex flex-col justify-between gap-3">
      <div className="space-y-2.5">
        {/* Cabecera: Estado y Stock */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
            <Camera className="h-3 w-3 text-amber-600" />
            <span>Sin Foto</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums ${
              product.stockQuantity > 0
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            <Package className="h-3 w-3" />
            <span>Stock: {product.stockQuantity}</span>
          </span>
        </div>

        {/* Espacio visual de foto faltante con acción directa */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="relative aspect-square w-full rounded-xl border-2 border-dashed border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/80 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors group"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-1.5 text-catador-blue">
              <Loader2 className="h-7 w-7 animate-spin" />
              <span className="text-[11px] font-extrabold">Subiendo foto...</span>
            </div>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Camera className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-black text-amber-950">
                Pendiente por Fotografiar
              </span>
              <span className="text-[10px] text-amber-800/80 mt-0.5">
                Toca aquí para elegir o tomar foto
              </span>
            </>
          )}
        </div>

        {/* Categoría y Subcategoría */}
        <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 truncate">
          <Tag className="h-3 w-3 text-catador-amber shrink-0" />
          <span className="truncate">{categoryLabel}</span>
        </div>

        {/* Código copiables y Nombre del Producto */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1">
            <div className="flex items-center gap-1.5 text-catador-blue min-w-0">
              <Barcode className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-xs font-black tracking-wide truncate">
                {product.id}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copiar código para nombrar archivo"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-catador-blue px-1.5 py-0.5 rounded bg-white border border-slate-200 cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-700">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          <h3 className="font-extrabold text-slate-900 text-xs line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <p className="text-[11px] font-black text-catador-blue tabular-nums">
            {formatUsd(product.priceUsd)}
          </p>
        </div>
      </div>

      {/* Botón directo de carga */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/webp,image/*"
          className="hidden"
          disabled={isUploading}
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full min-h-[40px] rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          <span>{isUploading ? 'Subiendo...' : 'Agregar Fotografía'}</span>
        </button>
      </div>
    </div>
  );
}

