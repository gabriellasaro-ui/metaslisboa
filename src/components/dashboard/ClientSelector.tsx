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
      <SelectContent 
        className="w-[420px] max-h-[420px] bg-background border-border shadow-xl z-[100] overflow-auto"
        position="popper"
        sideOffset={5}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : Object.keys(squads).length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-medium text-sm">Nenhum cliente disponível</p>
            <p className="text-xs text-muted-foreground">Clientes precisam ter meta definida</p>
          </div>
        ) : (
          <div className="p-1">
            {Object.entries(squads).map(([squadName, squadClients]) => (
              <SelectGroup key={squadName} className="mb-2">
                <SelectLabel className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <Building2 className="h-3 w-3" />
                  <span>{squadName}</span>
                  <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1.5 font-normal">
                    {squadClients.length}
                  </Badge>
                </SelectLabel>
                <div className="space-y-1">
                  {squadClients.map((client) => (
                    <SelectItem 
                      key={client.id} 
                      value={client.id}
                      className="cursor-pointer px-2 py-3 rounded hover:bg-accent/80 focus:bg-accent data-[state=checked]:bg-accent"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Users className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-medium text-sm truncate">{client.name}</span>
                            {client.status === "aviso_previo" && (
                              <Badge className="text-[9px] h-4 px-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
                                Aviso
                              </Badge>
                            )}
                          </div>
                          {client.goals && client.goals.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Target className="h-3 w-3" />
                              <span className="truncate">{client.goals[0].goal_type} - {client.goals[0].period}</span>
                              <Badge variant="secondary" className="ml-auto text-[9px] h-3.5 px-1">
                                {client.goals.length}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              </SelectGroup>
            ))}
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
