'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, RotateCcw, CheckCircle2 } from 'lucide-react';
import { uploadStoreLogo } from '@/services/cms.service';
import { trimTransparentBorders } from '@/lib/image-trim';
import { ConfigLogoPreview } from './ConfigLogoPreview';
import { ConfigLogoSliders } from './ConfigLogoSliders';

interface ConfigLogoUploaderProps {
  logoUrl?: string | null;
  logoAltoPx?: number | null;
  logoAnchoPx?: number | null;
  onLogoChange: (url: string) => void;
  onDimensionsChange: (dims: { logo_alto_px?: number; logo_ancho_px?: number }) => void;
  onQuickSave?: () => Promise<void>;
}

export function ConfigLogoUploader({
  logoUrl,
  logoAltoPx = 56,
  logoAnchoPx = 240,
  onLogoChange,
  onDimensionsChange,
  onQuickSave,
}: ConfigLogoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [savingQuick, setSavingQuick] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentLogo = logoUrl || '/logo-catador.svg';
  const currentHeight = logoAltoPx || 56;
  const currentWidth = logoAnchoPx || 240;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    try {
      setUploading(true);
      setMessage('Optimizando y recortando márgenes...');
      const cleanFile = await trimTransparentBorders(rawFile);
      const publicUrl = await uploadStoreLogo(cleanFile);
      onLogoChange(publicUrl);
      setMessage('¡Logotipo subido y optimizado con éxito!');
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      alert('Error subiendo logotipo: ' + (err instanceof Error ? err.message : 'Intenta nuevamente'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDirectSave = async () => {
    if (!onQuickSave) return;
    try {
      setSavingQuick(true);
      await onQuickSave();
      setMessage('¡Tamaño guardado y aplicado a toda la tienda!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert('Error guardando tamaño: ' + (err instanceof Error ? err.message : 'Reintenta'));
    } finally {
      setSavingQuick(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-5">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-catador-blue" />
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Logotipo Oficial y Calibración de Tamaño
          </h3>
        </div>
        {message && (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-scale-in">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            {message}
          </span>
        )}
      </div>

      {/* Carga y Restablecer */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="text-xs space-y-0.5 max-w-md">
          <span className="font-bold text-slate-800 block">Archivo de Logotipo</span>
          <p className="text-[11px] text-slate-500">
            Acepta SVG, PNG o WebP. El sistema recorta automáticamente los bordes vacíos para que no se vea pequeño.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 px-4 py-2 font-bold text-white text-xs shadow-xs transition-colors cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                <span>Subir Nuevo Logo</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/webp,image/jpeg"
              disabled={uploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {currentLogo !== '/logo-catador.svg' && (
            <button
              type="button"
              onClick={() => {
                onLogoChange('/logo-catador.svg');
                onDimensionsChange({ logo_alto_px: 56, logo_ancho_px: 240 });
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              title="Restablecer al logo predeterminado de Gran Catador"
            >
              <RotateCcw className="h-3 w-3 text-slate-500" />
              <span>Restablecer</span>
            </button>
          )}
        </div>
      </div>

      {/* Sliders y Controles Modulares */}
      <ConfigLogoSliders
        currentHeight={currentHeight}
        currentWidth={currentWidth}
        savingQuick={savingQuick}
        onDimensionsChange={onDimensionsChange}
        onDirectSave={onQuickSave ? handleDirectSave : undefined}
      />

      {/* Visualización Dual en Vivo */}
      <ConfigLogoPreview
        currentLogo={currentLogo}
        currentHeight={currentHeight}
        currentWidth={currentWidth}
      />
    </div>
  );
}
