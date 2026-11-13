'use client';

import Image from 'next/image';

interface ConfigLogoPreviewProps {
  currentLogo: string;
  currentHeight: number;
  currentWidth: number;
}

export function ConfigLogoPreview({
  currentLogo,
  currentHeight,
  currentWidth,
}: ConfigLogoPreviewProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-700 text-xs">
          Vista Previa en Tiempo Real ({currentHeight}px alto × {currentWidth}px ancho máx)
        </span>
        <span className="text-[10px] text-slate-500 font-medium">
          Simulación idéntica a la tienda
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Simulación en Cabecera */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-3.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              1. En la Barra de Navegación (Header)
            </span>
            <span className="text-[10px] font-mono text-catador-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              H: {currentHeight}px
            </span>
          </div>

          <div className="min-h-22 bg-[#F7F8FA] rounded-lg border border-dashed border-slate-200 flex items-center gap-3 px-4 py-2 overflow-hidden">
            <div className="flex items-center gap-2.5 shrink-0">
              <div
                className="relative rounded-xl bg-white border border-slate-200/80 p-1 shadow-2xs overflow-hidden transition-all duration-200"
                style={{
                  height: `${Math.min(56, Math.max(36, currentHeight))}px`,
                  width: `${Math.round(Math.min(56, Math.max(36, currentHeight)) * 1.15)}px`,
                }}
              >
                <Image
                  src={currentLogo}
                  alt="Vista previa del logo en Header"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-[#0F172A] leading-none">
                  El Catador
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B6683E] mt-1">
                  Bodegón & Supermercado
                </span>
              </div>
            </div>
            {/* Elementos simulados de navegación a la derecha */}
            <div className="hidden sm:flex items-center gap-2 ml-auto select-none pointer-events-none">
              <div className="h-8 w-28 rounded-full bg-white border border-slate-200" />
              <div className="h-8 w-20 rounded-full bg-[#D99B38]/90" />
              <div className="h-8 w-8 rounded-full bg-[#0F172A]" />
            </div>
          </div>
        </div>

        {/* Simulación en Tarjeta de Producto */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            2. En Producto sin Foto
          </span>
          <div className="aspect-square bg-slate-50/90 rounded-lg border border-dashed border-slate-200 flex items-center justify-center p-3 overflow-hidden relative">
            <Image
              src={currentLogo}
              alt="Vista previa logo en producto"
              fill
              sizes="160px"
              className="object-contain p-5 opacity-80 transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
