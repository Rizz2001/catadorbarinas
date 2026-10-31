'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, UserCheck, AlertTriangle, TrendingUp, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { SearchLogEntry } from '@/types';
import { getSearchLogs, clearSearchLogs } from '@/services/cms.service';
import { cn } from '@/lib/utils';

export default function AdminBusquedasPage() {
  const [logs, setLogs] = useState<SearchLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyRegistered, setOnlyRegistered] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getSearchLogs(300);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getSearchLogs(300).then((data) => {
      if (active) {
        setLogs(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredLogs = useMemo(() => {
    if (!onlyRegistered) return logs;
    return logs.filter((l) => Boolean(l.usuario_id || l.usuario_email || l.usuario_nombre));
  }, [logs, onlyRegistered]);

  // Top Términos Más Buscados
  const topTerms = useMemo(() => {
    const counts = new Map<string, { term: string; count: number; results: number }>();
    filteredLogs.forEach((l) => {
      const key = l.termino_normalizado || l.termino.toLowerCase();
      const prev = counts.get(key);
      counts.set(key, {
        term: prev?.term || l.termino,
        count: (prev?.count || 0) + 1,
        results: l.resultados_count,
      });
    });
    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredLogs]);

  // Términos con 0 Resultados (Oportunidades Comerciales)
  const zeroResultTerms = useMemo(() => {
    const map = new Map<string, { term: string; count: number }>();
    filteredLogs
      .filter((l) => l.resultados_count === 0)
      .forEach((l) => {
        const key = l.termino_normalizado || l.termino.toLowerCase();
        const prev = map.get(key);
        map.set(key, {
          term: prev?.term || l.termino,
          count: (prev?.count || 0) + 1,
        });
      });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredLogs]);

  return (
    <main className="p-4 sm:p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-catador-blue text-white">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Inteligencia y Registro de Búsquedas de Usuarios
            </h1>
            <p className="text-xs text-slate-500">
              Analiza qué productos buscan tus usuarios registrados y detecta demanda insatisfecha
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyRegistered(!onlyRegistered)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer',
              onlyRegistered
                ? 'bg-catador-blue text-white border-catador-blue'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            )}
          >
            <UserCheck className="h-4 w-4" />
            <span>Solo Usuarios Registrados</span>
          </button>

          <button
            type="button"
            onClick={() => void loadLogs()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Actualizar
          </button>

          {logs.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                await clearSearchLogs();
                await loadLogs();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Limpiar Historial
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas de Resumen de Inteligencia Comercial */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Top Productos Más Buscados
          </h2>
          {topTerms.length === 0 ? (
            <p className="text-slate-400">Aún no hay búsquedas registradas.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topTerms.map((item) => (
                <div
                  key={item.term}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <span className="font-extrabold text-slate-900">{item.term}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-catador-blue text-white font-black text-[10px]">
                    {item.count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Búsquedas Sin Resultados (Oportunidades de Inventario)
          </h2>
          {zeroResultTerms.length === 0 ? (
            <p className="text-slate-400">Todas las búsquedas recientes arrojaron resultados en stock.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {zeroResultTerms.map((item) => (
                <div
                  key={item.term}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200"
                >
                  <span className="font-extrabold text-amber-950">{item.term}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-600 text-white font-black text-[10px]">
                    {item.count} búsquedas
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Tabla / Bitácora por Usuario */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Bitácora en Tiempo Real ({filteredLogs.length} registros)
          </h3>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-catador-blue" />
            <span>Cargando historial de búsquedas...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No hay registros de búsquedas para el filtro seleccionado.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">
                      &ldquo;{log.termino}&rdquo;
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-black',
                        log.resultados_count > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      )}
                    >
                      {log.resultados_count} resultados
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Cliente:{' '}
                    <strong className="text-slate-800">
                      {log.usuario_nombre || log.usuario_email || 'Visitante Web'}
                    </strong>
                    {log.usuario_email && log.usuario_nombre ? ` (${log.usuario_email})` : ''}
                  </p>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(log.created_at).toLocaleString('es-VE')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
