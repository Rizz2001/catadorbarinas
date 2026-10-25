'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { formatPrices } from '@/lib/currency';
import { useBcvStore } from '@/store/useBcvStore';
import { IMAGE_FALLBACKS } from '@/constants/config';

export function HeaderSearch() {
  const router = useRouter();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);

  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search effect
  useEffect(() => {
    if (term.trim().length < 2) {
      setResults([]);
      setTotalMatches(0);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term.trim())}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
          setTotalMatches(data.totalMatches || 0);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Error buscando:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [term]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    setIsOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="flex items-center rounded-full border-2 border-catador-blue bg-white p-1 pl-4 shadow-xs focus-within:ring-2 focus-within:ring-catador-blue/20"
      >
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => term.trim().length >= 2 && setIsOpen(true)}
          placeholder="Buscar licores, víveres, cervezas, snacks..."
          className="w-full bg-transparent text-base md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none min-h-[40px]"
        />

        {term && (
          <button
            type="button"
            onClick={() => { setTerm(''); setIsOpen(false); }}
            className="p-1 text-slate-400 hover:text-slate-600 mr-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-catador-blue text-white hover:bg-catador-blue-light transition-colors cursor-pointer"
          aria-label="Buscar"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </button>
      </form>

      {/* Dropdown de Autocompletado Flotante */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50">
            <span>Resultados para &quot;{term}&quot;</span>
            <span className="text-[11px] text-slate-500 font-semibold">{totalMatches} encontrados</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {results.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No se encontraron productos coincidentes.
              </div>
            ) : (
              results.map((product) => {
                const prices = formatPrices(product.priceUsd, bcvRate);
                return (
                  <Link
                    key={product.id}
                    href={`/producto/${product.id}${product.codGrupo ? `?grupo=${product.codGrupo}` : ''}`}
                    onClick={() => setIsOpen(false)}
                    className="p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="relative h-12 w-12 shrink-0 rounded-lg bg-slate-50 border border-slate-100 p-1 overflow-hidden">
                      <Image
                        src={product.images[0] || IMAGE_FALLBACKS.product}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400 truncate block">
                        {product.brand}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 truncate">{product.name}</h4>
                      <p className="text-[11px] font-extrabold text-catador-blue mt-0.5">
                        {prices.usdFormatted} <span className="text-slate-500 font-semibold">({prices.vesFormatted})</span>
                      </p>
                    </div>
                    {product.inStock ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        En Stock
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        Agotado
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {results.length > 0 && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light transition-colors"
              >
                Ver todos los {totalMatches} resultados <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
