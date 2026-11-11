'use client';

import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useRecentSearches } from '@/hooks/useRecentSearches';

const POPULAR_SEARCHES = [
  { name: "Buchanan's", href: '/buscar?q=buchanans' },
  { name: 'Santa Teresa 1796', href: '/buscar?q=santa%20teresa%201796' },
  { name: 'Polar Pilsen', href: '/buscar?q=polar%20pilsen' },
  { name: 'Corona', href: '/buscar?q=corona' },
  { name: 'Harina P.A.N.', href: '/buscar?q=harina%20pan' },
];

export function HeaderSearchTrends() {
  const { terms: recentTerms, hasLocalTerms, removeTerm, clearAllTerms } = useRecentSearches();
  const displayRecent = recentTerms;

  return (
    <div className="flex items-center justify-between gap-2 pt-1.5 text-[13px] text-slate-600 overflow-hidden">
      {displayRecent.length > 0 ? (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="font-extrabold text-catador-blue shrink-0 text-xs uppercase tracking-wide">
            RECIENTES:
          </span>
          {displayRecent.map((term, idx) => (
            <React.Fragment key={term}>
              <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
                <Link
                  href={`/buscar?q=${encodeURIComponent(term)}`}
                  className="text-slate-700 hover:text-catador-blue font-semibold transition-colors"
                >
                  {term}
                </Link>
                <button
                  type="button"
                  onClick={() => removeTerm(term)}
                  title={`Quitar "${term}" de recientes`}
                  aria-label={`Quitar ${term}`}
                  className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
              {idx < displayRecent.length - 1 && (
                <span className="text-slate-300 select-none">·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="font-black text-catador-blue uppercase tracking-wider text-xs shrink-0">
            POPULAR:
          </span>
          {POPULAR_SEARCHES.map((item, idx) => (
            <React.Fragment key={item.name}>
              <Link
                href={item.href}
                className="text-slate-700 hover:text-catador-blue font-semibold whitespace-nowrap transition-colors"
              >
                {item.name}
              </Link>
              {idx < POPULAR_SEARCHES.length - 1 && (
                <span className="text-slate-300 select-none">·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {recentTerms.length > 0 && hasLocalTerms && (
        <button
          type="button"
          onClick={clearAllTerms}
          className="text-xs font-bold text-slate-500 hover:text-rose-600 shrink-0 transition-colors cursor-pointer ml-auto"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}

