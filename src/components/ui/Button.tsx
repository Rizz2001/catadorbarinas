import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'navy' | 'secondary' | 'amber' | 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  shape?: 'default' | 'pill' | 'circular';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      shape = 'default',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variants = {
      primary:
        'bg-catador-blue text-white hover:bg-catador-blue-dark focus-visible:ring-catador-blue',
      navy: 'bg-catador-navy text-white hover:bg-slate-800 focus-visible:ring-catador-navy',
      secondary:
        'bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-300',
      amber:
        'bg-catador-amber text-white hover:bg-catador-amber-dark focus-visible:ring-catador-amber',
      gold: 'bg-catador-amber-soft text-[#8B3E03] border border-catador-amber-oak/60 hover:bg-[#FDE68A] focus-visible:ring-catador-amber',
      outline:
        'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 focus-visible:ring-slate-400',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    };

    const shapes = {
      default: 'rounded-xl',
      pill: 'rounded-full',
      circular: 'rounded-full p-0',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-xs gap-1.5',
      md: 'h-11 px-5 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-11 w-11 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(baseStyles, variants[variant], shapes[shape], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
