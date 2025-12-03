import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSquadGoals, SquadGoal } from "@/hooks/useSquadGoals";
import { useAuth } from "@/contexts/AuthContext";
import { addDays, addWeeks } from "date-fns";

interface AddSquadGoalDialogProps {
  squadId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GoalType = SquadGoal['goal_type'];
type Recurrence = 'none' | 'semanal' | 'quinzenal' | 'mensal';

export function AddSquadGoalDialog({ squadId, open, onOpenChange }: AddSquadGoalDialogProps) {
  const { user } = useAuth();
  const { createSquadGoal, isCreating } = useSquadGoals();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("outros");
  const [targetValue, setTargetValue] = useState("1");
  const [period, setPeriod] = useState<'mensal' | 'trimestral' | 'semestral'>("mensal");
  const [targetDate, setTargetDate] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");

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
    
    createSquadGoal({
      squad_id: squadId,
      title,
      description: description || undefined,
      goal_type: goalType,
      target_value: parseFloat(targetValue),
      current_value: 0,
      period,
      target_date: targetDate,
      status: 'em_andamento',
      recurrence,
      next_reset_at: calculateNextReset(recurrence),
      created_by: user?.id
    }, {
      onSuccess: () => {
        onOpenChange(false);
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setGoalType("outros");
    setTargetValue("1");
    setPeriod("mensal");
    setTargetDate("");
    setRecurrence("none");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Meta Coletiva</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Estudo de nicho do cliente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os detalhes da meta..."
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">Quantas vezes? (meta)</Label>
              <Input
                id="targetValue"
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Ex: 1"
                required
              />
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar Meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
