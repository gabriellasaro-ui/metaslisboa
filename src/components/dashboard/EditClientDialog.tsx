import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Client, GoalStatus, GoalType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const clientSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  hasGoal: z.enum(["SIM", "NAO_DEFINIDO", "NAO"] as const),
  goalType: z.enum(["Faturamento", "Leads", "OUTROS"] as const).optional(),
  goalValue: z.string().trim().max(500, "Meta deve ter no máximo 500 caracteres").optional(),
  categoria_problema: z.string().optional(),
  problema_central: z.string().optional(),
});

const PROBLEM_CATEGORIES = [
  "Falta de alinhamento estrategico",
  "Expectativa vs Realidade",
  "Comunicacao deficiente",
  "Resultados abaixo do esperado",
  "Problemas financeiros do cliente",
  "Mudanca de gestao/equipe",
  "Falta de engajamento",
  "Falta de acompanhamento",
  "Baixa maturidade digital",
  "Dependencia de recurso-chave",
  "Escopo mal definido",
  "Prazo inadequado",
  "Qualidade das entregas",
  "Atendimento/Suporte",
  "Concorrencia",
  "Reestruturacao interna",
  "Outro",
];

// Statuses that require problem category
const CATEGORY_REQUIRED_STATUSES = ['danger', 'danger_critico', 'aviso_previo', 'churn'];

interface EditClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (client: Client) => void;
}

