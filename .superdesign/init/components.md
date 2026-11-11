# Shared UI Primitives (`src/components/ui/`)

## Button (`src/components/ui/Button.tsx`)
- **Description:** Atomic button primitive supporting `primary` (`#0F172A`), `navy`, `amber`, `gold`, `secondary`, `outline`, `ghost`, and `danger` variants with `default`, `pill`, and `circular` shapes.
- **Key Props:** `variant`, `size`, `shape`, `isLoading`, `leftIcon`, `rightIcon`

```tsx
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
      'inline-flex items-center justify-center font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

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
```

## Badge (`src/components/ui/Badge.tsx`)
- **Description:** Atomic pill badge with `tabular-nums` for discounts, golden wholesale tags (`Caja xN`), and status indicators.

```tsx
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
```

