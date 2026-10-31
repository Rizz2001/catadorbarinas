'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Loader2, ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatPrices } from '@/lib/currency';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useCartStore } from '@/store/useCartStore';
import { supabase } from '@/lib/supabase/client';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { cn } from '@/lib/utils';

export function HeaderSearch() {
  const router = useRouter();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const storeConfig = useStoreConfigStore((state) => state.config);
  const cmsLogo = storeConfig?.logo_url || IMAGE_FALLBACKS.product;
  const addItem = useCartStore((state) => state.addItem);
  const [userInfo, setUserInfo] = useState<{
    id?: string;
    name?: string;
    email?: string;
  }>({});

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string; email?: string } | null } }) => {
      if (!user || !active) return;
      supabase
        .from('perfiles')
        .select('nombre')
        .eq('id', user.id)
        .single()
        .then(({ data: p }: { data: { nombre?: string } | null }) => {
          if (active) {
            setUserInfo({
              id: user.id,
              email: user.email,
              name: p?.nombre || user.email?.split('@')[0],
            });
          }
        });
    });
    return () => {
      active = false;
    };
  }, []);

  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search effect
  useEffect(() => {
    if (term.trim().length < 2) {
      const resetTimer = setTimeout(() => {
        setResults([]);
        setTotalMatches(0);
        setIsOpen(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: term.trim(),
          limit: '6',
          log: 'true',
        });
        if (userInfo.id) params.set('userId', userInfo.id);
        if (userInfo.name) params.set('userName', userInfo.name);
        if (userInfo.email) params.set('userEmail', userInfo.email);

        const res = await fetch(`/api/search?${params.toString()}`);
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
    }, 350);

    return () => clearTimeout(timer);
  }, [term, userInfo.id, userInfo.email, userInfo.name]);

  // Click outside y tecla Escape para cerrar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[70vh] flex flex-col">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50 shrink-0">
            <span className="truncate pr-2">Resultados para &quot;{term}&quot;</span>
            <span className="text-[11px] text-slate-500 font-semibold shrink-0">{totalMatches} encontrados</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 flex-1">
            {results.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No se encontraron productos coincidentes.
              </div>
            ) : (
              results.map((product) => {
                const prices = formatPrices(product.priceUsd, bcvRate);
                const rawImg = product.images?.[0];
                const hasNoImg = !rawImg || rawImg === IMAGE_FALLBACKS.product || rawImg.includes('logo');
                const imgSrc = hasNoImg ? cmsLogo : rawImg;
                const isItemAdded = addedId === product.id;

                return (
                  <Link
                    key={product.id}
                    href={`/producto/${product.id}${product.codGrupo ? `?grupo=${product.codGrupo}` : ''}`}
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="relative h-12 w-12 shrink-0 rounded-xl bg-slate-50 border border-slate-100 p-1 overflow-hidden flex items-center justify-center">
                      <Image
                        src={imgSrc}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className={cn(
                          'object-contain transition-transform duration-200',
                          hasNoImg ? 'p-2 opacity-80' : 'group-hover:scale-105'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-amber-600/80 tracking-wider truncate">
                          {product.brand}
                        </span>
                        {product.inStock ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full shrink-0">
                            En Stock
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full shrink-0">
                            Agotado
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-catador-blue transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-black text-slate-900">{prices.usdFormatted}</span>
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60">
                          {prices.vesFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Botón de Agregar Rápido al Carrito */}
                    <button
                      type="button"
                      disabled={!product.inStock}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem(product, 1);
                        setAddedId(product.id);
                        setTimeout(() => setAddedId(null), 1200);
                      }}
                      aria-label={`Agregar ${product.name} al carrito`}
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer shadow-2xs',
                        !product.inStock
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : isItemAdded
                          ? 'bg-emerald-600 text-white scale-105'
                          : 'bg-slate-100 text-slate-700 hover:bg-catador-blue hover:text-white'
                      )}
                    >
                      {isItemAdded ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                    </button>
                  </Link>
                );
              })
            )}
          </div>

          {results.length > 0 && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center shrink-0">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light transition-colors cursor-pointer"
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
