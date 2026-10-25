'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Search, CheckCircle2, Loader2, AlertCircle, Barcode, FileImage } from 'lucide-react';
import { ProductImageMapping } from '@/types';
import { getProductImages, uploadProductWebpImage, deleteProductWebpImage } from '@/services/cms.service';
import { ProductImageCard } from '@/components/admin';

export default function AdminProductosPage() {
  const [images, setImages] = useState<ProductImageMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  // Formulario manual
  const [manualCode, setManualCode] = useState('');
  const [manualName, setManualName] = useState('');
  const manualFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadList();
  }, []);

  async function loadList() {
    try {
      setLoading(true);
      const data = await getProductImages();
      setImages(data);
    } catch (err) {
      console.error('Error cargando imágenes:', err);
    } finally {
      setLoading(false);
    }
  }

  // Manejador de subida masiva (Batch Drag & Drop)
  const handleBatchFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(`Procesando 0 de ${files.length} imágenes...`);
    let count = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // El nombre del archivo debe ser [codigo_de_barras].webp
      const rawName = file.name;
      const code = rawName.substring(0, rawName.lastIndexOf('.')) || rawName;

      try {
        setUploadProgress(`Subiendo ${i + 1} de ${files.length}: ${code}.webp...`);
        await uploadProductWebpImage(file, code);
        count++;
      } catch (err) {
        console.error(`Error subiendo ${code}:`, err);
      }
    }

    setUploading(false);
    setUploadProgress(null);
    setSuccessMsg(`¡${count} foto(s) WebP vinculadas con éxito a sus códigos de barras!`);
    setTimeout(() => setSuccessMsg(null), 4000);
    loadList();
  };

  // Manejador de subida manual
  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = manualFileInputRef.current?.files?.[0];
    if (!file || !manualCode.trim()) {
      alert('Por favor especifica el código de barras y selecciona una foto WebP.');
      return;
    }

    try {
      setUploading(true);
      await uploadProductWebpImage(file, manualCode.trim(), manualName.trim() || undefined);
      setManualCode('');
      setManualName('');
      if (manualFileInputRef.current) manualFileInputRef.current.value = '';
      setSuccessMsg(`Foto WebP asociada correctamente al código ${manualCode.trim()}`);
      setTimeout(() => setSuccessMsg(null), 3500);
      loadList();
    } catch (err) {
      alert('Error subiendo imagen: ' + (err instanceof Error ? err.message : 'Intenta nuevamente'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (codigo: string) => {
    if (!confirm(`¿Eliminar la foto asociada al código ${codigo}?`)) return;
    try {
      setDeletingCode(codigo);
      await deleteProductWebpImage(codigo);
      setImages((prev) => prev.filter((i) => i.codigo_articulo !== codigo));
    } catch (err) {
      alert('Error eliminando imagen: ' + (err instanceof Error ? err.message : 'Intenta nuevamente'));
    } finally {
      setDeletingCode(null);
    }
  };

  const filteredImages = images.filter(
    (item) =>
      item.codigo_articulo.toLowerCase().includes(search.toLowerCase()) ||
      (item.nombre_articulo && item.nombre_articulo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-catador-blue text-white shadow-2xs">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Fotos de Productos (WebP)</h1>
            <p className="text-xs text-slate-500">Sube fotos WebP con el código de barras para asociarlas automáticamente al catálogo</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
          <FileImage className="h-4 w-4 text-catador-amber" />
          <span>{images.length} Fotos Registradas</span>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Zona Drag & Drop para Subida Masiva */}
      <section className="rounded-2xl border-2 border-dashed border-catador-blue/30 bg-blue-50/40 p-6 text-center space-y-3 hover:border-catador-blue transition-colors">
        <div className="h-12 w-12 rounded-full bg-catador-blue/10 text-catador-blue flex items-center justify-center mx-auto">
          <Upload className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-900">Subida Masiva por Código de Barras</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
            Arrastra aquí tus archivos <span className="font-bold text-catador-blue">.webp</span> nombrados con el código de barras o SKU del producto (ej: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">759100000001.webp</span> o <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">BARRICA80.webp</span>).
          </p>
        </div>

        <label className="inline-flex items-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light px-5 py-2.5 font-bold text-white text-xs shadow-md transition-all cursor-pointer">
          <Upload className="h-4 w-4" />
          <span>Seleccionar Archivos WebP</span>
          <input
            type="file"
            multiple
            accept="image/webp,image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleBatchFiles(e.target.files)}
          />
        </label>

        {uploadProgress && (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-catador-blue pt-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{uploadProgress}</span>
          </div>
        )}
      </section>

      {/* Formulario de Asignación Individual */}
      <form onSubmit={handleManualUpload} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3 text-xs">
        <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
          Asignar Foto Individual por Código
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Código de Barras / SKU *</label>
            <input
              type="text"
              required
              placeholder="Ej: 7591234567890 o BARRICA80"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nombre del Artículo (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Ron Barrica 80 0.70L"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Archivo WebP *</label>
            <input
              type="file"
              required
              accept="image/webp,image/*"
              ref={manualFileInputRef}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:ring-2 focus:ring-catador-blue/20 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-2 rounded-xl bg-catador-amber hover:bg-catador-amber-dark font-extrabold text-white px-5 py-2 text-xs transition-colors cursor-pointer"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span>Subir y Vincular Foto</span>
        </button>
      </form>

      {/* Buscador y Galería de Fotos */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Fotos Asignadas en la Tienda ({filteredImages.length})
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-catador-blue" />
            <span>Cargando fotos de productos...</span>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 space-y-2">
            <Barcode className="h-10 w-10 mx-auto text-slate-300 stroke-1" />
            <p className="font-bold text-slate-700">No se encontraron fotos registradas</p>
            <p className="text-xs text-slate-400">Sube tus archivos WebP arrastrándolos en la zona superior para comenzar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredImages.map((item) => (
              <ProductImageCard
                key={item.codigo_articulo}
                item={item}
                onDelete={handleDelete}
                isDeleting={deletingCode === item.codigo_articulo}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
