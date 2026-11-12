'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Loader2, Upload, X } from 'lucide-react';
import { useToast } from '@astryxdesign/core/Toast';
import { uploadCategoryImage } from '@/services/cms.service';

interface CategoryImageUploaderProps {
  categoryId: string;
  categoryName: string;
  imageUrl?: string | null;
  onImageChange: (url: string | null) => void;
}

/**
 * Cargador visual de imagen de categoría hacia el bucket público 'category-images' en Supabase Storage.
 */
export function CategoryImageUploader({
  categoryId,
  categoryName,
  imageUrl,
  onImageChange,
}: CategoryImageUploaderProps) {
  const showToast = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadCategoryImage(file, categoryId);
      onImageChange(url);
      showToast({ body: `Imagen cargada para "${categoryName}". Guarda la categoría para publicar.` });
    } catch (err) {
      showToast({
        body: err instanceof Error ? err.message : 'Error subiendo imagen a category-images.',
        type: 'error',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold text-slate-700">
        Imagen de Fondo (Bucket <code className="font-mono text-[10px]">category-images</code>)
      </label>

      {imageUrl ? (
        <div className="flex items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
              <Image
                src={imageUrl}
                alt={categoryName}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-slate-800 truncate">
                Imagen lista
              </span>
              <span className="block text-[10px] font-mono text-slate-500 truncate">
                {imageUrl}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onImageChange(null)}
            title="Quitar imagen de categoría"
            aria-label={`Quitar imagen de ${categoryName}`}
            className="shrink-0 rounded-lg bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      ) : (
        <label className="relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-3 text-center hover:border-catador-blue/40 hover:bg-slate-50 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileChange}
            className="sr-only"
          />
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-catador-blue" strokeWidth={1.5} />
          ) : (
            <Upload className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
          )}
          <span className="text-[11px] font-bold text-slate-700">
            {uploading ? 'Subiendo a category-images...' : 'Subir foto de categoría'}
          </span>
          <span className="text-[10px] text-slate-400">WebP, PNG o JPG</span>
        </label>
      )}
    </div>
  );
}

