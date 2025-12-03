import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ExtendedHealthStatus, healthStatusLabels } from "./HealthScoreBadge";
import { Loader2 } from "lucide-react";
import { addNotesToHistory } from "@/hooks/useHealthScoreHistory";

interface Client {
  id: string;
  name: string;
  health_status: ExtendedHealthStatus | null;
  problema_central: string | null;
  categoria_problema?: string | null;
  squadName?: string;
  status?: string;
}

interface EditHealthScoreDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

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

// All health statuses available for coordinators/supervisors
const ALL_HEALTH_STATUSES: ExtendedHealthStatus[] = [
  'safe', 'care', 'danger', 'danger_critico', 'onboarding', 'e_e', 'aviso_previo', 'churn'
];

// Critical statuses that require justification
const CRITICAL_STATUSES: ExtendedHealthStatus[] = ['danger', 'danger_critico', 'churn'];

// Statuses that require problem category
const CATEGORY_REQUIRED_STATUSES: ExtendedHealthStatus[] = ['danger', 'danger_critico', 'aviso_previo', 'churn'];

// Map health_status to client status
const getClientStatusFromHealth = (healthStatus: ExtendedHealthStatus): 'ativo' | 'aviso_previo' | 'churned' | null => {
  if (healthStatus === 'aviso_previo') return 'aviso_previo';
  if (healthStatus === 'churn') return 'churned';
  // For other statuses, return 'ativo' only if coming from aviso_previo/churn
  return null; // Don't change status for other health changes
};

export const EditHealthScoreDialog = ({ client, open, onOpenChange, onSuccess }: EditHealthScoreDialogProps) => {
  const [healthStatus, setHealthStatus] = useState<ExtendedHealthStatus>('safe');
  const [problemaCentral, setProblemaCentral] = useState('');
  const [categoriaProblema, setCategoriaProblema] = useState('');
  const [notes, setNotes] = useState('');
  const [notesError, setNotesError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const isNotesRequired = CRITICAL_STATUSES.includes(healthStatus);

  useEffect(() => {
    if (client) {
      setHealthStatus(client.health_status || 'safe');
      setProblemaCentral(client.problema_central || '');
      setCategoriaProblema(client.categoria_problema || '');
      setNotes('');
      setNotesError('');
    }
  }, [client]);

  const handleSubmit = async () => {
    if (!client?.id) return;

    // Validate required notes for critical statuses
    if (isNotesRequired && !notes.trim()) {
      setNotesError('Justificativa obrigatória para status críticos');
      return;
    }
    setNotesError('');

    setIsLoading(true);
    try {
      // Prepare update data
      const updateData: Record<string, any> = {
        health_status: healthStatus,
        problema_central: problemaCentral || null,
        categoria_problema: categoriaProblema || null,
      };

      // Sync client status based on health_status
      if (healthStatus === 'aviso_previo') {
        updateData.status = 'aviso_previo';
        updateData.aviso_previo_date = new Date().toISOString();
      } else if (healthStatus === 'churn') {
        updateData.status = 'churned';
        updateData.churned_date = new Date().toISOString();
      } else if (client.status === 'aviso_previo' || client.status === 'churned') {
        // If client was in aviso_previo/churned and now changing to another health status, set back to ativo
        updateData.status = 'ativo';
      }

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', client.id);

      if (error) throw error;

      // Add notes to the history entry if provided
      if (notes.trim()) {
        try {
          await addNotesToHistory(client.id, notes.trim());
        } catch (notesError) {
          console.error("Error adding notes to history:", notesError);
        }
      }

      toast.success("Health Score atualizado com sucesso!");
      await queryClient.invalidateQueries({ queryKey: ["squads-with-clients"] });
      await queryClient.invalidateQueries({ queryKey: ["health-score-history", client.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating health score:", error);
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Health Score</DialogTitle>
          <DialogDescription>
            Atualize o health score e problema central do cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <p className="text-sm font-medium">{client?.name}</p>
            {client?.squadName && (
              <p className="text-xs text-muted-foreground">{client.squadName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="health-status">Health Status</Label>
            <Select value={healthStatus} onValueChange={(v) => setHealthStatus(v as ExtendedHealthStatus)}>
              <SelectTrigger id="health-status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {ALL_HEALTH_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {healthStatusLabels[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {CATEGORY_REQUIRED_STATUSES.includes(healthStatus) && (
            <div className="space-y-2">
              <Label htmlFor="categoria-problema">Categoria do Problema</Label>
              <Select value={categoriaProblema || "none"} onValueChange={(v) => setCategoriaProblema(v === "none" ? "" : v)}>
                <SelectTrigger id="categoria-problema">
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
            <Label htmlFor="problema-central">Problema Central do Projeto</Label>
            <Textarea
              id="problema-central"
              placeholder="Descreva o problema central do projeto..."
              value={problemaCentral}
              onChange={(e) => setProblemaCentral(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className={isNotesRequired ? "text-destructive" : ""}>
              Justificativa {isNotesRequired ? "(obrigatória)" : "(opcional)"}
            </Label>
            <Textarea
              id="notes"
              placeholder={isNotesRequired 
                ? "Explique o motivo da mudança para este status crítico..." 
                : "Adicione observações sobre a mudança, como discussões do comitê semanal..."}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (notesError) setNotesError('');
              }}
              rows={2}
              className={`text-sm ${notesError ? 'border-destructive' : ''}`}
            />
            {notesError && (
              <p className="text-xs text-destructive">{notesError}</p>
            )}
            {!notesError && (
              <p className="text-xs text-muted-foreground">
                {isNotesRequired 
                  ? "Status críticos requerem justificativa para auditoria."
                  : "Estas observações serão salvas no histórico de alterações."}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
