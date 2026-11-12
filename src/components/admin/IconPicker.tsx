'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import {
  DynamicLucideIcon,
  LUCIDE_ICON_OPTIONS,
} from '@/components/ui/DynamicLucideIcon';
import { cn } from '@/lib/utils';

const ICON_KEYWORDS: Record<string, string> = {
  Wine: 'vino licor copa whisky ron botella',
  Beer: 'cerveza birra pilsen lúpulo jarra',
  CupSoda: 'refresco bebida soda vaso jugo',
  Coffee: 'cafe desayuno taza',
  Snowflake: 'hielo frio congelado',
  Flame: 'oferta caliente tendencia popular fuego flash',
  Zap: 'rapido relampago express rayo',
  Truck: 'delivery envio camion transporte despacho',
  Bike: 'moto delivery repartidor',
  MapPin: 'ubicacion mapa gps direccion tienda sede',
  Navigation: 'gps brujula ruta direccion',
  Compass: 'explorar mapa catalogo',
  Package: 'caja cerrada bulto empaque paquete',
  ShoppingBag: 'bolsa compras tienda pedido',
  ShoppingBasket: 'canasta viveres mercado despensa',
  ShoppingCart: 'carrito compras checkout',
  BadgePercent: 'descuento porcentaje promo rebaja oferta',
  Percent: 'descuento porcentaje tasa',
  Tag: 'etiqueta precio categoria',
  CreditCard: 'pago tarjeta transferencia zelle',
  ShieldCheck: 'garantia seguridad verificado proteccion',
  Lock: 'seguro candado privado',
  Clock: 'horario tiempo rapido countdown',
  Timer: 'contador reloj limite oferta',
  Sparkles: 'destacado premium nuevo edicion especial',
  Star: 'estrella favorito recomendado',
  Award: 'premio calidad top',
  Gift: 'regalo combo obsequio',
  Store: 'tienda bodegon sede local',
  Utensils: 'comida cocina viveres',
  Sandwich: 'pasapalos snacks comida',
  Cookie: 'dulces galletas snacks',
  RefreshCw: 'tasa bcv cambio actualizar',
};

interface IconPickerProps {
  value: string;
  onSelect: (iconName: string) => void;
}

/**
 * Selector visual de iconos Lucide con buscador por nombre/etiqueta en Español y grilla clicable.
 */
export function IconPicker({ value, onSelect }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const filteredIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LUCIDE_ICON_OPTIONS;
    return LUCIDE_ICON_OPTIONS.filter((iconName) => {
      const keywords = ICON_KEYWORDS[iconName] || '';
      return iconName.toLowerCase().includes(q) || keywords.includes(q);
    });
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Abrir selector visual de iconos"
        className={cn(
          'h-10 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shrink-0',
          open
            ? 'border-catador-blue bg-catador-blue/5 text-catador-blue'
            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
        )}
      >
        <DynamicLucideIcon
          name={value || 'Tag'}
          fallback="Tag"
          className="h-4 w-4 text-catador-blue shrink-0"
          strokeWidth={1.75}
        />
        <span className="hidden sm:inline text-[11px]">Elegir</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Catálogo visual de iconos Lucide"
          className="absolute right-0 z-50 mt-1.5 w-72 sm:w-80 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
        >
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
            <div className="relative flex items-center">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 pointer-events-none" strokeWidth={1.5} />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar: vino, envio, oferta, pago..."
                className="w-full h-8 rounded-lg border border-slate-200 bg-white pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>

          <div className="p-2 max-h-56 overflow-y-auto">
            {filteredIcons.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Sin coincidencias para &ldquo;{query}&rdquo;
              </p>
            ) : (
              <div className="grid grid-cols-6 gap-1.5">
                {filteredIcons.map((iconName) => {
                  const selected = value.trim().toLowerCase() === iconName.toLowerCase();
                  return (
                    <button
                      key={iconName}
                      type="button"
                      title={iconName}
                      aria-label={iconName}
                      onClick={() => {
                        onSelect(iconName);
                        setOpen(false);
                        setQuery('');
                      }}
                      className={cn(
                        'h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer',
                        selected
                          ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-xs'
                          : 'bg-white border-slate-100 text-slate-700 hover:border-catador-blue/40 hover:bg-blue-50/50 hover:text-catador-blue'
                      )}
                    >
                      <DynamicLucideIcon
                        name={iconName}
                        fallback="Tag"
                        className="h-4 w-4"
                        strokeWidth={selected ? 2 : 1.5}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>{filteredIcons.length} iconos Lucide</span>
            <span className="font-mono font-bold text-slate-700 truncate max-w-[130px]">
              {value || 'Tag'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

