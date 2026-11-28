'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabListContextValue {
  activeValue: string;
  onChange: (value: string) => void;
}

const TabListContext = createContext<TabListContextValue | null>(null);

export interface TabListProps {
  value: string;
  onChange: (value: string) => void;
  overflow?: 'scroll' | 'wrap';
  hasDivider?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Pestañas de navegación con borde inferior (Underline Tabs) en Tailwind CSS puro.
 */
export function TabList({
  value,
  onChange,
  overflow = 'scroll',
  hasDivider = true,
  className,
  children,
}: TabListProps) {
  return (
    <TabListContext.Provider value={{ activeValue: value, onChange }}>
      <div
        role="tablist"
        className={cn(
          'flex gap-3 sm:gap-5',
          hasDivider && 'border-b border-slate-200/80',
          overflow === 'scroll' ? 'overflow-x-auto scrollbar-none no-scrollbar hide-scrollbar px-1' : 'flex-wrap',
          className
        )}
      >
        {children}
      </div>
    </TabListContext.Provider>
  );
}

export interface TabProps {
  value: string;
  label: string;
  icon?: ReactNode;
}

export function Tab({ value, label, icon }: TabProps) {
  const ctx = useContext(TabListContext);
  if (!ctx) return null;

  const isActive = ctx.activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.onChange(value)}
      className={
        isActive
          ? 'flex items-center gap-2 py-3 text-[13px] font-semibold text-[#00227B] border-b-2 border-[#00227B] whitespace-nowrap shrink-0 transition-colors cursor-pointer'
          : 'flex items-center gap-2 py-3 text-[13px] font-medium text-slate-500 border-b-2 border-transparent hover:text-slate-800 hover:border-slate-300 whitespace-nowrap shrink-0 transition-colors cursor-pointer'
      }
    >
      {icon ? <span className="shrink-0 flex items-center">{icon}</span> : null}
      <span>{label}</span>
    </button>
  );
}
