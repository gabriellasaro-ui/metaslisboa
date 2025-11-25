import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { EditClientAdminDialog } from "./EditClientAdminDialog";

interface Client {
  id: string;
  name: string;
  status: string;
  health_status: string | null;
  notes: string | null;
  squad_id: string;
  squads: {
    name: string;
  };
}

interface AdminClientsListProps {
  onUpdate: () => void;
}

export const AdminClientsList = ({ onUpdate }: AdminClientsListProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select(`
          *,
          squads(name)
        `)
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      ativo: { 
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20", 
        label: "Ativo" 
      },
      aviso_previo: { 
        className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20", 
        label: "Aviso Prévio" 
      },
      churned: { 
        className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20", 
        label: "Churned" 
      },
    };
    const config = variants[status] || variants.ativo;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getHealthBadge = (health: string | null) => {
    if (!health) return null;
    const variants: Record<string, { className: string; label: string }> = {
      safe: { className: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300", label: "Saudável" },
      care: { className: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300", label: "Atenção" },
      danger: { className: "bg-red-500/20 text-red-700 dark:text-red-300", label: "Perigo" },
    };
    const config = variants[health] || variants.safe;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.squads.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.status.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar por nome, squad ou status..."
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
              <TableHead>Nome</TableHead>
              <TableHead>Squad</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Saúde</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.squads.name}</TableCell>
                <TableCell>{getStatusBadge(client.status)}</TableCell>
                <TableCell>{getHealthBadge(client.health_status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingClient(client)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditClientAdminDialog
        client={editingClient}
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
        onSuccess={() => {
          fetchClients();
          onUpdate();
        }}
      />
    </>
  );
};