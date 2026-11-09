'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Trash2, ExternalLink, Barcode, Tag, RefreshCw, Loader2, Package } from 'lucide-react';
import { ProductImageMapping } from '@/types';

interface ProductImageCardProps {
  item: ProductImageMapping;
  categoryLabel?: string;
  stockQuantity?: number;
  onDelete: (codigo: string) => void;
  onReplace?: (codigo: string, nombre: string | undefined, file: File) => Promise<void>;
  isDeleting: boolean;
  isReplacing?: boolean;
}

export function ProductImageCard({
  item,
  categoryLabel,
  stockQuantity,
  onDelete,
  onReplace,
  isDeleting,
  isReplacing = false,
}: ProductImageCardProps) {
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onReplace) return;
    await onReplace(item.codigo_articulo, item.nombre_articulo || undefined, file);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-catador-blue/40 transition-all flex flex-col justify-between gap-3 group">
      <div className="space-y-2">
        {/* Cabecera: Categoría o Estado + Stock */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
            <span>Con Foto</span>
          </span>

          {typeof stockQuantity === 'number' && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                stockQuantity > 0
                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-slate-50 text-slate-400 border border-slate-200'
              }`}
            >
              <Package className="h-3 w-3" />
              <span>Stock: {stockQuantity}</span>
            </span>
          )}
        </div>

        {/* Imagen WebP */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
          <Image
            src={item.imagen_url}
            alt={item.nombre_articulo || item.codigo_articulo}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
          <span className="absolute top-2 right-2 rounded-md bg-slate-900/80 backdrop-blur-xs text-[9px] font-black text-white px-1.5 py-0.5 uppercase tracking-wider">
            {item.formato || 'webp'}
          </span>
        </div>

        {/* Etiqueta de Categoría */}
        {categoryLabel && (
          <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 truncate">
            <Tag className="h-3 w-3 text-catador-blue shrink-0" />
            <span className="truncate">{categoryLabel}</span>
          </div>
        )}

        {/* Datos del Producto */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-catador-blue">
            <Barcode className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono text-xs font-black tracking-wide truncate">
              {item.codigo_articulo}
            </span>
          </div>
          <p className="font-bold text-slate-800 text-xs line-clamp-2 leading-snug">
            {item.nombre_articulo || item.codigo_articulo}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <a
            href={item.imagen_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-catador-blue transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Ver</span>
          </a>

          {onReplace && (
            <>
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/webp,image/*"
                className="hidden"
                disabled={isReplacing}
                onChange={handleReplaceFile}
              />
              <button
                type="button"
                disabled={isReplacing}
                onClick={() => replaceInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-catador-blue hover:underline cursor-pointer"
                title="Cambiar fotografía"
              >
                {isReplacing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                <span>Cambiar</span>
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          disabled={isDeleting}
          onClick={() => onDelete(item.codigo_articulo)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
          title="Eliminar foto"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );
}
