import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'discount' | 'amber' | 'blue' | 'success' | 'outline' | 'slate';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'blue',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-bold rounded-full select-none';

  const variants = {
    discount: 'bg-catador-discount text-white shadow-xs',
    amber: 'bg-catador-amber text-white shadow-xs',
    blue: 'bg-catador-blue text-white shadow-xs',
    success: 'bg-emerald-600 text-white',
    outline: 'border border-slate-300 text-slate-700 bg-white',
    slate: 'bg-slate-100 text-slate-700',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 leading-none',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
