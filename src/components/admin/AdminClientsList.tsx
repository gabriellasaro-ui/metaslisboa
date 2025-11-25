import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2, Search, Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EditClientAdminDialog } from "./EditClientAdminDialog";
import { useAuth } from "@/contexts/AuthContext";

interface Client {
  id: string;
  name: string;
  status: string;
  health_status: string | null;
  notes: string | null;
  squad_id: string;
  archived: boolean;
  squads: {
    name: string;
  };
}

interface AdminClientsListProps {
  onUpdate: () => void;
}

export const AdminClientsList = ({ onUpdate }: AdminClientsListProps) => {
  const { isSupervisor } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [clientToArchive, setClientToArchive] = useState<Client | null>(null);

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
        label: "Churn" 
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

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.squads.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArchived = showArchived ? client.archived : !client.archived;
    
    return matchesSearch && matchesArchived;
  });

  const handleArchive = async (client: Client) => {
    if (client.status !== 'churned') {
      toast.error("Apenas clientes em Churn podem ser arquivados");
      return;
    }

    try {
      const { error } = await supabase
        .from("clients")
        .update({ archived: true })
        .eq("id", client.id);

      if (error) throw error;

      toast.success("Cliente arquivado com sucesso");
      fetchClients();
      onUpdate();
    } catch (error) {
      console.error("Error archiving client:", error);
      toast.error("Erro ao arquivar cliente");
    } finally {
      setClientToArchive(null);
    }
  };

  const handleDelete = async (client: Client) => {
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", client.id);

      if (error) throw error;

      toast.success("Cliente excluído com sucesso");
      fetchClients();
      onUpdate();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
    } finally {
      setClientToDelete(null);
    }
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
      <div className="mb-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, squad ou status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {isSupervisor && (
          <div className="flex items-center space-x-2">
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={setShowArchived}
            />
            <Label htmlFor="show-archived">Mostrar clientes arquivados</Label>
          </div>
        )}
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Squad</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Health</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id} className={client.archived ? "opacity-60" : ""}>
                <TableCell className="font-medium">
                  {client.name}
                  {client.archived && (
                    <Badge variant="outline" className="ml-2 text-xs">Arquivado</Badge>
                  )}
                </TableCell>
                <TableCell>{client.squads.name}</TableCell>
                <TableCell>{getStatusBadge(client.status)}</TableCell>
                <TableCell>{getHealthBadge(client.health_status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingClient(client)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    {isSupervisor && !client.archived && client.status === 'churned' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setClientToArchive(client)}
                        title="Arquivar cliente"
                      >
                        <Archive className="h-4 w-4 text-amber-600" />
                      </Button>
                    )}
                    
                    {isSupervisor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setClientToDelete(client)}
                        title="Excluir cliente"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
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

      {/* Dialog de confirmação para arquivar */}
      <AlertDialog open={!!clientToArchive} onOpenChange={() => setClientToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja arquivar o cliente <strong>{clientToArchive?.name}</strong>?
              Clientes arquivados não aparecerão na listagem padrão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => clientToArchive && handleArchive(clientToArchive)}>
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação para excluir */}
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente o cliente <strong>{clientToDelete?.name}</strong>?
              Esta ação não pode ser desfeita e todos os dados associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => clientToDelete && handleDelete(clientToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};