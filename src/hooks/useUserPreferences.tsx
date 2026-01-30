import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserPreferences {
  id: string;
  user_id: string;
  push_notifications: boolean;
  email_notifications: boolean;
  dark_mode: boolean;
  language: string;
  show_online_status: boolean;
  two_factor_enabled: boolean;
  theme?: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setPreferences(null);
      setLoading(false);
    }
  }, [user]);

  // Realtime sync (multi-device / multi-tab)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-preferences-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // payload.new is the latest row
          if (payload.new) {
            setPreferences(payload.new as UserPreferences);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data as UserPreferences);
      } else {
        // Create default preferences
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        setPreferences(newPrefs as UserPreferences);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: any) => {
    if (!user || !preferences) return;

    // Optimistic update
    setPreferences(prev => prev ? { ...prev, [key]: value } : null);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ [key]: value })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Preferences saved successfully.",
        description: "Your changes have been synced.",
      });
    } catch (err) {
      console.error('Error updating preference:', err);
      // Revert on error
      fetchPreferences();
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    }
  };

  return { preferences, loading, updatePreference, refetch: fetchPreferences };
};
