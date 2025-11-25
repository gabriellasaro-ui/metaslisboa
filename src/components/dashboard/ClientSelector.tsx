import { useState, useEffect } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, Loader2 } from "lucide-react";

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
      const { data, error } = await supabase
        .from("clients")
        .select(`
          id,
          name,
          status,
          squad:squads(
            name,
            leader:leaders(name)
          ),
          goals(
            id,
            goal_type,
            goal_value,
            progress
          )
        `)
        .eq("status", "ativo")
        .order("name");

      if (error) throw error;

      const clientsData = (data || []) as any[];
      
      // Agrupar por squad
      const grouped = clientsData.reduce((acc, client) => {
        const squadName = client.squad?.name || "Sem Squad";
        if (!acc[squadName]) {
          acc[squadName] = [];
        }
        acc[squadName].push(client);
        return acc;
      }, {} as Record<string, Client[]>);

      setSquads(grouped);
      setClients(clientsData);
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
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Carregando clientes..." : placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[400px] bg-background border-border z-50">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : Object.keys(squads).length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Nenhum cliente ativo encontrado
          </div>
        ) : (
          Object.entries(squads).map(([squadName, squadClients]) => (
            <SelectGroup key={squadName}>
              <SelectLabel className="font-bold text-primary flex items-center gap-2 py-2">
                <Users className="h-4 w-4" />
                {squadName}
              </SelectLabel>
              {squadClients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  <div className="flex items-center justify-between gap-3 w-full">
                    <span className="font-medium">{client.name}</span>
                    {client.goals && client.goals.length > 0 ? (
                      <Badge variant="default" className="text-xs">
                        {client.goals.length} {client.goals.length === 1 ? "meta" : "metas"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Sem meta</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
