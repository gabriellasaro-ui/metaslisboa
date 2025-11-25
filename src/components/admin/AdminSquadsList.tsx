import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Loader2, Users, Search } from "lucide-react";
import { toast } from "sonner";
import { EditSquadDialog } from "./EditSquadDialog";

interface Squad {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  leader_id: string | null;
  leaders: {
    name: string;
  } | null;
  clients: { count: number }[];
}

interface AdminSquadsListProps {
  onUpdate: () => void;
}

export const AdminSquadsList = ({ onUpdate }: AdminSquadsListProps) => {
  const { isSupervisor } = useAuth();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSquad, setEditingSquad] = useState<Squad | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSquads();
  }, []);

  const fetchSquads = async () => {
    try {
      const { data, error } = await supabase
        .from("squads")
        .select(`
          *,
          leaders(name)
        `)
        .order("name");

      if (error) throw error;

      // Fetch client counts for each squad
      const squadsWithCounts = await Promise.all(
        (data || []).map(async (squad) => {
          const { count } = await supabase
            .from("clients")
            .select("*", { count: "exact", head: true })
            .eq("squad_id", squad.id);
          
          return {
            ...squad,
            clients: [{ count: count || 0 }]
          };
        })
      );

      setSquads(squadsWithCounts);
    } catch (error) {
      console.error("Error fetching squads:", error);
      toast.error("Erro ao carregar squads");
    } finally {
      setLoading(false);
    }
  };

  const filteredSquads = squads.filter(squad =>
    squad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    squad.leaders?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do squad ou líder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Squad</TableHead>
              <TableHead>Líder</TableHead>
              <TableHead>Clientes</TableHead>
              {isSupervisor && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSquads.map((squad) => (
              <TableRow key={squad.id}>
                <TableCell className="font-medium">{squad.name}</TableCell>
                <TableCell>
                  {squad.leaders ? (
                    <Badge variant="outline">{squad.leaders.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sem líder</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{squad.clients[0]?.count || 0}</span>
                  </div>
                </TableCell>
                {isSupervisor && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSquad(squad)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isSupervisor && (
        <EditSquadDialog
          squad={editingSquad}
          open={!!editingSquad}
          onOpenChange={(open) => !open && setEditingSquad(null)}
          onSuccess={() => {
            fetchSquads();
            onUpdate();
          }}
        />
      )}
    </>
  );
};