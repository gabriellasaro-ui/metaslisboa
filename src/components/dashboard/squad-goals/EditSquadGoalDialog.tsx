import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSquadGoals, SquadGoal } from "@/hooks/useSquadGoals";
import { addDays, addWeeks } from "date-fns";

interface EditSquadGoalDialogProps {
  goal: SquadGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GoalType = SquadGoal['goal_type'];
type Recurrence = 'none' | 'semanal' | 'quinzenal' | 'mensal';

export function EditSquadGoalDialog({ goal, open, onOpenChange }: EditSquadGoalDialogProps) {
  const { updateSquadGoal, isUpdating } = useSquadGoals();
  
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || "");
  const [goalType, setGoalType] = useState<GoalType>(goal.goal_type);
  const [targetValue, setTargetValue] = useState(goal.target_value.toString());
  const [currentValue, setCurrentValue] = useState(goal.current_value.toString());
  const [period, setPeriod] = useState(goal.period);
  const [targetDate, setTargetDate] = useState(goal.target_date.split('T')[0]);
  const [status, setStatus] = useState(goal.status);
  const [recurrence, setRecurrence] = useState<Recurrence>(goal.recurrence || 'none');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || "");
      setGoalType(goal.goal_type);
      setTargetValue(goal.target_value.toString());
      setCurrentValue(goal.current_value.toString());
      setPeriod(goal.period);
      setTargetDate(goal.target_date.split('T')[0]);
      setStatus(goal.status);
      setRecurrence(goal.recurrence || 'none');
    }
  }, [goal]);

  const calculateNextReset = (recurrenceType: Recurrence): string | undefined => {
    if (recurrenceType === 'none') return undefined;
    
    const now = new Date();
    switch (recurrenceType) {
      case 'semanal':
        return addWeeks(now, 1).toISOString();
      case 'quinzenal':
        return addWeeks(now, 2).toISOString();
      case 'mensal':
        return addDays(now, 30).toISOString();
      default:
        return undefined;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateSquadGoal({
      id: goal.id,
      title,
      description: description || undefined,
      goal_type: goalType,
      target_value: parseFloat(targetValue),
      current_value: parseFloat(currentValue),
      period,
      target_date: targetDate,
      status,
      recurrence,
      next_reset_at: recurrence !== goal.recurrence ? calculateNextReset(recurrence) : goal.next_reset_at
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Meta Coletiva</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Meta</Label>
              <Select value={goalType} onValueChange={(v: GoalType) => setGoalType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estudo">📚 Estudo</SelectItem>
                  <SelectItem value="estudo_nicho">🔍 Estudo de Nicho</SelectItem>
                  <SelectItem value="checkin_diferente">💬 Check-in Diferente</SelectItem>
                  <SelectItem value="aproximacao_cliente">🤝 Aproximação de Cliente</SelectItem>
                  <SelectItem value="desenvolvimento">📈 Desenvolvimento</SelectItem>
                  <SelectItem value="outros">📋 Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_iniciada">Não Iniciada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="falhada">Falhada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Recorrência</Label>
              <Select value={recurrence} onValueChange={(v: Recurrence) => setRecurrence(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem recorrência</SelectItem>
                  <SelectItem value="semanal">🔄 Semanal</SelectItem>
                  <SelectItem value="quinzenal">🔄 Quinzenal</SelectItem>
                  <SelectItem value="mensal">🔄 Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Data Limite</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentValue">Valor Atual</Label>
              <Input
                id="currentValue"
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetValue">Quantas vezes? (meta)</Label>
              <Input
                id="targetValue"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
