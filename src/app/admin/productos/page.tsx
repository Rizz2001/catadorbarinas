'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Loader2,
  Camera,
  FileImage,
  Filter,
  FolderOpen,
} from 'lucide-react';
import { Product, ProductImageMapping } from '@/types';
import {
  getProductImages,
  uploadProductWebpImage,
  deleteProductWebpImage,
} from '@/services/cms.service';
import { DEFAULT_GROUPS, DEFAULT_SUBGROUPS } from '@/constants/fallback-products';
import { IMAGE_FALLBACKS } from '@/constants/config';
import {
  ProductImageCard,
  MissingPhotoProductCard,
  PhotoUploadToolbar,
} from '@/components/admin';
import { cn } from '@/lib/utils';

type PhotoStatusTab = 'missing' | 'assigned' | 'all';

export default function AdminProductosPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>('01');
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('todos');
  const [statusTab, setStatusTab] = useState<PhotoStatusTab>('missing');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const [images, setImages] = useState<ProductImageMapping[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadingProductCode, setUploadingProductCode] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedGroup === 'GLOBAL_UPLOADED') {
        const imgs = await getProductImages();
        setImages(imgs);
        setCatalogProducts([]);
      } else {
        const [imgs, catRes] = await Promise.all([
          getProductImages(),
          fetch(`/api/catalog?codGrupo=${selectedGroup}&includeHidden=true`),
        ]);
        const catJson = await catRes.json();
        setImages(imgs);
        setCatalogProducts(catJson.products || []);
      }
    } catch (err) {
      console.error('Error cargando catálogo fotográfico:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Mapa rápido de fotos registradas por código
  const imagesByCodeMap = useMemo(() => {
    const map = new Map<string, ProductImageMapping>();
    images.forEach((img) => {
      const clean = img.codigo_articulo.trim();
      map.set(clean, img);
      map.set(clean.toLowerCase(), img);
    });
    return map;
  }, [images]);

  const resolveProductImageRecord = useCallback(
    (product: Product): ProductImageMapping | undefined => {
      const idClean = product.id.trim();
      const skuClean = product.sku.trim();
      const matched =
        imagesByCodeMap.get(idClean) ||
        imagesByCodeMap.get(idClean.toLowerCase()) ||
        imagesByCodeMap.get(skuClean) ||
        imagesByCodeMap.get(skuClean.toLowerCase());

      if (matched) return matched;

      const primaryImg = product.images?.[0];
      if (primaryImg && primaryImg !== IMAGE_FALLBACKS.product) {
        return {
          codigo_articulo: product.id,
          nombre_articulo: product.name,
          imagen_url: primaryImg,
          nombre_archivo: `${product.id}.webp`,
          formato: 'webp',
        };
      }
      return undefined;
    },
    [imagesByCodeMap]
  );

  const resolveCategoryBadge = useCallback(
    (product: Product): string => {
      const groupName =
        DEFAULT_GROUPS.find((g) => g.CodGrupo === (product.codGrupo || selectedGroup))?.Nombre ||
        'CATÁLOGO';
      const subList = DEFAULT_SUBGROUPS[product.codGrupo || selectedGroup] || [];
      const subName = subList.find(
        (s) => s.CodSubgrupo === String(product.codSubgrupo || '').trim()
      )?.Nombre;
      return subName ? `${groupName} • ${subName}` : groupName;
    },
    [selectedGroup]
  );

  // Subcategorías disponibles en el grupo seleccionado
  const availableSubgroups = useMemo(() => {
    if (selectedGroup === 'GLOBAL_UPLOADED') return [];
    const predefined = DEFAULT_SUBGROUPS[selectedGroup] || [];
    const counts = new Map<string, number>();
    catalogProducts.forEach((p) => {
      const sub = String(p.codSubgrupo || '').trim();
      if (sub) counts.set(sub, (counts.get(sub) || 0) + 1);
    });
    return predefined.filter((s) => (counts.get(s.CodSubgrupo) || 0) > 0 || predefined.length <= 8);
  }, [selectedGroup, catalogProducts]);

  // Productos filtrados por subcategoría, stock y búsqueda
  const baseFilteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalogProducts.filter((p) => {
      if (
        selectedSubgroup !== 'todos' &&
        String(p.codSubgrupo || '').trim() !== selectedSubgroup
      ) {
        return false;
      }
      if (onlyInStock && p.stockQuantity <= 0) {
        return false;
      }
      if (q) {
        const matchId = p.id.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchName = p.name.toLowerCase().includes(q);
        if (!matchId && !matchSku && !matchName) return false;
      }
      return true;
    });
  }, [catalogProducts, selectedSubgroup, onlyInStock, search]);

  // Estadísticas de cobertura fotográfica para la selección actual
  const stats = useMemo(() => {
    let assigned = 0;
    let missing = 0;
    let missingWithStock = 0;

    baseFilteredProducts.forEach((p) => {
      const hasPhoto = Boolean(resolveProductImageRecord(p));
      if (hasPhoto) {
        assigned++;
      } else {
        missing++;
        if (p.stockQuantity > 0) missingWithStock++;
      }
    });

    const total = baseFilteredProducts.length;
    const coveragePercent = total > 0 ? Math.round((assigned / total) * 100) : 0;
    return { total, assigned, missing, missingWithStock, coveragePercent };
  }, [baseFilteredProducts, resolveProductImageRecord]);

  // Lista final según pestaña activa (Faltan por Foto / Con Fotografía / Todos)
  const displayedProducts = useMemo(() => {
    if (statusTab === 'missing') {
      return baseFilteredProducts.filter((p) => !resolveProductImageRecord(p));
    }
    if (statusTab === 'assigned') {
      return baseFilteredProducts.filter((p) => Boolean(resolveProductImageRecord(p)));
    }
    return baseFilteredProducts;
  }, [baseFilteredProducts, statusTab, resolveProductImageRecord]);

  // Subida rápida directa desde una tarjeta de producto
  const handleQuickProductUpload = async (product: Product, file: File) => {
    try {
      setUploadingProductCode(product.id);
      const saved = await uploadProductWebpImage(file, product.id, product.name);
      setImages((prev) => [
        saved,
        ...prev.filter(
          (i) => i.codigo_articulo.trim().toLowerCase() !== saved.codigo_articulo.trim().toLowerCase()
        ),
      ]);
      setSuccessMsg(`¡Fotografía agregada a "${product.name}" (Código: ${product.id})!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(
        'Error subiendo fotografía: ' +
          (err instanceof Error ? err.message : 'Intenta nuevamente')
      );
    } finally {
      setUploadingProductCode(null);
    }
  };

  // Reemplazo rápido desde tarjeta con foto
  const handleReplacePhoto = async (
    codigo: string,
    nombre: string | undefined,
    file: File
  ) => {
    try {
      setUploadingProductCode(codigo);
      const saved = await uploadProductWebpImage(file, codigo, nombre);
      setImages((prev) => [
        saved,
        ...prev.filter(
          (i) => i.codigo_articulo.trim().toLowerCase() !== saved.codigo_articulo.trim().toLowerCase()
        ),
      ]);
      setSuccessMsg(`Fotografía actualizada para el código ${codigo}.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      alert(
        'Error actualizando imagen: ' +
          (err instanceof Error ? err.message : 'Intenta nuevamente')
      );
    } finally {
      setUploadingProductCode(null);
    }
  };

  // Subida masiva por lotes
  const handleBatchFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(`Procesando 0 de ${files.length} imágenes...`);
    let count = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rawName = file.name;
      const code = rawName.substring(0, rawName.lastIndexOf('.')) || rawName;
      const matchedProd = catalogProducts.find(
        (p) => p.id.trim().toLowerCase() === code.trim().toLowerCase()
      );

      try {
        setUploadProgress(`Subiendo ${i + 1} de ${files.length}: ${code}...`);
        await uploadProductWebpImage(file, code, matchedProd?.name);
        count++;
      } catch (err) {
        console.error(`Error subiendo ${code}:`, err);
      }
    }

    setUploading(false);
    setUploadProgress(null);
    setSuccessMsg(`¡${count} fotografía(s) vinculadas con éxito al catálogo!`);
    setTimeout(() => setSuccessMsg(null), 4000);
    void loadData();
  };

  const handleManualUpload = async (code: string, name: string, file: File) => {
    try {
      setUploading(true);
      const matchedProd = catalogProducts.find(
        (p) => p.id.trim().toLowerCase() === code.trim().toLowerCase()
      );
      await uploadProductWebpImage(file, code, name || matchedProd?.name || undefined);
      setSuccessMsg(`Fotografía vinculada correctamente al código ${code}`);
      setTimeout(() => setSuccessMsg(null), 3500);
      void loadData();
    } catch (err) {
      alert(
        'Error subiendo imagen: ' + (err instanceof Error ? err.message : 'Intenta nuevamente')
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (codigo: string) => {
    if (!confirm(`¿Eliminar la fotografía asociada al código ${codigo}?`)) return;
    try {
      setDeletingCode(codigo);
      await deleteProductWebpImage(codigo);
      setImages((prev) => prev.filter((i) => i.codigo_articulo !== codigo));
    } catch (err) {
      alert(
        'Error eliminando imagen: ' + (err instanceof Error ? err.message : 'Intenta nuevamente')
      );
    } finally {
      setDeletingCode(null);
    }
  };

  const globalFilteredImages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return images.filter(
      (item) =>
        item.codigo_articulo.toLowerCase().includes(q) ||
        (item.nombre_articulo && item.nombre_articulo.toLowerCase().includes(q))
    );
  }, [images, search]);

  return (
    <main className="p-4 sm:p-6 space-y-5 max-w-6xl">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400">
            Gestión Fotográfica por Categorías
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-[-0.025em] mt-0.5">
            Fotografías de Productos y Faltantes por Categoría
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Filtra por categoría para ver qué productos aún no tienen foto, tomarles fotografía y subirla en un toque
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 bg-white border border-slate-200/90 px-3 py-1.5 rounded-lg tabular-nums self-start">
          <FileImage className="h-4 w-4 text-catador-amber" />
          <span>{images.length} Fotos Totales en Nube</span>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Barra de subida masiva y manual */}
      <PhotoUploadToolbar
        uploading={uploading}
        uploadProgress={uploadProgress}
        onBatchFiles={handleBatchFiles}
        onManualUpload={handleManualUpload}
      />

      {/* Panel de Clasificación por Categoría, Subcategoría y Estado Fotográfico */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Selector de Categoría (Grupo FoxData) */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
              1. Categoría de Productos
            </label>
            <div className="relative">
              <FolderOpen className="h-4 w-4 text-catador-blue absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  setSelectedSubgroup('todos');
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 min-h-[40px] text-xs font-black text-slate-900 focus:outline-none focus:border-catador-blue"
              >
                {DEFAULT_GROUPS.map((g) => (
                  <option key={g.CodGrupo} value={g.CodGrupo}>
                    Categoría {g.CodGrupo}: {g.Nombre}
                  </option>
                ))}
                <option value="GLOBAL_UPLOADED">
                  Ver Todas las Fotos Subidas ({images.length})
                </option>
              </select>
            </div>
          </div>

          {/* Buscador */}
          <div className="md:col-span-5">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
              2. Buscar Producto o Código
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre (ej: Cacique, Polar) o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 min-h-[40px] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue"
              />
            </div>
          </div>

          {/* Filtro rápido de Stock */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
              3. Filtro de Inventario
            </label>
            <button
              type="button"
              disabled={selectedGroup === 'GLOBAL_UPLOADED'}
              onClick={() => setOnlyInStock((prev) => !prev)}
              className={cn(
                'w-full min-h-[40px] rounded-xl px-3 py-2 text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50',
                onlyInStock
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{onlyInStock ? 'Mostrando Solo con Stock' : 'Filtrar Solo con Stock'}</span>
            </button>
          </div>
        </div>

        {/* Chips de Subcategorías cuando hay una categoría activa */}
        {selectedGroup !== 'GLOBAL_UPLOADED' && availableSubgroups.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedSubgroup('todos')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-extrabold shrink-0 transition-colors cursor-pointer',
                selectedSubgroup === 'todos'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Todas las Subcategorías
            </button>
            {availableSubgroups.map((sub) => (
              <button
                key={sub.CodSubgrupo}
                type="button"
                onClick={() => setSelectedSubgroup(sub.CodSubgrupo)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer',
                  selectedSubgroup === sub.CodSubgrupo
                    ? 'bg-catador-blue text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {sub.Nombre}
              </button>
            ))}
          </div>
        )}

        {/* Pestañas: Faltan por Foto / Con Fotografía / Todos + Barra de Cobertura */}
        {selectedGroup !== 'GLOBAL_UPLOADED' && (
          <div className="pt-2 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 tabular-nums">
              <button
                type="button"
                onClick={() => setStatusTab('missing')}
                className={cn(
                  'min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border',
                  statusTab === 'missing'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
                )}
              >
                <Camera className="h-4 w-4" />
                <span>Faltan por Fotografía ({stats.missing})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusTab('assigned')}
                className={cn(
                  'min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border',
                  statusTab === 'assigned'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Con Fotografía ({stats.assigned})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusTab('all')}
                className={cn(
                  'min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border',
                  statusTab === 'all'
                    ? 'bg-catador-blue text-white border-catador-blue shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                )}
              >
                <span>Todos ({stats.total})</span>
              </button>
            </div>

            {/* Resumen de cobertura de la categoría */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs tabular-nums">
              <div className="flex-1 min-w-[140px]">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span>Cobertura de Categoría</span>
                  <span className="font-black text-catador-blue">{stats.coveragePercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${stats.coveragePercent}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-500 border-l border-slate-200 pl-3">
                <span className="font-bold text-amber-800 block">
                  {stats.missingWithStock} con stock sin foto
                </span>
                <span>de {stats.missing} pendientes</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Grilla de Productos / Fotografías */}
      {loading ? (
        <div className="p-12 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-catador-blue" />
          <span>Sincronizando productos y fotografías de la categoría...</span>
        </div>
      ) : selectedGroup === 'GLOBAL_UPLOADED' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {globalFilteredImages.map((item) => (
            <ProductImageCard
              key={item.codigo_articulo}
              item={item}
              onDelete={handleDelete}
              onReplace={handleReplacePhoto}
              isDeleting={deletingCode === item.codigo_articulo}
              isReplacing={uploadingProductCode === item.codigo_articulo}
            />
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-2">
          <Camera className="h-10 w-10 mx-auto text-slate-300 stroke-1" />
          <p className="font-bold text-slate-800 text-sm">
            {statusTab === 'missing'
              ? '¡Excelente! No hay productos pendientes por fotografía con este filtro'
              : 'No se encontraron productos con fotografía en esta selección'}
          </p>
          <p className="text-xs text-slate-500">
            Prueba cambiando de categoría, subcategoría o desactivando el filtro de stock.
          </p>
        </div>
      ) : (
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
                  onDelete={handleDelete}
                  onReplace={handleReplacePhoto}
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
                onQuickUpload={handleQuickProductUpload}
                isUploading={uploadingProductCode === product.id}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
