'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, RefreshCw, Loader2, Search } from 'lucide-react';
import { Switch } from '@astryxdesign/core/Switch';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { AlertDialog } from '@astryxdesign/core/AlertDialog';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { useToast } from '@astryxdesign/core/Toast';
import { SearchLogEntry } from '@/types';
import { getSearchLogs, clearSearchLogs } from '@/services/cms.service';

export default function AdminBusquedasPage() {
  const showToast = useToast();
  const [logs, setLogs] = useState<SearchLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyRegistered, setOnlyRegistered] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

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

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5">
            <Switch
              label="Solo Registrados"
              size="sm"
              labelPosition="start"
              value={onlyRegistered}
              onChange={setOnlyRegistered}
            />
          </div>

          <Button
            label="Actualizar"
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            isLoading={loading}
            onClick={() => void loadLogs()}
          />

          {logs.length > 0 && (
            <Button
              label="Limpiar"
              variant="destructive"
              size="sm"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={() => setConfirmClearOpen(true)}
            />
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
          <div className="p-8">
            <EmptyState
              isCompact
              icon={<Search className="h-8 w-8 text-slate-400" />}
              title="No hay registros de búsquedas"
              description="No se encontraron términos registrados para el filtro seleccionado."
            />
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
                    <Badge
                      variant={log.resultados_count > 0 ? 'success' : 'error'}
                      label={`${log.resultados_count} resultados`}
                    />
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

      <AlertDialog
        isOpen={confirmClearOpen}
        onOpenChange={(open) => {
          if (!open && !clearing) setConfirmClearOpen(false);
        }}
        title="Vaciar Bitácora de Búsquedas"
        description="Se eliminará todo el historial de búsquedas registrado. Esta acción no afectará los productos del catálogo."
        cancelLabel="Cancelar"
        actionLabel="Vaciar Bitácora"
        actionVariant="destructive"
        isActionLoading={clearing}
        onAction={async () => {
          setClearing(true);
          try {
            await clearSearchLogs();
            await loadLogs();
            showToast({ body: 'Bitácora de búsquedas vaciada correctamente.' });
            setConfirmClearOpen(false);
          } finally {
            setClearing(false);
          }
        }}
      />
    </main>
  );
}
