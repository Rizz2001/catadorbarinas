'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SmartVentasGroup, SmartVentasSubgroup } from './LiveCatalogSection';
import { cn } from '@/lib/utils';

interface LiveCatalogFilterBarProps {
  groups: SmartVentasGroup[];
  subgroups: SmartVentasSubgroup[];
  selectedGroup: string;
  selectedSubgroup: string;
  currentGroupName: string;
  onSelectGroup: (codGrupo: string) => void;
  onSelectSubgroup: (codSubgrupo: string) => void;
}

export function LiveCatalogFilterBar({
  groups,
  subgroups,
  selectedGroup,
  selectedSubgroup,
  currentGroupName,
  onSelectGroup,
  onSelectSubgroup,
}: LiveCatalogFilterBarProps) {
  const deptScrollRef = useRef<HTMLDivElement>(null);
  const subScrollRef = useRef<HTMLDivElement>(null);

  const scrollHorizontally = (
    ref: React.RefObject<HTMLDivElement | null>,
    amount: number
  ) => {
    ref.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3">
      <div className="relative flex items-center gap-1.5 w-full min-w-0">
        <button
          type="button"
          onClick={() => scrollHorizontally(deptScrollRef, -260)}
          aria-label="Desplazar departamentos a la izquierda"
          className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-catador-blue hover:text-catador-blue transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5}/>
        </button>

        <div className="relative flex-1 min-w-0 overflow-hidden">
          <div
            ref={deptScrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none w-full"
          >
            {groups.map((group) => {
              const isActive = group.CodGrupo === selectedGroup;
              return (
                <button
                  key={group.CodGrupo}
                  type="button"
                  onClick={() => onSelectGroup(group.CodGrupo)}
                  className={cn(
                    'px-4 py-2 min-h-[40px] text-[13px] sm:text-sm font-extrabold rounded-full transition-colors whitespace-nowrap cursor-pointer border shrink-0',
                    isActive
                      ? 'bg-catador-blue text-white border-catador-blue'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-catador-blue hover:text-catador-blue'
                  )}
                >
                  {group.Nombre}
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-[#F7F8FA] to-transparent" />
        </div>

        <button
          type="button"
          onClick={() => scrollHorizontally(deptScrollRef, 260)}
          aria-label="Desplazar departamentos a la derecha"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-catador-blue hover:text-catador-blue transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5}/>
        </button>
      </div>

      {subgroups.length > 0 && (
        <div className="relative flex items-center gap-1 border-b border-slate-200 w-full min-w-0">
          <button
            type="button"
            onClick={() => scrollHorizontally(subScrollRef, -220)}
            aria-label="Subcategorías anteriores"
            className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:text-catador-blue hover:bg-slate-200/60 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5}/>
          </button>

          <div className="relative flex-1 min-w-0 overflow-hidden">
            <div
              ref={subScrollRef}
              className="flex items-center gap-4 sm:gap-5 overflow-x-auto pr-8 scrollbar-none w-full"
            >
              <button
                type="button"
                onClick={() => onSelectSubgroup('todos')}
                className={cn(
                  'py-2 text-[13px] sm:text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer shrink-0',
                  selectedSubgroup === 'todos'
                    ? 'border-catador-amber text-catador-blue font-black'
                    : 'border-transparent text-slate-600 font-semibold hover:text-slate-900 hover:border-slate-300'
                )}
              >
                Todos ({currentGroupName})
              </button>
              {subgroups.map((sub) => {
                const isSubActive = sub.CodSubgrupo === selectedSubgroup;
                return (
                  <button
                    key={sub.CodSubgrupo}
                    type="button"
                    onClick={() => onSelectSubgroup(sub.CodSubgrupo)}
                    className={cn(
                      'py-2 text-[13px] sm:text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer shrink-0',
                      isSubActive
                        ? 'border-catador-amber text-catador-blue font-black'
                        : 'border-transparent text-slate-600 font-semibold hover:text-slate-900 hover:border-slate-300'
                    )}
                  >
                    {sub.Nombre}
                  </button>
                );
              })}
            </div>
            <div className="pointer-events-none absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-[#F7F8FA] to-transparent" />
          </div>

          <button
            type="button"
            onClick={() => scrollHorizontally(subScrollRef, 220)}
            aria-label="Más subcategorías"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:text-catador-blue hover:bg-slate-200/60 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5}/>
          </button>
        </div>
      )}
    </div>
  );
}

