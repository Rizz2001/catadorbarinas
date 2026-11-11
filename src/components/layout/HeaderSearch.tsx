'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Product } from '@/types';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useCartStore } from '@/store/useCartStore';
import { notifySearchRecorded } from '@/hooks/useRecentSearches';
import { useSearchUserIdentity } from '@/hooks/useSearchUserIdentity';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { HeaderSearchDropdown } from './HeaderSearchDropdown';

export function HeaderSearch() {
  const router = useRouter();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const storeConfig = useStoreConfigStore((state) => state.config);
  const cmsLogo = storeConfig?.logo_url || IMAGE_FALLBACKS.product;
  const addItem = useCartStore((state) => state.addItem);
  const userInfo = useSearchUserIdentity();

  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

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
        const cleanTerm = term.trim();
        const params = new URLSearchParams({
          q: cleanTerm,
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
          if ((data.totalMatches || 0) > 0 && cleanTerm.length >= 3) {
            notifySearchRecorded(cleanTerm);
          }
        }
      } catch {
        // Silenciar error transitorio de red en autocompletado
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [term, userInfo.id, userInfo.email, userInfo.name]);

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
    const clean = term.trim();
    if (!clean) return;
    notifySearchRecorded(clean);
    setIsOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(clean)}`);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="flex items-center rounded-full border border-slate-200 bg-[#F7F8FA] focus-within:bg-white focus-within:border-[#0F172A] focus-within:ring-2 focus-within:ring-[#0F172A]/10 overflow-hidden transition-all"
      >
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => term.trim().length >= 2 && setIsOpen(true)}
          placeholder="¿Qué deseas brindar o comprar hoy?"
          className="w-full bg-transparent pl-5 pr-3 py-2 text-base md:text-sm font-medium text-slate-900 placeholder-slate-500 focus:outline-none min-h-[44px]"
        />

        {term && (
          <button
            type="button"
            onClick={() => {
              setTerm('');
              setIsOpen(false);
            }}
            className="p-2 text-slate-400 hover:text-slate-700 mr-0.5 cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          className="flex items-center justify-center h-11 w-12 bg-[#0F172A] hover:bg-[#001754] text-white transition-colors cursor-pointer shrink-0"
          aria-label="Buscar"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4 stroke-[2.5]" />
          )}
        </button>
      </form>

      {isOpen && (
        <HeaderSearchDropdown
          term={term}
          results={results}
          totalMatches={totalMatches}
          bcvRate={bcvRate}
          cmsLogo={cmsLogo}
          addedId={addedId}
          onSelectProduct={() => {
            notifySearchRecorded(term.trim());
            setIsOpen(false);
          }}
          onAddProduct={(product) => {
            addItem(product, 1);
            setAddedId(product.id);
            setTimeout(() => setAddedId(null), 1200);
          }}
          onViewAll={handleSubmit}
        />
      )}
    </div>
  );
}
