import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Squad, Client } from "@/types";

export const useClientsData = () => {
  const queryClient = useQueryClient();

  // Fetch squads with their clients from Supabase
  const { data: squadsData = [], isLoading } = useQuery({
    queryKey: ["squads-with-clients"],
    queryFn: async () => {
      // Fetch squads with leader info
      const { data: squads, error: squadsError } = await supabase
        .from("squads")
        .select(`
          id,
          name,
          slug,
          leader_id,
          leaders (
            id,
            name,
            email
          )
        `)
        .order("name");

      if (squadsError) throw squadsError;

      // Fetch clients for each squad (RLS automatically filters by squad)
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select(`
          id,
          name,
          status,
          health_status,
          notes,
          squad_id,
          goals (
            id,
            goal_type,
            goal_value,
            progress,
            status,
            period,
            specific,
            measurable,
            achievable,
            relevant,
            time_bound,
            target_date,
            start_date
          )
        `)
        .order("name");

      if (clientsError) throw clientsError;

      // Transform data to match Squad interface
      const transformedSquads: Squad[] = (squads || []).map(squad => {
        const squadClients = (clients || [])
          .filter(c => c.squad_id === squad.id)
          .map(client => {
            const hasGoals = client.goals && client.goals.length > 0;
            const activeGoal = hasGoals ? client.goals[0] : null;
            
            // Determinar o status correto da meta
            let hasGoalStatus: "SIM" | "NAO" | "NAO_DEFINIDO" = "NAO";
            if (hasGoals && activeGoal) {
              if (activeGoal.status === "nao_definida") {
                hasGoalStatus = "NAO_DEFINIDO";
              } else if (activeGoal.status === "em_andamento" || activeGoal.status === "concluida") {
                hasGoalStatus = "SIM";
              }
            }

            return {
              name: client.name,
              hasGoal: hasGoalStatus,
              goalType: activeGoal?.goal_type || undefined,
              goalValue: activeGoal?.goal_value || undefined,
              currentProgress: activeGoal?.progress || 0,
              healthStatus: client.health_status || "safe",
              status: client.status || "ativo",
              notes: client.notes || undefined,
              period: activeGoal?.period || undefined,
              smartGoal: activeGoal ? {
                id: activeGoal.id,
                specific: activeGoal.specific || undefined,
                measurable: activeGoal.measurable || undefined,
                achievable: activeGoal.achievable || undefined,
                relevant: activeGoal.relevant || undefined,
                timeBound: activeGoal.time_bound || undefined,
                goalValue: activeGoal.goal_value,
                goalType: activeGoal.goal_type,
                period: activeGoal.period || undefined,
                startDate: activeGoal.start_date || undefined,
                targetDate: activeGoal.target_date || undefined,
                progress: activeGoal.progress,
                status: activeGoal.status,
              } : undefined,
              checkIns: [],
            } as Client;
          });

        return {
          id: squad.id,
          name: squad.name,
          leader: squad.leaders?.name || "Sem Líder",
          clients: squadClients,
        };
      });

      return transformedSquads;
    },
  });

  const updateClient = async (squadId: string, clientIndex: number, updatedClient: Client) => {
    // This is kept for compatibility but should be replaced with direct Supabase updates
    queryClient.invalidateQueries({ queryKey: ["squads-with-clients"] });
  };

  const addClient = async (squadId: string, newClient: Client) => {
    queryClient.invalidateQueries({ queryKey: ["squads-with-clients"] });
  };

  const deleteClient = async (squadId: string, clientIndex: number) => {
    queryClient.invalidateQueries({ queryKey: ["squads-with-clients"] });
  };

  return {
    squadsData,
    isLoading,
    updateClient,
    addClient,
    deleteClient,
  };
};
