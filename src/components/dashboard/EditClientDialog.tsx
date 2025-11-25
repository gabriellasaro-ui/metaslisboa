import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, GoalStatus, GoalType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  hasGoal: z.enum(["SIM", "NAO_DEFINIDO", "NAO"] as const),
  goalType: z.enum(["Faturamento", "Leads", "OUTROS"] as const).optional(),
  goalValue: z.string().trim().max(500, "Meta deve ter no máximo 500 caracteres").optional(),
});

interface EditClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (client: Client) => void;
}

export const EditClientDialog = ({ client, open, onOpenChange, onSave }: EditClientDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Client>(
    client || {
      name: "",
      hasGoal: "NAO",
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = clientSchema.parse(formData);
      
      // Se não tem meta, limpa os campos relacionados
      if (validatedData.hasGoal === "NAO") {
        validatedData.goalType = undefined;
        validatedData.goalValue = undefined;
      }
      
      onSave(validatedData as Client);
      toast({
        title: "Sucesso!",
        description: "Cliente atualizado com sucesso.",
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
      }
    }
  };

  const handleChange = (field: keyof Client, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Limpa erro do campo ao editar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações e metas do cliente
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cliente *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: Groupwork"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {client?.squadName && (
            <div className="space-y-2">
              <Label htmlFor="squad">Squad</Label>
              <Input
                id="squad"
                value={client.squadName}
                disabled
                className="bg-muted"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="hasGoal">Status da Meta *</Label>
            <Select
              value={formData.hasGoal}
              onValueChange={(value: GoalStatus) => handleChange("hasGoal", value)}
            >
              <SelectTrigger id="hasGoal" className={errors.hasGoal ? "border-destructive" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIM">🟢 Com Meta</SelectItem>
                <SelectItem value="NAO_DEFINIDO">🟡 A Definir</SelectItem>
                <SelectItem value="NAO">🔴 Sem Meta</SelectItem>
              </SelectContent>
            </Select>
            {errors.hasGoal && (
              <p className="text-sm text-destructive">{errors.hasGoal}</p>
            )}
          </div>

          {(formData.hasGoal === "SIM" || formData.hasGoal === "NAO_DEFINIDO") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="goalType">Tipo de Meta</Label>
                <Select
                  value={formData.goalType || ""}
                  onValueChange={(value: GoalType) => handleChange("goalType", value)}
                >
                  <SelectTrigger id="goalType" className={errors.goalType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faturamento">Faturamento</SelectItem>
                    <SelectItem value="Leads">Leads</SelectItem>
                    <SelectItem value="OUTROS">Outros</SelectItem>
                  </SelectContent>
                </Select>
                {errors.goalType && (
                  <p className="text-sm text-destructive">{errors.goalType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalValue">Valor da Meta</Label>
                <Input
                  id="goalValue"
                  value={formData.goalValue || ""}
                  onChange={(e) => handleChange("goalValue", e.target.value)}
                  placeholder="Ex: R$20.000.000/ano ou Realizar a primeira venda"
                  className={errors.goalValue ? "border-destructive" : ""}
                />
                {errors.goalValue && (
                  <p className="text-sm text-destructive">{errors.goalValue}</p>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="premium">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
