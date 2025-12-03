import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HealthScoreHistoryEntry {
  id: string;
  client_id: string;
  changed_by: string | null;
  changed_by_name?: string;
  old_status: string | null;
  new_status: string | null;
  old_problema_central: string | null;
  new_problema_central: string | null;
  old_categoria_problema: string | null;
  new_categoria_problema: string | null;
  notes: string | null;
  changed_at: string;
}

export const useHealthScoreHistory = (clientId: string | null) => {
  return useQuery({
    queryKey: ["health-score-history", clientId],
    queryFn: async (): Promise<HealthScoreHistoryEntry[]> => {
      if (!clientId) return [];

      const { data, error } = await supabase
        .from("health_score_history")
        .select(`
          id,
          client_id,
          changed_by,
          old_status,
          new_status,
          old_problema_central,
          new_problema_central,
          old_categoria_problema,
          new_categoria_problema,
          notes,
          changed_at
        `)
        .eq("client_id", clientId)
        .order("changed_at", { ascending: false });

      if (error) {
        console.error("Error fetching health score history:", error);
        throw error;
      }

      // Fetch user names for changed_by
      const userIds = [...new Set(data?.map(entry => entry.changed_by).filter(Boolean))];
      
      let userNames: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);
        
        if (profiles) {
          userNames = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile.name;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      return (data || []).map(entry => ({
        ...entry,
        changed_by_name: entry.changed_by ? userNames[entry.changed_by] || "Usuário desconhecido" : "Sistema"
      }));
    },
    enabled: !!clientId,
  });
};

// Function to add notes to the most recent history entry
export const addNotesToHistory = async (clientId: string, notes: string) => {
  const { data: latestEntry, error: fetchError } = await supabase
    .from("health_score_history")
    .select("id")
    .eq("client_id", clientId)
    .order("changed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching latest history entry:", fetchError);
    throw fetchError;
  }

  if (latestEntry) {
    const { error: updateError } = await supabase
      .from("health_score_history")
      .update({ notes })
      .eq("id", latestEntry.id);

    if (updateError) {
      console.error("Error updating history notes:", updateError);
      throw updateError;
    }
  }
};
