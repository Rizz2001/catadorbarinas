'use client';

import { Clock } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';

function toDatetimeLocalValue(isoString: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

interface FlashSaleDatetimeFieldProps {
  isoValue: string;
  onChangeIso: (iso: string) => void;
}

/**
 * Selector datetime-local para campaign_end_date con presets rápidos y preview de contador.
 */
export function FlashSaleDatetimeField({
  isoValue,
  onChangeIso,
}: FlashSaleDatetimeFieldProps) {
  const countdown = useCountdown(isoValue);
  const localInputValue = toDatetimeLocalValue(isoValue);

  const applyPresetHours = (hoursFromNow: number) => {
    onChangeIso(new Date(Date.now() + hoursFromNow * 3600 * 1000).toISOString());
  };

  const applyTodayMidnight = () => {
    const end = new Date();
    end.setHours(23, 59, 0, 0);
    onChangeIso(end.toISOString());
  };

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between gap-2 mb-1">
        <label className="block text-[11px] font-bold text-slate-700">
          Fin de Campaña (<code className="font-mono">campaign_end_date</code>)
        </label>
        <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full tabular-nums">
          <Clock className="h-3 w-3" strokeWidth={2} />
          {countdown.isExpired
            ? 'Finalizada'
            : `${countdown.days}d ${String(countdown.hours).padStart(2, '0')}h ${String(
                countdown.minutes
              ).padStart(2, '0')}m ${String(countdown.seconds).padStart(2, '0')}s`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="datetime-local"
          value={localInputValue}
          onChange={(e) => {
            if (!e.target.value) return;
            const parsed = new Date(e.target.value);
            if (!Number.isNaN(parsed.getTime())) onChangeIso(parsed.toISOString());
          }}
          className="flex-1 min-w-[200px] h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 tabular-nums"
        />
        <button
          type="button"
          onClick={() => applyPresetHours(6)}
          className="h-10 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 cursor-pointer"
        >
          +6h
        </button>
        <button
          type="button"
          onClick={applyTodayMidnight}
          className="h-10 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 cursor-pointer"
        >
          Hoy 23:59
        </button>
        <button
          type="button"
          onClick={() => applyPresetHours(72)}
          className="h-10 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 cursor-pointer"
        >
          +3 días
        </button>
      </div>
    </div>
  );
}

