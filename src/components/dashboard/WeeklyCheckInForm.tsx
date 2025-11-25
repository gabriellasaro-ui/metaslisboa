import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar, TrendingUp, MessageSquare, Target, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientSelector } from "./ClientSelector";

interface WeeklyCheckInFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const WeeklyCheckInForm = ({
  open,
  onOpenChange,
  onSuccess,
}: WeeklyCheckInFormProps) => {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"on_track" | "at_risk" | "delayed" | "completed">("on_track");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClientSelect = (clientId: string, clientData: any) => {
    setSelectedClient(clientData);
    // Se o cliente tem meta, pegar o progresso atual
    if (clientData.goals && clientData.goals.length > 0) {
      setProgress(clientData.goals[0].progress || 0);
    } else {
      setProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClient) {
      toast.error("Cliente não selecionado", {
        description: "Selecione um cliente antes de continuar",
      });
      return;
    }

    if (!comment.trim()) {
      toast.error("Comentário obrigatório", {
        description: "Adicione um comentário sobre o progresso semanal",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const goalId = selectedClient.goals && selectedClient.goals.length > 0 
        ? selectedClient.goals[0].id 
        : null;

      // 1. Inserir check-in
      const { error: checkInError } = await supabase.from("check_ins").insert({
        client_id: selectedClient.id,
        goal_id: goalId,
        progress: progress,
        status: status,
        comment: comment,
        created_by: "Sistema", // TODO: substituir por usuário autenticado
      });

      if (checkInError) throw checkInError;

      // 2. Atualizar progresso da meta (se existir)
      if (goalId) {
        const { error: goalError } = await supabase
          .from("goals")
          .update({
            progress: progress,
            status: progress === 100 ? "concluida" : "em_andamento",
            completed_date: progress === 100 ? new Date().toISOString() : null,
          })
          .eq("id", goalId);

        if (goalError) throw goalError;
      }

      toast.success("Check-in registrado!", {
        description: `Progresso de ${selectedClient.name} atualizado para ${progress}%`,
      });

      // Resetar form
      setComment("");
      setProgress(0);
      setStatus("on_track");
      setSelectedClient(null);
      onOpenChange(false);
      
      // Callback de sucesso para atualizar timeline
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Erro ao registrar check-in:", error);
      toast.error("Erro ao registrar check-in", {
        description: error.message || "Tente novamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Check-in Semanal</DialogTitle>
              <DialogDescription className="text-base mt-1">
                {selectedClient ? selectedClient.name : "Selecione um cliente"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seleção de Cliente */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Selecionar Cliente *
            </Label>
            <ClientSelector
              value={selectedClient?.id}
              onValueChange={handleClientSelect}
              placeholder="Escolha o cliente para o check-in"
            />
            {selectedClient && (
              <div className="bg-muted/30 rounded-lg p-3 border border-border/30 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Squad:</span>
                  <span className="font-semibold">{selectedClient.squad?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Líder:</span>
                  <span className="font-semibold">{selectedClient.squad?.leader?.name}</span>
                </div>
                {selectedClient.goals && selectedClient.goals.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">Meta Atual:</p>
                    <p className="text-sm font-medium">{selectedClient.goals[0].goal_value}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progresso */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Progresso da Meta
              </Label>
              <span className="text-2xl font-bold text-primary">{progress}%</span>
            </div>
            
            {/* Slider com marcadores visuais */}
            <div className="relative py-6">
              {/* Marcadores visuais */}
              <div className="absolute top-0 left-0 right-0 flex justify-between px-1">
                {[0, 25, 50, 75, 100].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <div 
                      className={`h-2 w-2 rounded-full transition-all duration-200 ${
                        progress === value 
                          ? 'bg-primary scale-150 shadow-lg shadow-primary/50' 
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  </div>
                ))}
              </div>
              
              {/* Slider */}
              <div className="mt-6">
                <Slider
                  value={[progress]}
                  onValueChange={(value) => setProgress(value[0])}
                  max={100}
                  step={25}
                  className="py-2"
                />
              </div>
            </div>
            
            {/* Labels dos valores */}
            <div className="flex justify-between text-xs font-medium">
              {[0, 25, 50, 75, 100].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setProgress(value)}
                  className={`px-2 py-1 rounded transition-all ${
                    progress === value
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Status Atual
            </Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on_track">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    No Prazo
                  </div>
                </SelectItem>
                <SelectItem value="at_risk">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    Em Risco
                  </div>
                </SelectItem>
                <SelectItem value="delayed">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    Atrasado
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    Concluído
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comentário */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Comentário Semanal *
            </Label>
            <Textarea
              placeholder="Descreva o progresso desta semana, desafios enfrentados e próximos passos..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo: breve atualização sobre o que foi feito
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="premium"
            onClick={handleSubmit}
            disabled={isSubmitting || !comment.trim() || !selectedClient}
            className="flex-1"
          >
            {isSubmitting ? "Salvando..." : "Registrar Check-in"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
