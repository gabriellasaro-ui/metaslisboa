import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Client, GoalStatus, GoalType } from "@/types";
import { Target, TrendingUp, Users, AlertCircle, Pencil, Sparkles, ClipboardCheck, History } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { HealthStatusBadge } from "./HealthStatusBadge";
import { useAuth } from "@/contexts/AuthContext";

interface ClientsTableProps {
  clients: Client[];
  filterStatus?: "all" | GoalStatus;
  filterGoalType?: "all" | GoalType;
  onEditClient?: (client: Client, index: number) => void;
  onDefineSmartGoal?: (client: Client, index: number) => void;
  onCheckIn?: (client: Client, index: number) => void;
  onViewProgress?: (client: Client) => void;
  showActions?: boolean;
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

export const ClientsTable = ({ 
  clients, 
  filterStatus = "all", 
  filterGoalType = "all",
  onEditClient,
  onDefineSmartGoal,
  onCheckIn,
  onViewProgress,
  showActions = true 
}: ClientsTableProps) => {
  const { isCoordenador, isSupervisor } = useAuth();
  const canEdit = isCoordenador || isSupervisor;

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
            <TableHead>Situação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Meta</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Observações</TableHead>
            {showActions && <TableHead className="w-[180px]">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 8 : 7} className="text-center text-muted-foreground py-8">
                Nenhum cliente encontrado com os filtros selecionados
              </TableCell>
            </TableRow>
          ) : (
            filteredClients.map((client, index) => {
              // Encontra o índice original do cliente na lista não filtrada
              const originalIndex = clients.findIndex(c => c.name === client.name);
              const hasCheckIns = client.checkIns && client.checkIns.length > 0;
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <HealthStatusBadge status={(client as any).health_status || 'safe'} />
                  </TableCell>
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
                  <TableCell>
                    {client.notes && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{client.notes}</span>
                      </div>
                    )}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {client.hasGoal === "SIM" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onCheckIn?.(client, originalIndex)}
                              className="h-8 px-2 hover:bg-blue-500/10 hover:text-blue-600 hover:border hover:border-blue-500/20"
                              title="Registrar Check-in"
                            >
                              <ClipboardCheck className="h-4 w-4 mr-1" />
                              Check-in
                            </Button>
                            {hasCheckIns && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewProgress?.(client)}
                                className="h-8 w-8 p-0 hover:bg-purple-500/10 hover:text-purple-600 hover:border hover:border-purple-500/20"
                                title="Ver Timeline"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                        {(client.hasGoal === "NAO_DEFINIDO" || client.hasGoal === "NAO") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDefineSmartGoal?.(client, originalIndex)}
                            className="h-8 px-2 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border hover:border-emerald-500/20"
                            title="Definir Meta SMART"
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            SMART
                          </Button>
                        )}
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditClient?.(client, originalIndex)}
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary hover:border hover:border-primary/20"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar cliente</span>
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
