import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HealthScoreBadge, ExtendedHealthStatus, healthStatusLabels } from "./HealthScoreBadge";
import { EditHealthScoreDialog } from "./EditHealthScoreDialog";
import { Search, Edit2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  health_status: ExtendedHealthStatus | null;
  problema_central: string | null;
  squadName?: string;
}

interface HealthScoreTableProps {
  clients: Client[];
  canEdit?: boolean;
  onRefresh?: () => void;
}

export const HealthScoreTable = ({ clients, canEdit = false, onRefresh }: HealthScoreTableProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.problema_central?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || client.health_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente ou problema..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(healthStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Squad</TableHead>
              <TableHead>Health Status</TableHead>
              <TableHead className="min-w-[200px]">Problema Central</TableHead>
              {canEdit && <TableHead className="w-[80px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 5 : 4} className="text-center py-8 text-muted-foreground">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {client.squadName || "-"}
                  </TableCell>
                  <TableCell>
                    <HealthScoreBadge status={client.health_status || 'safe'} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                    {client.problema_central || "-"}
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingClient(client)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredClients.length} de {clients.length} clientes
      </div>

      {canEdit && (
        <EditHealthScoreDialog
          client={editingClient}
          open={!!editingClient}
          onOpenChange={(open) => !open && setEditingClient(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};
