import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Client, GoalStatus, GoalType } from "@/data/clientsData";
import { Target, TrendingUp, Users, AlertCircle } from "lucide-react";

interface ClientsTableProps {
  clients: Client[];
  filterStatus?: "all" | GoalStatus;
  filterGoalType?: "all" | GoalType;
}

const getStatusBadge = (status: GoalStatus) => {
  switch (status) {
    case "SIM":
      return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">🟢 Com Meta</Badge>;
    case "NAO_DEFINIDO":
      return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20">🟡 A Definir</Badge>;
    case "NAO":
      return <Badge variant="outline" className="text-muted-foreground">🔴 Sem Meta</Badge>;
  }
};

const getGoalTypeIcon = (type?: GoalType) => {
  switch (type) {
    case "Faturamento":
      return <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "Leads":
      return <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case "OUTROS":
      return <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    default:
      return null;
  }
};

const getGoalTypeBadge = (type?: GoalType) => {
  if (!type) return null;
  
  const colors = {
    Faturamento: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    Leads: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    OUTROS: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  };

  return (
    <Badge variant="outline" className={colors[type]}>
      <span className="mr-1">{getGoalTypeIcon(type)}</span>
      {type}
    </Badge>
  );
};

export const ClientsTable = ({ clients, filterStatus = "all", filterGoalType = "all" }: ClientsTableProps) => {
  const filteredClients = clients.filter(client => {
    const statusMatch = filterStatus === "all" || client.hasGoal === filterStatus;
    const goalTypeMatch = filterGoalType === "all" || client.goalType === filterGoalType;
    return statusMatch && goalTypeMatch;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Meta</TableHead>
            <TableHead>Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Nenhum cliente encontrado com os filtros selecionados
              </TableCell>
            </TableRow>
          ) : (
            filteredClients.map((client, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{getStatusBadge(client.hasGoal)}</TableCell>
                <TableCell>{getGoalTypeBadge(client.goalType)}</TableCell>
                <TableCell className="max-w-md">
                  {client.goalValue ? (
                    <span className="text-sm">{client.goalValue}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {client.notes && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{client.notes}</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
