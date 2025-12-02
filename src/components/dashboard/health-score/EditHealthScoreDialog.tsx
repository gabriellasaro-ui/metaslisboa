import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ExtendedHealthStatus, healthStatusLabels } from "./HealthScoreBadge";
import { Loader2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  health_status: ExtendedHealthStatus | null;
  problema_central: string | null;
  categoria_problema?: string | null;
  squadName?: string;
}

interface EditHealthScoreDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PROBLEM_CATEGORIES = [
  "Visão do projeto",
  "Comercial",
  "Financeiro",
  "Resultado do Cliente",
  "Qualidade Geral",
  "Dados concretos",
  "Outro",
];

export const EditHealthScoreDialog = ({ client, open, onOpenChange, onSuccess }: EditHealthScoreDialogProps) => {
  const [healthStatus, setHealthStatus] = useState<ExtendedHealthStatus>('safe');
  const [problemaCentral, setProblemaCentral] = useState('');
  const [categoriaProblema, setCategoriaProblema] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (client) {
      setHealthStatus(client.health_status || 'safe');
      setProblemaCentral(client.problema_central || '');
      setCategoriaProblema(client.categoria_problema || '');
    }
  }, [client]);

  const handleSubmit = async () => {
    if (!client?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          health_status: healthStatus,
          problema_central: problemaCentral || null,
          categoria_problema: categoriaProblema || null,
        })
        .eq('id', client.id);

      if (error) throw error;

      toast.success("Health Score atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["squads-with-clients"] });
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Health Score</DialogTitle>
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
                {Object.entries(healthStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria-problema">Categoria do Problema</Label>
            <Select value={categoriaProblema} onValueChange={setCategoriaProblema}>
              <SelectTrigger id="categoria-problema">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {PROBLEM_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problema-central">Problema Central</Label>
            <Textarea
              id="problema-central"
              placeholder="Descreva o problema central do cliente..."
              value={problemaCentral}
              onChange={(e) => setProblemaCentral(e.target.value)}
              rows={4}
            />
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
