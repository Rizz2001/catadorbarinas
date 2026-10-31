'use client';

import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, Save, HelpCircle, Loader2, CheckCircle2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';

export default function AdminAliadosFaqPage() {
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

  const showToast = (msg: string) => {
    setSavedToast(msg);
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
    showToast('Empresa aliada agregada correctamente');
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
    showToast('Pregunta frecuente publicada');
    await loadAll();
  };

  return (
    <main className="p-4 sm:p-6 space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-catador-blue text-white">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Empresas Aliadas y Preguntas Frecuentes (FAQ)
            </h1>
            <p className="text-xs text-slate-500">
              Gestiona los logotipos de empresas aliadas en portada y el centro de ayuda al cliente
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 bg-slate-200/70 p-1 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setActiveTab('brands')}
            className={cn(
              'px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer',
              activeTab === 'brands' ? 'bg-white text-catador-blue shadow-xs' : 'text-slate-600'
            )}
          >
            Empresas Aliadas ({brands.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={cn(
              'px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer',
              activeTab === 'faq' ? 'bg-white text-catador-blue shadow-xs' : 'text-slate-600'
            )}
          >
            Preguntas Frecuentes ({faqs.length})
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{savedToast}</span>
        </div>
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
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-catador-blue text-white font-black cursor-pointer"
            >
              <Save className="h-4 w-4" /> Guardar Aliado Comercial
            </button>
          </form>

          {/* Listado de Empresas Aliadas */}
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
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-catador-blue text-white font-black cursor-pointer"
            >
              <Save className="h-4 w-4" /> Publicar Pregunta
            </button>
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
