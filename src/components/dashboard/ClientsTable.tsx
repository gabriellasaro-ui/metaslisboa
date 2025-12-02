import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Client, GoalStatus, GoalType } from "@/types";
import { Target, TrendingUp, Users, AlertCircle, Pencil, Sparkles, History } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { HealthStatusBadge } from "./HealthStatusBadge";
import { useAuth } from "@/contexts/AuthContext";

interface ClientsTableProps {
  clients: Client[];
  filterStatus?: "all" | GoalStatus;
  filterGoalType?: "all" | GoalType;
  onEditClient?: (client: Client, index: number) => void;
  onViewProgress?: (client: Client) => void;
  showActions?: boolean;
}

const getClientStatusBadge = (status?: string) => {
  switch (status) {
    case "ativo":
      return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">Ativo</Badge>;
    case "aviso_previo":
      return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">Aviso Prévio</Badge>;
    case "churned":
      return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">Churn</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

const getGoalStatusBadge = (status: GoalStatus) => {
  switch (status) {
    case "SIM":
      return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">Com Meta</Badge>;
    case "NAO_DEFINIDO":
      return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">A Definir</Badge>;
    case "NAO":
      return <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20">Sem Meta</Badge>;
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

const getGoalPeriodBadge = (period?: string) => {
  if (!period) return <span className="text-muted-foreground text-sm">-</span>;
  
  const periodLabels: Record<string, string> = {
    mensal: "Mensal",
    trimestral: "Trimestral",
    semestral: "Semestral",
    anual: "Anual",
  };

  return (
    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20">
      {periodLabels[period] || period}
    </Badge>
  );
};

export const ClientsTable = ({ 
  clients, 
  filterStatus = "all", 
  filterGoalType = "all",
  onEditClient,
  onViewProgress,
  showActions = true 
}: ClientsTableProps) => {
  const { isCoordenador, isSupervisor, isInvestidor } = useAuth();
  const canEdit = isCoordenador || isSupervisor || isInvestidor;

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
            <TableHead className="w-[200px]">Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Saúde</TableHead>
            <TableHead>Problema</TableHead>
            <TableHead>Meta</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Progresso</TableHead>
            {showActions && <TableHead className="w-[120px]">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 10 : 9} className="text-center text-muted-foreground py-8">
                Nenhum cliente encontrado com os filtros selecionados
              </TableCell>
            </TableRow>
          ) : (
            filteredClients.map((client, index) => {
              // Encontra o índice original do cliente na lista não filtrada
              const originalIndex = clients.findIndex(c => c.name === client.name);
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{getClientStatusBadge(client.status)}</TableCell>
                  <TableCell>
                    <HealthStatusBadge status={client.healthStatus || 'safe'} />
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    {client.problema_central ? (
                      <span className="text-xs text-muted-foreground line-clamp-2" title={client.problema_central}>
                        {client.problema_central}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getGoalStatusBadge(client.hasGoal)}</TableCell>
                  <TableCell>{getGoalTypeBadge(client.goalType)}</TableCell>
                  <TableCell>{getGoalPeriodBadge(client.smartGoal?.period)}</TableCell>
                  <TableCell className="max-w-md">
                    {client.goalValue ? (
                      <span className="text-sm">{client.goalValue}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.hasGoal === "SIM" && (
                      <div className="space-y-1 min-w-[120px]">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-semibold text-primary">{client.currentProgress || 0}%</span>
                        </div>
                        <Progress value={client.currentProgress || 0} className="h-2" />
                      </div>
                    )}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {client.hasGoal === "SIM" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewProgress?.(client)}
                            className="h-8 w-8 p-0 hover:bg-purple-500/10 hover:text-purple-600"
                            title="Ver histórico de check-ins"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        )}
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditClient?.(client, originalIndex)}
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                            title="Editar cliente"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
