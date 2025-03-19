import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useAuth } from './useAuth';

export type Incident = Database['public']['Tables']['incidents']['Row'];

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setIncidents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('incidents_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIncidents((prev) => [payload.new as Incident, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setIncidents((prev) =>
            prev.map((incident) =>
              incident.id === payload.new.id ? (payload.new as Incident) : incident
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setIncidents((prev) => prev.filter((incident) => incident.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const reportIncident = async (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>) => {
    if (!session?.user) {
      throw new Error('Must be logged in to report incidents');
    }

    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          ...incident,
          reported_by: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to report incident');
    }
  };

  const updateIncident = async (
    id: string,
    updates: Partial<Omit<Incident, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!session?.user) {
      throw new Error('Must be logged in to update incidents');
    }

    try {
      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update incident');
    }
  };

  return {
    incidents,
    loading,
    error,
    reportIncident,
    updateIncident,
  };
}