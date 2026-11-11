'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface SearchUserIdentity {
  id?: string;
  name?: string;
  email?: string;
}

export function useSearchUserIdentity(): SearchUserIdentity {
  const [userInfo, setUserInfo] = useState<SearchUserIdentity>({});

  useEffect(() => {
    let active = true;
    try {
      supabase.auth
        .getUser()
        .then(({ data: { user } }: { data: { user: { id: string; email?: string } | null } }) => {
          if (!user || !active) return;
          supabase
            .from('perfiles')
            .select('nombre')
            .eq('id', user.id)
            .single()
            .then(({ data: p }: { data: { nombre?: string } | null }) => {
              if (active) {
                setUserInfo({
                  id: user.id,
                  email: user.email,
                  name: p?.nombre || user.email?.split('@')[0],
                });
              }
            })
            .catch(() => {});
        })
        .catch(() => {});
    } catch {
      // Silenciar cuando el entorno cliente no define variables Supabase
    }
    return () => {
      active = false;
    };
  }, []);

  return userInfo;
}

