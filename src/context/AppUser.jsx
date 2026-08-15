import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AppUserCtx = createContext(null);

export function AppUserProvider({ userId, children }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (active) {
          setMe(data);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) return null;

  return <AppUserCtx.Provider value={me}>{children}</AppUserCtx.Provider>;
}

export function useAppUser() {
  return useContext(AppUserCtx);
}

export function useIsFullAdmin() {
  const me = useAppUser();
  return me?.role === 'admin';
}
