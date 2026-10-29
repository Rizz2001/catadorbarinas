'use client';

import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadBannerImage } from '@/services/cms.service';

interface BannerImageUploaderProps {
  imageUrl?: string | null;
  onImageChange: (url: string | null) => void;
}

export function BannerImageUploader({ imageUrl, onImageChange }: BannerImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadBannerImage(file);
      onImageChange(url);
    } catch (err) {
      alert('Error subiendo imagen: ' + (err instanceof Error ? err.message : 'Intenta nuevamente'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-bold text-slate-700 text-xs">
        Imagen de Fondo del Banner (Opcional)
      </label>

      {imageUrl ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Banner Preview" className="h-14 w-24 object-cover rounded-lg border border-slate-200" />
            <div className="text-[11px] text-slate-600 truncate max-w-xs">
              <span className="font-bold text-slate-800 block">Imagen cargada</span>
              <span className="truncate block text-slate-500">{imageUrl}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onImageChange(null)}
            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
            title="Quitar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-slate-50 hover:border-catador-blue/40 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFile}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex flex-col items-center justify-center gap-1">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-catador-blue" />
            ) : (
              <Upload className="h-6 w-6 text-slate-400" />
            )}
            <p className="text-xs font-bold text-slate-700">
              {uploading ? 'Subiendo imagen a Supabase...' : 'Haz clic o arrastra una imagen aquí'}
            </p>
            <p className="text-[10px] text-slate-400">WebP, PNG o JPG recomendados (1200x500px)</p>
          </div>
        </div>
      )}
    </div>
  );
}
