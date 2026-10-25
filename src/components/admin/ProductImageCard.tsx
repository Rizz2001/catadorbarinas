import React from 'react';
import Image from 'next/image';
import { Trash2, ExternalLink, Barcode } from 'lucide-react';
import { ProductImageMapping } from '@/types';

interface ProductImageCardProps {
  item: ProductImageMapping;
  onDelete: (codigo: string) => void;
  isDeleting: boolean;
}

export function ProductImageCard({ item, onDelete, isDeleting }: ProductImageCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-catador-blue/40 transition-all flex flex-col justify-between gap-3 group">
      <div className="space-y-2">
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

        {/* Datos del Producto */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-catador-blue">
            <Barcode className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono text-xs font-black tracking-wide truncate">
              {item.codigo_articulo}
            </span>
          </div>
          <p className="font-bold text-slate-800 text-xs line-clamp-2">
            {item.nombre_articulo || item.codigo_articulo}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <a
          href={item.imagen_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-catador-blue transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Ver URL</span>
        </a>

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
