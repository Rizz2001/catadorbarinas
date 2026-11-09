'use client';

import React, { useRef, useState } from 'react';
import { Upload, Loader2, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';

interface PhotoUploadToolbarProps {
  uploading: boolean;
  uploadProgress: string | null;
  onBatchFiles: (files: FileList | null) => Promise<void>;
  onManualUpload: (code: string, name: string, file: File) => Promise<void>;
}

export function PhotoUploadToolbar({
  uploading,
  uploadProgress,
  onBatchFiles,
  onManualUpload,
}: PhotoUploadToolbarProps) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [manualName, setManualName] = useState('');
  const manualFileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = manualFileInputRef.current?.files?.[0];
    if (!file || !manualCode.trim()) return;

    await onManualUpload(manualCode.trim(), manualName.trim(), file);
    setManualCode('');
    setManualName('');
    if (manualFileInputRef.current) {
      manualFileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Zona Drag & Drop para Subida Masiva + Botón para formulario manual */}
      <section className="rounded-2xl border-2 border-dashed border-catador-blue/30 bg-blue-50/40 p-5 text-center space-y-3 hover:border-catador-blue transition-colors">
        <div className="h-11 w-11 rounded-full bg-catador-blue/10 text-catador-blue flex items-center justify-center mx-auto">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-900">
            Subida Masiva por Código de Artículo / SKU
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-lg mx-auto">
            Selecciona múltiples fotos nombradas con el código del artículo (ej:{' '}
            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
              000106.webp
            </span>
            ) o sube la foto directamente en cada tarjeta de producto abajo.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <label className="inline-flex items-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light px-4 py-2.5 font-bold text-white text-xs shadow-xs transition-all cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Subir Varias Fotos por Código</span>
            <input
              type="file"
              multiple
              accept="image/webp,image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => onBatchFiles(e.target.files)}
            />
          </label>

          <button
            type="button"
            onClick={() => setShowManualForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2.5 font-bold text-slate-700 text-xs transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 text-catador-amber" />
            <span>Asignar por Código Manual</span>
            {showManualForm ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
        </div>

        {uploadProgress && (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-catador-blue pt-1">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{uploadProgress}</span>
          </div>
        )}
      </section>

      {/* Formulario Desplegable de Asignación Individual Manual */}
      {showManualForm && (
        <form
          onSubmit={handleManualSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 text-xs animate-in fade-in duration-200"
        >
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Asignar Foto Manualmente por Código
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Código del Artículo / SKU *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: 000106 o BARRICA80"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:outline-none focus:border-catador-blue"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nombre del Artículo (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Polar Pilsen 0.22L"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:border-catador-blue"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Archivo de Imagen *
              </label>
              <input
                type="file"
                required
                accept="image/webp,image/*"
                ref={manualFileInputRef}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl bg-catador-amber hover:bg-catador-amber-dark font-extrabold text-white px-5 py-2.5 text-xs transition-colors cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>Subir y Vincular Foto</span>
          </button>
        </form>
      )}
    </div>
  );
}

