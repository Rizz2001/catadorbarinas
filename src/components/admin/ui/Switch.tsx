'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AdminSwitchProps {
  label?: string;
  description?: string;
  labelIcon?: ReactNode;
  labelPosition?: 'start' | 'end';
  labelSpacing?: 'spread' | 'compact';
  size?: 'sm' | 'md';
  value?: boolean;
  checked?: boolean;
  disabled?: boolean;
  isDisabled?: boolean;
  className?: string;
  onChange: (checked: boolean) => void;
}

/**
 * Interruptor estilo iOS construido 100% con utilidades puras de Tailwind CSS.
 */
export function Switch({
  label,
  description,
  labelIcon,
  labelPosition = 'end',
  labelSpacing = 'compact',
  value,
  checked,
  disabled,
  isDisabled,
  className,
  onChange,
}: AdminSwitchProps) {
  const isOn = Boolean(value ?? checked);
  const isLocked = Boolean(disabled ?? isDisabled);
  const hasText = Boolean((label && label.trim() !== '') || description || labelIcon);

  const labelContent = hasText ? (
    <span className="flex flex-col min-w-0">
      {(label || labelIcon) && (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
          {labelIcon}
          {label ? <span>{label}</span> : null}
        </span>
      )}
      {description && (
        <span className="text-[11px] font-normal text-slate-500 leading-snug mt-0.5">
          {description}
        </span>
      )}
    </span>
  ) : null;

  return (
    <label
      className={cn(
        'relative inline-flex items-center gap-3 select-none',
        labelSpacing === 'spread' && 'w-full justify-between',
        isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
    >
      {labelPosition === 'start' && labelContent}

      <span className="relative inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          checked={isOn}
          disabled={isLocked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
      </span>

      {labelPosition !== 'start' && labelContent}
    </label>
  );
}
