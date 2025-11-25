import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Loader2 } from "lucide-react";
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
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      ativo: { variant: "default", label: "Ativo" },
      aviso_previo: { variant: "secondary", label: "Aviso Prévio" },
      churned: { variant: "destructive", label: "Churned" },
    };
    const config = variants[status] || variants.ativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
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
            {clients.map((client) => (
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