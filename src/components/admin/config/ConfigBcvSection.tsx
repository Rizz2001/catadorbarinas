'use client';

import React from 'react';
import { RefreshCw, Coins, AlertCircle } from 'lucide-react';
import { Button } from '@astryxdesign/core/Button';
import { Switch } from '@astryxdesign/core/Switch';
import { StoreConfig } from '@/types';
import { useBcvStore } from '@/store/useBcvStore';

interface ConfigBcvSectionProps {
  form: Partial<StoreConfig>;
  onChange: (patch: Partial<StoreConfig>) => void;
}

export function ConfigBcvSection({ form, onChange }: ConfigBcvSectionProps) {
  const { rateInfo, fetchRate, isLoading } = useBcvStore();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-catador-amber" />
          <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Control de Tasa Oficial BCV
          </h2>
        </div>

        <Button
          label="Sincronizar DolarApi"
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="h-3.5 w-3.5" />}
          isLoading={isLoading}
          onClick={() => fetchRate(true)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-catador-blue tracking-wider block">
            Tasa Oficial BCV Actual (DolarApi)
          </span>
          <div className="text-2xl font-black text-catador-blue tabular-nums">
            Bs. {rateInfo.rate.toFixed(2)} / $
          </div>
          <p className="text-[10px] text-slate-500" suppressHydrationWarning>
            Última actualización:{' '}
            {mounted ? new Date(rateInfo.lastUpdated).toLocaleString('es-VE') : 'Sincronizada'} ({rateInfo.source})
          </p>
        </div>

        <div className="space-y-3">
          <Switch
            label="Forzar Tasa BCV Manual Fija"
            description="Sobrescribe temporalmente la lectura automática de DolarApi"
            value={Boolean(form.bcv_usar_manual)}
            onChange={(checked) => onChange({ bcv_usar_manual: checked })}
          />

          {form.bcv_usar_manual && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="block font-bold text-slate-700 text-xs">Tasa Manual Personalizada (Bs. / USD)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={form.bcv_tasa_manual ?? rateInfo.rate}
                onChange={(e) => onChange({ bcv_tasa_manual: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-amber/20"
                placeholder="Ej: 885.50"
              />
              <p className="flex items-center gap-1 text-[10px] text-amber-700 font-medium">
                <AlertCircle className="h-3 w-3 shrink-0" />
                Al activar esto, la tienda usará esta tasa fija en lugar de la consulta automática.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
