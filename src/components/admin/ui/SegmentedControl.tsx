'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SegmentedContextValue {
  activeValue: string;
  onChange: (value: string) => void;
  fill: boolean;
}

const SegmentedContext = createContext<SegmentedContextValue | null>(null);

export interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  size?: 'sm' | 'md';
  layout?: 'fill' | 'auto';
  className?: string;
  children: ReactNode;
}

/**
 * Selector segmentado tipo píldora en Tailwind CSS puro para conmutar vistas del CMS.
 */
export function SegmentedControl({
  value,
  onChange,
  label,
  layout = 'auto',
  className,
  children,
}: SegmentedControlProps) {
  const fill = layout === 'fill';

  return (
    <SegmentedContext.Provider value={{ activeValue: value, onChange, fill }}>
      <div
        role="tablist"
        aria-label={label || 'Selector de sección'}
        className={cn(
          'flex p-1 bg-gray-100 rounded-lg max-w-full overflow-x-auto hide-scrollbar',
          fill ? 'w-full' : 'w-fit',
          className
        )}
      >
        {children}
      </div>
    </SegmentedContext.Provider>
  );
}

export interface SegmentedControlItemProps {
  value: string;
  label: string;
  icon?: ReactNode;
}

export function SegmentedControlItem({ value, label, icon }: SegmentedControlItemProps) {
  const ctx = useContext(SegmentedContext);
  if (!ctx) return null;

  const isActive = ctx.activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.onChange(value)}
      className={cn(
        ctx.fill && 'flex-1 justify-center',
        isActive
          ? 'flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm whitespace-nowrap transition-all cursor-pointer'
          : 'flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 rounded-md hover:text-gray-700 whitespace-nowrap transition-all cursor-pointer'
      )}
    >
      {icon ? <span className="shrink-0 flex items-center">{icon}</span> : null}
      <span>{label}</span>
    </button>
  );
}
