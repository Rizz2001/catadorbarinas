'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, HelpCircle, Loader2, Award } from 'lucide-react';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { useToast } from '@astryxdesign/core/Toast';
import { AlliedBrand, FaqItem } from '@/types';
import {
  getAlliedBrands,
  upsertAlliedBrand,
  deleteAlliedBrand,
  getFaqItems,
  upsertFaqItem,
  deleteFaqItem,
  uploadBannerImage,
} from '@/services/cms.service';

export default function AdminAliadosFaqPage() {
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState<'brands' | 'faq'>('brands');
  const [brands, setBrands] = useState<AlliedBrand[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Nuevo Aliado
  const [brandName, setBrandName] = useState('');
  const [brandTag, setBrandTag] = useState('Aliado Comercial');
  const [brandUrl, setBrandUrl] = useState('/catalogo');
  const [brandColor, setBrandColor] = useState('#00227B');
  const [brandLogo, setBrandLogo] = useState('');

  // Nueva Pregunta Frecuente
  const [faqCategory, setFaqCategory] = useState('Compras por Unidad y Caja');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [bList, fList] = await Promise.all([getAlliedBrands(false), getFaqItems(false)]);
      setBrands(bList);
      setFaqs(fList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([getAlliedBrands(false), getFaqItems(false)]).then(([bList, fList]) => {
      if (active) {
        setBrands(bList);
        setFaqs(fList);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const showToastBanner = (msg: string) => {
    setSavedToast(msg);
    showToast({ body: msg });
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    await upsertAlliedBrand({
      nombre: brandName.trim(),
      categoria_tag: brandTag.trim(),
      url_destino: brandUrl.trim() || '/catalogo',
      color_acento: brandColor,
      logo_url: brandLogo.trim() || null,
      orden: brands.length + 1,
      activo: true,
    });
    setBrandName('');
    setBrandLogo('');
    showToastBanner('Empresa aliada agregada correctamente');
    await loadAll();
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    await upsertFaqItem({
      categoria: faqCategory,
      pregunta: faqQuestion.trim(),
      respuesta: faqAnswer.trim(),
      orden: faqs.length + 1,
      activo: true,
    });
    setFaqQuestion('');
    setFaqAnswer('');
    showToastBanner('Pregunta frecuente publicada');
    await loadAll();
  };

  return (
    <main className="p-4 sm:p-6 space-y-5 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/90 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400">
            Confianza Comercial &amp; Soporte
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-[-0.025em] mt-0.5">
            Empresas Aliadas y Preguntas Frecuentes (FAQ)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestiona las marcas distribuidoras oficiales en portada y el centro de ayuda al cliente
          </p>
        </div>

        <SegmentedControl
          size="md"
          label="Sección de Aliados y Soporte"
          value={activeTab}
          onChange={(val) => setActiveTab(val as 'brands' | 'faq')}
        >
          <SegmentedControlItem value="brands" label={`Empresas Aliadas (${brands.length})`} />
          <SegmentedControlItem value="faq" label={`Preguntas Frecuentes (${faqs.length})`} />
        </SegmentedControl>
      </div>

      {savedToast && (
        <Banner
          status="success"
          title={savedToast}
          isDismissable
          onDismiss={() => setSavedToast(null)}
        />
      )}

      {loading ? (
        <div className="p-12 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-catador-blue" />
          <span>Cargando registros...</span>
        </div>
      ) : activeTab === 'brands' ? (
        <div className="space-y-6 text-xs">
          {/* Formulario Agregar Empresa Aliada */}
          <form
            onSubmit={handleAddBrand}
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs"
          >
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-catador-blue" /> Agregar Empresa / Marca Aliada
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Nombre (Ej: Empresas Polar)"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900"
              />
              <input
                type="text"
                placeholder="Rubro (Ej: Cervecería & Alimentos)"
                value={brandTag}
                onChange={(e) => setBrandTag(e.target.value)}
                className="rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900"
              />
              <input
                type="text"
                placeholder="Enlace (Ej: /buscar?q=Polar)"
                value={brandUrl}
                onChange={(e) => setBrandUrl(e.target.value)}
                className="rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900"
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer"
                />
                <label className="flex-1 flex items-center justify-center px-3 py-2.5 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 cursor-pointer font-bold text-slate-700 truncate">
                  <span>{brandLogo ? 'Logo Listo ✓' : 'Subir Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadBannerImage(file);
                        setBrandLogo(url);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <Button
              type="submit"
              label="Guardar Aliado Comercial"
              variant="primary"
              icon={<Save className="h-4 w-4" />}
            />
          </form>

          {/* Listado de Empresas Aliadas */}
          {brands.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-8">
              <EmptyState
                icon={<Award className="h-8 w-8 text-slate-400" />}
                title="Aún no hay empresas aliadas registradas"
                description="Agrega marcas comerciales usando el formulario superior (se muestran en portada al tener 6 o más)."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {brands.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black shrink-0"
                    style={{ backgroundColor: b.color_acento }}
                  >
                    {b.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 truncate">{b.nombre}</h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {b.categoria_tag} • {b.url_destino}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteAlliedBrand(b.id);
                    await loadAll();
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 text-xs">
          <form
            onSubmit={handleAddFaq}
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs"
          >
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-catador-blue" /> Agregar Pregunta Frecuente
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={faqCategory}
                onChange={(e) => setFaqCategory(e.target.value)}
                placeholder="Categoría (Ej: Pagos y Tasa BCV)"
                className="rounded-xl border border-slate-200 p-2.5 text-slate-900"
              />
              <input
                type="text"
                required
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder="Pregunta frecuente..."
                className="sm:col-span-2 rounded-xl border border-slate-200 p-2.5 text-slate-900"
              />
            </div>
            <textarea
              rows={2}
              required
              value={faqAnswer}
              onChange={(e) => setFaqAnswer(e.target.value)}
              placeholder="Respuesta detallada para el cliente..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900"
            />
            <Button
              type="submit"
              label="Publicar Pregunta"
              variant="primary"
              icon={<Save className="h-4 w-4" />}
            />
          </form>

          <div className="space-y-2.5">
            {faqs.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-catador-amber">
                    {f.categoria}
                  </span>
                  <h4 className="font-extrabold text-slate-900">{f.pregunta}</h4>
                  <p className="text-slate-600">{f.respuesta}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteFaqItem(f.id);
                    await loadAll();
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
