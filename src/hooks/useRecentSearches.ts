'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'catador_recent_searches_v1';
const EVENT_NAME = 'catador:search-recorded';
const MAX_TERMS = 6;

export function notifySearchRecorded(term: string) {
  if (typeof window === 'undefined') return;
  const clean = term.trim();
  if (clean.length < 2) return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const localList: string[] = raw ? JSON.parse(raw) : [];
    const updated = [
      clean,
      ...localList.filter((t) => t.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, MAX_TERMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: clean }));
  } catch {
    // Silencioso si localStorage está restringido
  }
}

export function useRecentSearches() {
  const [localTerms, setLocalTerms] = useState<string[]>([]);
  const [globalTerms, setGlobalTerms] = useState<string[]>([]);
  const [hiddenGlobalTerms, setHiddenGlobalTerms] = useState<string[]>([]);

  const loadLocal = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLocalTerms(parsed.filter((t): t is string => typeof t === 'string' && t.trim().length >= 2));
        }
      } else {
        setLocalTerms([]);
      }
    } catch {
      setLocalTerms([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLocal();
    }, 0);

    let active = true;
    fetch('/api/search/recent')
      .then((r) => (r.ok ? r.json() : { terms: [] }))
      .then((json) => {
        if (active && Array.isArray(json.terms)) {
          setGlobalTerms(json.terms);
        }
      })
      .catch(() => {});

    const handleStorageUpdate = () => loadLocal();
    window.addEventListener(EVENT_NAME, handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      active = false;
      clearTimeout(timer);
      window.removeEventListener(EVENT_NAME, handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [loadLocal]);

  // Combinar primero las búsquedas recientes del propio usuario y luego las búsquedas recientes de clientes en la tienda
  const combinedTerms = (() => {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const term of localTerms) {
      const key = term.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(term.trim());
      }
    }

    for (const term of globalTerms) {
      const key = term.trim().toLowerCase();
      if (!seen.has(key) && !hiddenGlobalTerms.includes(key)) {
        seen.add(key);
        result.push(term.trim());
      }
    }

    return result.slice(0, MAX_TERMS);
  })();

  const removeTerm = useCallback((termToRemove: string) => {
    const norm = termToRemove.trim().toLowerCase();
    setLocalTerms((prev) => {
      const next = prev.filter((t) => t.trim().toLowerCase() !== norm);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Silencioso
      }
      return next;
    });
    setHiddenGlobalTerms((prev) => (prev.includes(norm) ? prev : [...prev, norm]));
  }, []);

  const clearAllTerms = useCallback(() => {
    setLocalTerms([]);
    setHiddenGlobalTerms(globalTerms.map((t) => t.trim().toLowerCase()));
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silencioso
    }
  }, [globalTerms]);

  return {
    terms: combinedTerms,
    hasLocalTerms: localTerms.length > 0,
    removeTerm,
    clearAllTerms,
  };
}

