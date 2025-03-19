import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useAuth } from './useAuth';

export type Route = Database['public']['Tables']['routes']['Row'];

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user) {
      setRoutes([]);
      setLoading(false);
      return;
    }

    const fetchRoutes = async () => {
      try {
        const { data, error } = await supabase
          .from('routes')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRoutes(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [session]);

  const saveRoute = async (route: Omit<Route, 'id' | 'created_at' | 'updated_at'>) => {
    if (!session?.user) {
      throw new Error('Must be logged in to save routes');
    }

    try {
      const { data, error } = await supabase
        .from('routes')
        .insert({
          ...route,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setRoutes((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save route');
    }
  };

  const deleteRoute = async (id: string) => {
    if (!session?.user) {
      throw new Error('Must be logged in to delete routes');
    }

    try {
      const { error } = await supabase.from('routes').delete().eq('id', id);
      if (error) throw error;
      setRoutes((prev) => prev.filter((route) => route.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete route');
    }
  };

  return {
    routes,
    loading,
    error,
    saveRoute,
    deleteRoute,
  };
}