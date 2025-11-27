import { useState, useEffect } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, Loader2, Building2, Target, AlertCircle } from "lucide-react";

interface Client {
  id: string;
  name: string;
  status: string;
  squad: {
    name: string;
    leader: {
      name: string;
    };
  };
  goals: Array<{
    id: string;
    goal_type: string;
    goal_value: string;
    progress: number;
    period: string;
  }>;
}

interface ClientSelectorProps {
  value?: string;
  onValueChange: (clientId: string, clientData: Client) => void;
  placeholder?: string;
}

export const ClientSelector = ({ value, onValueChange, placeholder = "Selecione um cliente" }: ClientSelectorProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [squads, setSquads] = useState<Record<string, Client[]>>({});

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      // Buscar perfil do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Usuário não autenticado");
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("squad_id")
        .eq("id", user.id)
        .single();

      // Verificar se o usuário é supervisor
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isSupervisor = roles?.some(r => r.role === "supervisor");

      // Buscar clientes
      let query = supabase
        .from("clients")
        .select(`
          id,
          name,
          status,
          squad_id,
          squads(
            name
          ),
          goals(
            id,
            goal_type,
            goal_value,
            progress,
            period
          )
        `)
        .in("status", ["ativo", "aviso_previo"])
        .order("name");

      // Se não for supervisor, filtrar apenas pelo squad do usuário
      if (!isSupervisor && profile?.squad_id) {
        query = query.eq("squad_id", profile.squad_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar clientes:", error);
        throw error;
      }

      const clientsData = (data || []) as any[];
      
      // Filtrar apenas clientes com meta completa (goal_type, goal_value e period)
      const clientsWithGoals = clientsData.filter(client => {
        if (!client.goals || client.goals.length === 0) return false;
        const goal = client.goals[0];
        return goal.goal_type && goal.goal_value && goal.period;
      });
      
      // Agrupar por squad
      const grouped = clientsWithGoals.reduce((acc, client) => {
        const squadName = client.squads?.name || "Sem Squad";
        if (!acc[squadName]) {
          acc[squadName] = [];
        }
        acc[squadName].push({
          ...client,
          squad: { name: client.squads?.name || "Sem Squad", leader: { name: "" } }
        });
        return acc;
      }, {} as Record<string, Client[]>);

      setSquads(grouped);
      setClients(clientsWithGoals.map(c => ({ 
        ...c, 
        squad: { name: c.squads?.name || "Sem Squad", leader: { name: "" } }
      })));
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      onValueChange(clientId, client);
    }
  };

  return (
    <Select value={value || ""} onValueChange={handleChange}>
      <SelectTrigger className="w-full h-11 bg-background border-border hover:bg-accent/50 transition-colors">
        <SelectValue placeholder={isLoading ? "Carregando clientes..." : placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[400px] bg-background border-border shadow-xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : Object.keys(squads).length === 0 ? (
          <div className="p-6 text-center">
            <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium text-sm">Nenhum cliente disponível</p>
            <p className="text-xs text-muted-foreground">Clientes precisam ter meta definida</p>
          </div>
        ) : (
          <>
            {Object.entries(squads).map(([squadName, squadClients]) => (
              <SelectGroup key={squadName}>
                <SelectLabel className="text-xs font-bold text-muted-foreground">
                  {squadName} ({squadClients.length})
                </SelectLabel>
                {squadClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{client.name}</span>
                      {client.status === "aviso_previo" && (
                        <Badge className="text-[9px] h-4 px-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
                          Aviso
                        </Badge>
                      )}
                      {client.goals && client.goals.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          • {client.goals[0].goal_type} - {client.goals[0].period}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
};
