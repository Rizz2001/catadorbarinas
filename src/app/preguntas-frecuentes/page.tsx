'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, MessageCircle, ArrowLeft } from 'lucide-react';
import { FaqItem } from '@/types';
import { getFaqItems } from '@/services/cms.service';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { cn } from '@/lib/utils';

export default function PreguntasFrecuentesPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const storeConfig = useStoreConfigStore((state) => state.config);

  useEffect(() => {
    getFaqItems(true).then((list) => {
      setFaqs(list);
      if (list[0]) setOpenId(list[0].id);
    });
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al Inicio
        </Link>
      </div>

      <header className="rounded-3xl bg-gradient-to-br from-catador-blue to-slate-900 p-6 sm:p-10 text-white space-y-3 shadow-lg">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-amber-300">
          <HelpCircle className="h-4 w-4" /> CENTRO DE AYUDA AL CLIENTE
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Ayuda y Preguntas Frecuentes
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
          Todo lo que necesitas saber sobre compras por unidad o caja, control de stock en tiempo real, cotización de delivery por GPS en Barinas y pagos a tasa oficial BCV.
        </p>
      </header>

      <section className="space-y-3">
        {faqs.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-catador-amber block">
                    {item.categoria}
                  </span>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {item.pregunta}
                  </h2>
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-180 text-catador-blue'
                  )}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {item.respuesta}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl bg-amber-50 border border-amber-200/80 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">
            ¿Necesitas atención directa con nuestro equipo en Barinas?
          </h3>
          <p className="text-xs text-slate-600">
            Horario de atención: {storeConfig?.horario_despacho || 'Lunes a Domingo: 8:00 AM - 9:00 PM'}
          </p>
        </div>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light px-5 py-3 text-xs font-black text-white shadow-sm shrink-0"
        >
          <MessageCircle className="h-4 w-4" /> Ir a Comprar en Línea
        </Link>
      </section>
    </main>
  );
}

