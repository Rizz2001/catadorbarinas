import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'discount' | 'amber' | 'gold' | 'blue' | 'navy' | 'success' | 'outline' | 'slate';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'blue',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-extrabold rounded-full select-none tabular-nums';

  const variants = {
    discount: 'bg-catador-discount text-white',
    amber: 'bg-catador-amber text-white',
    gold: 'bg-catador-amber-soft text-[#8B3E03] border border-catador-amber-oak/60',
    blue: 'bg-catador-blue text-white',
    navy: 'bg-catador-blue-dark text-white',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    outline: 'border border-slate-200 text-slate-700 bg-white',
    slate: 'bg-slate-100 text-slate-700',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 leading-tight',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
