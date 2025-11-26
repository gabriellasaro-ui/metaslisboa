import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, GoalType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const goalSchema = z.object({
  goalType: z.enum(["Faturamento", "Leads", "OUTROS"] as const),
  goalValue: z.string().trim().min(1, "Descrição da meta é obrigatória").max(500, "Descrição deve ter no máximo 500 caracteres"),
  description: z.string().trim().max(1000, "Descrição adicional deve ter no máximo 1000 caracteres").optional(),
});

interface EditGoalDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditGoalDialog = ({ client, open, onOpenChange }: EditGoalDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [goalType, setGoalType] = useState<GoalType>("Faturamento");
  const [goalValue, setGoalValue] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client && open) {
      setGoalType(client.smartGoal?.goalType || client.goalType || "Faturamento");
      setGoalValue(client.smartGoal?.goalValue || client.goalValue || "");
      setDescription(client.smartGoal?.description || "");
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = goalSchema.parse({
        goalType,
        goalValue,
        description,
      });

      setLoading(true);

      // Buscar o cliente e sua meta no banco
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("id", client?.id)
        .single();

      if (clientError) throw clientError;

      const { data: goalData, error: goalError } = await supabase
        .from("goals")
        .select("id")
        .eq("client_id", clientData.id)
        .maybeSingle();

      if (goalError) throw goalError;

      if (!goalData) {
        toast({
          title: "Erro",
          description: "Meta não encontrada para este cliente.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar a meta
      const { error: updateError } = await supabase
        .from("goals")
        .update({
          goal_type: validatedData.goalType,
          goal_value: validatedData.goalValue,
          description: validatedData.description || null,
        })
        .eq("id", goalData.id);

      if (updateError) throw updateError;

      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ["squads-with-clients"] });
      
      toast({
        title: "Sucesso!",
        description: "Meta atualizada com sucesso.",
      });
      
      onOpenChange(false);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Erro de validação",
          description: "Por favor, corrija os erros no formulário.",
          variant: "destructive",
        });
      } else {
        console.error("Error updating goal:", error);
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar a meta.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Meta de {client?.name}</DialogTitle>
          <DialogDescription>
            Atualize o tipo e a descrição da meta do cliente
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goalType">Tipo de Meta *</Label>
            <Select
              value={goalType}
              onValueChange={(value: GoalType) => {
                setGoalType(value);
                if (errors.goalType) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.goalType;
                    return newErrors;
                  });
                }
              }}
            >
              <SelectTrigger id="goalType" className={errors.goalType ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Faturamento">💰 Faturamento</SelectItem>
                <SelectItem value="Leads">🎯 Leads</SelectItem>
                <SelectItem value="OUTROS">📋 Outros</SelectItem>
              </SelectContent>
            </Select>
            {errors.goalType && (
              <p className="text-sm text-destructive">{errors.goalType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalValue">Descrição da Meta *</Label>
            <Input
              id="goalValue"
              value={goalValue}
              onChange={(e) => {
                setGoalValue(e.target.value);
                if (errors.goalValue) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.goalValue;
                    return newErrors;
                  });
                }
              }}
              placeholder="Ex: R$20.000.000/ano ou Realizar a primeira venda"
              className={errors.goalValue ? "border-destructive" : ""}
            />
            {errors.goalValue && (
              <p className="text-sm text-destructive">{errors.goalValue}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Adicional (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.description;
                    return newErrors;
                  });
                }
              }}
              placeholder="Adicione detalhes extras sobre a meta..."
              className={errors.description ? "border-destructive" : ""}
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="premium" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};