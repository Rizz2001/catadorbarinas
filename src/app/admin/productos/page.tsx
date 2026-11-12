'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FileImage } from 'lucide-react';
import { Banner } from '@astryxdesign/core/Banner';
import { AlertDialog } from '@astryxdesign/core/AlertDialog';
import { useToast } from '@astryxdesign/core/Toast';
import { Product, ProductImageMapping } from '@/types';
import {
  getProductImages,
  uploadProductWebpImage,
  deleteProductWebpImage,
} from '@/services/cms.service';
import { DEFAULT_GROUPS, DEFAULT_SUBGROUPS } from '@/constants/fallback-products';
import { IMAGE_FALLBACKS } from '@/constants/config';
import {
  PhotoUploadToolbar,
  AdminProductsFiltersPanel,
  AdminProductsPhotoGrid,
  type PhotoStatusTab,
} from '@/components/admin';

export default function AdminProductosPage() {
  const showToast = useToast();
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
  const [confirmDeleteCode, setConfirmDeleteCode] = useState<string | null>(null);

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
      void fetch('/api/admin/revalidate', { method: 'POST' });
      setImages((prev) => [
        saved,
        ...prev.filter(
          (i) => i.codigo_articulo.trim().toLowerCase() !== saved.codigo_articulo.trim().toLowerCase()
        ),
      ]);
      setSuccessMsg(`¡Fotografía agregada a "${product.name}" (Código: ${product.id})!`);
      showToast({ body: `Foto asignada a ${product.name}` });
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      showToast({
        body: 'Error subiendo fotografía: ' + (err instanceof Error ? err.message : 'Intenta nuevamente'),
        type: 'error',
      });
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
      showToast({ body: `Fotografía actualizada (#${codigo})` });
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      showToast({
        body: 'Error actualizando imagen: ' + (err instanceof Error ? err.message : 'Intenta nuevamente'),
        type: 'error',
      });
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
    showToast({ body: `${count} fotografía(s) vinculadas correctamente.` });
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
      showToast({ body: `Fotografía vinculada al código ${code}` });
      setTimeout(() => setSuccessMsg(null), 3500);
      void loadData();
    } catch (err) {
      showToast({
        body: 'Error subiendo imagen: ' + (err instanceof Error ? err.message : 'Intenta nuevamente'),
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (codigo: string) => {
    setConfirmDeleteCode(codigo);
  };

  const executeConfirmDelete = async () => {
    if (!confirmDeleteCode) return;
    try {
      setDeletingCode(confirmDeleteCode);
      await deleteProductWebpImage(confirmDeleteCode);
      void fetch('/api/admin/revalidate', { method: 'POST' });
      setImages((prev) => prev.filter((i) => i.codigo_articulo !== confirmDeleteCode));
      showToast({ body: `Fotografía #${confirmDeleteCode} eliminada.` });
      setConfirmDeleteCode(null);
    } catch (err) {
      showToast({
        body: 'Error eliminando imagen: ' + (err instanceof Error ? err.message : 'Intenta nuevamente'),
        type: 'error',
      });
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
          <FileImage className="h-4 w-4 text-catador-amber" strokeWidth={1.5}/>
          <span>{images.length} Fotos Totales en Nube</span>
        </div>
      </div>

      {successMsg && (
        <Banner
          status="success"
          title={successMsg}
          isDismissable
          onDismiss={() => setSuccessMsg(null)}
        />
      )}

      {/* Barra de subida masiva y manual */}
      <PhotoUploadToolbar
        uploading={uploading}
        uploadProgress={uploadProgress}
        onBatchFiles={handleBatchFiles}
        onManualUpload={handleManualUpload}
      />

      <AdminProductsFiltersPanel
        selectedGroup={selectedGroup}
        onSelectGroup={(group) => {
          setSelectedGroup(group);
          setSelectedSubgroup('todos');
        }}
        selectedSubgroup={selectedSubgroup}
        onSelectSubgroup={setSelectedSubgroup}
        availableSubgroups={availableSubgroups}
        search={search}
        onSearchChange={setSearch}
        onlyInStock={onlyInStock}
        onOnlyInStockChange={setOnlyInStock}
        statusTab={statusTab}
        onStatusTabChange={setStatusTab}
        stats={stats}
        totalUploadedImages={images.length}
      />

      <AdminProductsPhotoGrid
        loading={loading}
        selectedGroup={selectedGroup}
        statusTab={statusTab}
        globalFilteredImages={globalFilteredImages}
        displayedProducts={displayedProducts}
        deletingCode={deletingCode}
        uploadingProductCode={uploadingProductCode}
        resolveProductImageRecord={resolveProductImageRecord}
        resolveCategoryBadge={resolveCategoryBadge}
        onDelete={handleDelete}
        onReplace={handleReplacePhoto}
        onQuickUpload={handleQuickProductUpload}
      />

      <AlertDialog
        isOpen={Boolean(confirmDeleteCode)}
        onOpenChange={(open) => {
          if (!open && !deletingCode) setConfirmDeleteCode(null);
        }}
        title={`Eliminar fotografía #${confirmDeleteCode || ''}`}
        description="El artículo volverá a mostrarse con la imagen genérica hasta que subas una nueva fotografía."
        cancelLabel="Cancelar"
        actionLabel="Eliminar Fotografía"
        actionVariant="destructive"
        isActionLoading={Boolean(deletingCode)}
        onAction={() => void executeConfirmDelete()}
      />
    </main>
  );
}
