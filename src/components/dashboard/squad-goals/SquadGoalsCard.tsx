import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, TrendingUp, Calendar, Pencil, Trash2 } from "lucide-react";
import { useSquadGoals, SquadGoal } from "@/hooks/useSquadGoals";
import { AddSquadGoalDialog } from "./AddSquadGoalDialog";
import { EditSquadGoalDialog } from "./EditSquadGoalDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SquadGoalsCardProps {
  squadId: string;
  canManage?: boolean;
}

const goalTypeLabels: Record<string, string> = {
  faturamento: "Faturamento",
  leads: "Leads",
  clientes: "Clientes",
  retencao: "Retenção",
  outros: "Outros"
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  nao_iniciada: { label: "Não Iniciada", variant: "outline" },
  em_andamento: { label: "Em Andamento", variant: "default" },
  concluida: { label: "Concluída", variant: "secondary" },
  falhada: { label: "Falhada", variant: "destructive" }
};

export function SquadGoalsCard({ squadId, canManage = false }: SquadGoalsCardProps) {
  const { squadGoals, isLoading, deleteSquadGoal } = useSquadGoals(squadId);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SquadGoal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Coletivas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Metas Coletivas
              </CardTitle>
              <CardDescription>Objetivos de equipe para o squad</CardDescription>
            </div>
            {canManage && (
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Nova Meta
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {squadGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma meta coletiva definida</p>
              {canManage && (
                <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
                  Criar primeira meta
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {squadGoals.map((goal) => {
                const progress = calculateProgress(goal.current_value, goal.target_value);
                const status = statusLabels[goal.status] || statusLabels.nao_iniciada;
                
                return (
                  <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{goal.title}</h4>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {goalTypeLabels[goal.goal_type]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(goal.target_date), "dd MMM yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setEditingGoal(goal)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeletingGoalId(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span className="font-medium">
                          {goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()} ({progress}%)
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddSquadGoalDialog 
        squadId={squadId}
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />

      {editingGoal && (
        <EditSquadGoalDialog
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
        />
      )}

      <AlertDialog open={!!deletingGoalId} onOpenChange={(open) => !open && setDeletingGoalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta coletiva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A meta será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingGoalId) {
                  deleteSquadGoal(deletingGoalId);
                  setDeletingGoalId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
