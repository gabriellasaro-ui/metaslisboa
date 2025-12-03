import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  health_score_change: boolean;
  goal_completed: boolean;
  goal_failed: boolean;
  new_check_in: boolean;
  squad_goal_progress: boolean;
  client_at_risk: boolean;
  sound_enabled: boolean;
  created_at: string;
  updated_at: string;
}

const defaultPreferences: Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  health_score_change: true,
  goal_completed: true,
  goal_failed: true,
  new_check_in: true,
  squad_goal_progress: true,
  client_at_risk: true,
  sound_enabled: true,
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Se não existe, criar preferências default
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData as NotificationPreferences;
      }
      
      return data as NotificationPreferences;
    },
    enabled: !!user?.id
  });

  const updatePreference = useMutation({
    mutationFn: async ({ key, value }: { key: keyof typeof defaultPreferences; value: boolean }) => {
      if (!user?.id || !preferences?.id) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('notification_preferences')
        .update({ [key]: value })
        .eq('id', preferences.id);

      if (error) throw error;
    },
    onMutate: async ({ key, value }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notification-preferences', user?.id] });
      const previous = queryClient.getQueryData(['notification-preferences', user?.id]);
      
      queryClient.setQueryData(['notification-preferences', user?.id], (old: NotificationPreferences | null) => {
        if (!old) return old;
        return { ...old, [key]: value };
      });
      
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notification-preferences', user?.id], context.previous);
      }
      toast({
        title: "Erro ao salvar preferência",
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
    }
  });

  const updateAllPreferences = useMutation({
    mutationFn: async (updates: Partial<typeof defaultPreferences>) => {
      if (!user?.id || !preferences?.id) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('id', preferences.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
      toast({
        title: "Preferências salvas",
        description: "Suas preferências de notificação foram atualizadas."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar preferências",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    preferences: preferences || null,
    isLoading,
    updatePreference: updatePreference.mutate,
    updateAllPreferences: updateAllPreferences.mutate,
    isUpdating: updatePreference.isPending || updateAllPreferences.isPending
  };
};
