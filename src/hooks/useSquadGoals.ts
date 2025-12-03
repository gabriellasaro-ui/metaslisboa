import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SquadGoal {
  id: string;
  squad_id: string;
  title: string;
  description?: string;
  goal_type: 'faturamento' | 'leads' | 'clientes' | 'retencao' | 'outros';
  target_value: number;
  current_value: number;
  period: 'mensal' | 'trimestral' | 'semestral';
  start_date?: string;
  target_date: string;
  status: 'nao_iniciada' | 'em_andamento' | 'concluida' | 'falhada';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useSquadGoals = (squadId?: string | null) => {
  const queryClient = useQueryClient();

  const { data: squadGoals = [], isLoading } = useQuery({
    queryKey: ['squad-goals', squadId],
    queryFn: async () => {
      let query = supabase
        .from('squad_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (squadId) {
        query = query.eq('squad_id', squadId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SquadGoal[];
    }
  });

  const createSquadGoal = useMutation({
    mutationFn: async (goal: Omit<SquadGoal, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('squad_goals')
        .insert(goal)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squad-goals'] });
      toast({
        title: "Meta coletiva criada",
        description: "A meta foi criada com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateSquadGoal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SquadGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from('squad_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squad-goals'] });
      toast({
        title: "Meta atualizada",
        description: "A meta foi atualizada com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar meta",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteSquadGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('squad_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squad-goals'] });
      toast({
        title: "Meta excluída",
        description: "A meta foi excluída com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir meta",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    squadGoals,
    isLoading,
    createSquadGoal: createSquadGoal.mutate,
    updateSquadGoal: updateSquadGoal.mutate,
    deleteSquadGoal: deleteSquadGoal.mutate,
    isCreating: createSquadGoal.isPending,
    isUpdating: updateSquadGoal.isPending
  };
};
