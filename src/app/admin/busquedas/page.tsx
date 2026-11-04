'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UserCheck, Trash2, RefreshCw, Loader2 } from 'lucide-react';
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

  const registeredCount = useMemo(
    () => logs.filter((l) => Boolean(l.usuario_id || l.usuario_email || l.usuario_nombre)).length,
    [logs]
  );

  const zeroResultsCount = useMemo(
    () => logs.filter((l) => l.resultados_count === 0).length,
    [logs]
  );

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
    <main className="p-4 sm:p-6 space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
            Inteligencia de Búsquedas de Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro de términos buscados por usuarios registrados y detección de demanda insatisfecha
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyRegistered(!onlyRegistered)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer',
              onlyRegistered
                ? 'bg-catador-blue text-white border-catador-blue'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            )}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Solo Registrados</span>
          </button>

          <button
            type="button"
            onClick={() => void loadLogs()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Banda de KPIs Reconciliados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 rounded-xl bg-white border border-slate-200/90 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90 tabular-nums">
        <div className="p-4">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Consultas Registradas
          </span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">{logs.length}</span>
        </div>
        <div className="p-4">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Búsquedas de Clientes con Cuenta
          </span>
          <span className="text-2xl font-black text-catador-blue mt-0.5 block">
            {registeredCount}
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Búsquedas con 0 Resultados (Oportunidades)
          </span>
          <span className="text-2xl font-black text-catador-amber mt-0.5 block">
            {zeroResultsCount}
          </span>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <section className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-3">
          <h2 className="text-xs font-extrabold text-slate-900">
            Términos con Mayor Demanda
          </h2>
          {topTerms.length === 0 ? (
            <p className="text-slate-400">Aún no hay búsquedas registradas.</p>
          ) : (
            <div className="flex flex-wrap gap-2 tabular-nums">
              {topTerms.map((item) => (
                <div
                  key={item.term}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <span className="font-bold text-slate-900">{item.term}</span>
                  <span className="px-1.5 py-0.5 rounded bg-catador-blue text-white font-black text-[10px]">
                    {item.count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-3">
          <h2 className="text-xs font-extrabold text-slate-900">
            Artículos Buscados Sin Existencia Actual
          </h2>
          {zeroResultTerms.length === 0 ? (
            <p className="text-slate-400">
              Todas las búsquedas recientes encontraron stock disponible.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 tabular-nums">
              {zeroResultTerms.map((item) => (
                <div
                  key={item.term}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200"
                >
                  <span className="font-bold text-amber-950">{item.term}</span>
                  <span className="px-1.5 py-0.5 rounded bg-catador-amber text-white font-black text-[10px]">
                    {item.count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Bitácora Cronológica */}
      <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 tabular-nums">
            Bitácora de Búsquedas ({filteredLogs.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-catador-blue" />
            <span>Cargando bitácora...</span>
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
                className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-black text-slate-900 text-sm">
                      &ldquo;{log.termino}&rdquo;
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-bold',
                        log.resultados_count > 0
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
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

                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
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
