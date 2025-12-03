import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SquadGoalCycle {
  id: string;
  squad_goal_id: string;
  cycle_number: number;
  cycle_start_date: string;
  cycle_end_date: string;
  target_value: number;
  achieved_value: number;
  completion_rate: number;
  total_participants: number;
  completed_participants: number;
  created_at: string;
}

export const useSquadGoalCycles = (squadGoalId?: string) => {
  const { data: cycles = [], isLoading } = useQuery({
    queryKey: ['squad-goal-cycles', squadGoalId],
    queryFn: async () => {
      if (!squadGoalId) return [];
      
      const { data, error } = await supabase
        .from('squad_goal_cycles')
        .select('*')
        .eq('squad_goal_id', squadGoalId)
        .order('cycle_number', { ascending: false });

      if (error) throw error;
      return data as SquadGoalCycle[];
    },
    enabled: !!squadGoalId
  });

  return { cycles, isLoading };
};

// Get all cycles for all goals in a squad
export const useAllSquadGoalCycles = (squadId?: string | null) => {
  const { data: cycles = [], isLoading } = useQuery({
    queryKey: ['all-squad-goal-cycles', squadId],
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

      // Get all cycles for these goals
      const { data, error } = await supabase
        .from('squad_goal_cycles')
        .select('*')
        .in('squad_goal_id', goalIds)
        .order('cycle_end_date', { ascending: false });

      if (error) throw error;
      return data as SquadGoalCycle[];
    },
    enabled: !!squadId
  });

  return { cycles, isLoading };
};
