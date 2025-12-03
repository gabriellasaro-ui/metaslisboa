import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SquadGoalCompletion {
  id: string;
  squad_goal_id: string;
  user_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useSquadGoalCompletions = (squadGoalId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get all completions for a squad goal (for coordinators to see engagement)
  const { data: completions = [], isLoading: isLoadingCompletions } = useQuery({
    queryKey: ['squad-goal-completions', squadGoalId],
    queryFn: async () => {
      if (!squadGoalId) return [];
      
      const { data, error } = await supabase
        .from('squad_goal_completions')
        .select('*')
        .eq('squad_goal_id', squadGoalId);

      if (error) throw error;
      return data as SquadGoalCompletion[];
    },
    enabled: !!squadGoalId
  });

  // Get current user's completion status for a goal
  const { data: userCompletion } = useQuery({
    queryKey: ['squad-goal-completion', squadGoalId, user?.id],
    queryFn: async () => {
      if (!squadGoalId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('squad_goal_completions')
        .select('*')
        .eq('squad_goal_id', squadGoalId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as SquadGoalCompletion | null;
    },
    enabled: !!squadGoalId && !!user?.id
  });

  // Toggle completion status
  const toggleCompletion = useMutation({
    mutationFn: async ({ goalId, completed }: { goalId: string; completed: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if record exists
      const { data: existing } = await supabase
        .from('squad_goal_completions')
        .select('id')
        .eq('squad_goal_id', goalId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('squad_goal_completions')
          .update({
            completed,
            completed_at: completed ? new Date().toISOString() : null
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('squad_goal_completions')
          .insert({
            squad_goal_id: goalId,
            user_id: user.id,
            completed,
            completed_at: completed ? new Date().toISOString() : null
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['squad-goal-completions'] });
      queryClient.invalidateQueries({ queryKey: ['squad-goal-completion', variables.goalId] });
    }
  });

  return {
    completions,
    userCompletion,
    isLoadingCompletions,
    toggleCompletion: toggleCompletion.mutate,
    isToggling: toggleCompletion.isPending
  };
};

// Hook to get all completions for all goals in a squad (for coordinator engagement view)
export const useAllSquadGoalCompletions = (squadId?: string | null) => {
  const { data: completions = [], isLoading } = useQuery({
    queryKey: ['all-squad-goal-completions', squadId],
    queryFn: async () => {
      if (!squadId) return [];
      
      // Get all goals for the squad first
      const { data: goals, error: goalsError } = await supabase
        .from('squad_goals')
        .select('id')
        .eq('squad_id', squadId);

      if (goalsError) throw goalsError;
      if (!goals || goals.length === 0) return [];

      const goalIds = goals.map(g => g.id);

      // Get all completions for these goals
      const { data, error } = await supabase
        .from('squad_goal_completions')
        .select('*')
        .in('squad_goal_id', goalIds);

      if (error) throw error;
      return data as SquadGoalCompletion[];
    },
    enabled: !!squadId
  });

  return { completions, isLoading };
};
