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
      <SelectContent className="max-h-[500px] min-w-[500px] max-w-[600px] bg-background border-border shadow-lg z-50">
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : Object.keys(squads).length === 0 ? (
          <div className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Nenhum cliente disponível</p>
              <p className="text-sm text-muted-foreground">Os clientes precisam ter meta, tipo e período definidos para fazer check-in.</p>
            </div>
          </div>
        ) : (
          <div className="p-1">
            {Object.entries(squads).map(([squadName, squadClients]) => (
              <SelectGroup key={squadName} className="mb-2">
                <SelectLabel className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-primary bg-primary/5 rounded-md mb-1">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{squadName}</span>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {squadClients.length}
                  </Badge>
                </SelectLabel>
                {squadClients.map((client) => (
                  <SelectItem 
                    key={client.id} 
                    value={client.id} 
                    className="cursor-pointer hover:bg-accent focus:bg-accent px-3 py-3 my-1 rounded-md"
                  >
                    <div className="flex items-start gap-3 w-full pr-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{client.name}</span>
                          {client.status === "aviso_previo" && (
                            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 flex-shrink-0">
                              Aviso Prévio
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {client.goals && client.goals.length > 0 && (
                            <>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Target className="h-3 w-3 flex-shrink-0" />
                                {client.goals[0].goal_type} - {client.goals[0].period}
                              </span>
                              <Badge variant="default" className="text-xs flex-shrink-0">
                                {client.goals.length} {client.goals.length === 1 ? "meta" : "metas"}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