export const EditClientDialog = ({ client, open, onOpenChange, onSave }: EditClientDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isInvestidor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Client>(
    client || {
      name: "",
      hasGoal: "NAO",
    }
  );
  const [goalPeriod, setGoalPeriod] = useState<"mensal" | "trimestral" | "semestral" | "anual">("mensal");
  const [categoriaProblema, setCategoriaProblema] = useState<string>("");
  const [problemaCentral, setProblemaCentral] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar form quando cliente mudar
  useEffect(() => {
    if (client) {
      setFormData(client);
      setCategoriaProblema(client.categoria_problema || "");
      setProblemaCentral(client.problema_central || "");
      // Pegar o período da meta se existir
      if (client.smartGoal?.period) {
        setGoalPeriod(client.smartGoal.period as "mensal" | "trimestral" | "semestral" | "anual");
      }
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = clientSchema.parse(formData);

      setLoading(true);

      // Buscar o cliente no banco para obter o ID
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("name", client?.name)
        .single();

      if (clientError) throw clientError;
      
      // Se não tem meta, limpa os campos relacionados e deleta a meta do banco
      if (validatedData.hasGoal === "NAO") {
        validatedData.goalType = undefined;
        validatedData.goalValue = undefined;
        
        // Deletar meta do banco se existir
        const { data: existingGoal, error: goalFetchError } = await supabase
          .from("goals")
          .select("id")
          .eq("client_id", clientData.id)
          .maybeSingle();

        if (goalFetchError) {
          console.error("❌ Erro ao buscar meta existente:", goalFetchError);
          throw new Error("Não foi possível buscar a meta existente");
        }

        if (existingGoal) {
          console.log("🗑️ Deletando meta do cliente:", clientData.id);
          const { error: deleteError } = await supabase
            .from("goals")
            .delete()
            .eq("id", existingGoal.id);

          if (deleteError) {
            console.error("❌ Erro ao deletar meta:", deleteError);
            throw new Error("Não foi possível remover a meta do cliente");
          }
          console.log("✅ Meta deletada com sucesso");
        }
      }

      // Atualizar o cliente no Supabase (só nome se não for investidor)
      if (!isInvestidor) {
        const { error: updateError } = await supabase
          .from("clients")
          .update({
            name: validatedData.name,
            categoria_problema: categoriaProblema || null,
            problema_central: problemaCentral || null,
          })
          .eq("id", clientData.id);

        if (updateError) throw updateError;
      }

      // Atualizar ou criar a meta se necessário
      if (validatedData.hasGoal === "SIM" || validatedData.hasGoal === "NAO_DEFINIDO") {
        const goalStatus = validatedData.hasGoal === "SIM" ? "em_andamento" : "nao_definida";
        
        const { data: existingGoal, error: goalFetchError } = await supabase
          .from("goals")
          .select("id")
          .eq("client_id", clientData.id)
          .maybeSingle();

        if (goalFetchError) {
          console.error("❌ Erro ao buscar meta existente:", goalFetchError);
          throw new Error("Não foi possível buscar a meta existente");
        }

        if (existingGoal) {
          // Atualizar meta existente
          console.log("📝 Atualizando meta existente:", existingGoal.id);
          const { error: updateError } = await supabase
            .from("goals")
            .update({
              goal_type: validatedData.goalType || "OUTROS",
              goal_value: validatedData.goalValue || "",
              status: goalStatus,
              period: goalPeriod,
            })
            .eq("id", existingGoal.id);

          if (updateError) {
            console.error("❌ Erro ao atualizar meta:", updateError);
            throw new Error("Não foi possível atualizar a meta");
          }
          console.log("✅ Meta atualizada com sucesso");
        } else {
          // Criar nova meta
          console.log("➕ Criando nova meta para cliente:", clientData.id);
          const { error: insertError } = await supabase
            .from("goals")
            .insert({
              client_id: clientData.id,
              goal_type: validatedData.goalType || "OUTROS",
              goal_value: validatedData.goalValue || "",
              status: goalStatus,
              progress: 0,
              period: goalPeriod,
            });

          if (insertError) {
            console.error("❌ Erro ao criar meta:", insertError);
            throw new Error("Não foi possível criar a meta");
          }
          console.log("✅ Meta criada com sucesso");
        }
      }

      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ["squads-with-clients"] });
      
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
      } else {
        console.error("Error updating client:", error);
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar o cliente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
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
          <DialogTitle>{isInvestidor ? "Editar Meta do Cliente" : "Editar Cliente"}</DialogTitle>
          <DialogDescription>
            {isInvestidor ? "Atualize as informações de meta do cliente" : "Atualize as informações e metas do cliente"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isInvestidor && (
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
          )}

          {isInvestidor && (
            <div className="space-y-2">
              <Label>Cliente</Label>
              <div className="font-semibold text-lg">{client?.name}</div>
            </div>
          )}

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

              <div className="space-y-2">
                <Label htmlFor="goalPeriod">Período da Meta</Label>
                <Select
                  value={goalPeriod}
                  onValueChange={(value: "mensal" | "trimestral" | "semestral" | "anual") => setGoalPeriod(value)}
                >
                  <SelectTrigger id="goalPeriod">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">📅 Mensal (4 check-ins)</SelectItem>
                    <SelectItem value="trimestral">📊 Trimestral (12 check-ins)</SelectItem>
                    <SelectItem value="semestral">📈 Semestral (24 check-ins)</SelectItem>
                    <SelectItem value="anual">🎯 Anual (52 check-ins)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Categoria e Problema Central - só para coordenadores e supervisores */}
          {!isInvestidor && (
            <>
              {client?.healthStatus && CATEGORY_REQUIRED_STATUSES.includes(client.healthStatus) && (
                <div className="space-y-2">
                  <Label htmlFor="categoriaProblema">Categoria do Problema</Label>
                  <Select
                    value={categoriaProblema || "none"}
                    onValueChange={(value) => setCategoriaProblema(value === "none" ? "" : value)}
                  >
                    <SelectTrigger id="categoriaProblema">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {PROBLEM_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="problemaCentral">Problema Central do Projeto</Label>
                <Textarea
                  id="problemaCentral"
                  placeholder="Descreva o problema central do projeto..."
                  value={problemaCentral}
                  onChange={(e) => setProblemaCentral(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

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
