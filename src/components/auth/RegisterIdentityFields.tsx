'use client';

import { User, Phone, IdCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegisterIdentityFieldsProps {
  nombre: string;
  docPrefix: 'V' | 'E' | 'J' | 'G';
  cedulaNumero: string;
  telefono: string;
  onDocPrefixChange: (prefix: 'V' | 'E' | 'J' | 'G') => void;
  onFieldChange: (field: 'nombre' | 'cedulaNumero' | 'telefono', value: string) => void;
}

export function RegisterIdentityFields({
  nombre,
  docPrefix,
  cedulaNumero,
  telefono,
  onDocPrefixChange,
  onFieldChange,
}: RegisterIdentityFieldsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block font-extrabold text-slate-700 mb-1.5">Nombre y Apellido *</label>
        <div className="relative">
          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" strokeWidth={1.5}/>
          <input
            type="text"
            required
            autoComplete="name"
            value={nombre}
            onChange={(e) => onFieldChange('nombre', e.target.value)}
            placeholder="Ej: Carlos Pérez"
            className="w-full rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-4 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 focus:outline-none focus:border-catador-blue"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-extrabold text-slate-700 mb-1.5">Cédula o RIF *</label>
          <div className="flex items-center gap-1.5">
            <div className="inline-flex rounded-full bg-[#F7F8FA] border border-slate-200 p-0.5 shrink-0">
              {(['V', 'E', 'J', 'G'] as const).map((prefix) => (
                <button
                  key={prefix}
                  type="button"
                  onClick={() => onDocPrefixChange(prefix)}
                  className={cn(
                    'h-9 w-8 rounded-full text-xs font-black transition-colors cursor-pointer',
                    docPrefix === prefix ? 'bg-catador-blue text-white' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {prefix}
                </button>
              ))}
            </div>
            <div className="relative flex-1 min-w-0">
              <IdCard className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" strokeWidth={1.5}/>
              <input
                type="text"
                inputMode="numeric"
                required
                value={cedulaNumero}
                onChange={(e) => onFieldChange('cedulaNumero', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="18456789"
                className="w-full rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 focus:outline-none focus:border-catador-blue font-mono tabular-nums"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-extrabold text-slate-700 mb-1.5">Teléfono Móvil *</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" strokeWidth={1.5}/>
            <input
              type="tel"
              required
              autoComplete="tel"
              value={telefono}
              onChange={(e) => onFieldChange('telefono', e.target.value.replace(/[^0-9+\-\s]/g, '').slice(0, 15))}
              placeholder="0414-1234567"
              className="w-full rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-4 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 focus:outline-none focus:border-catador-blue font-mono tabular-nums"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

