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
  const [callSummary, setCallSummary] = useState("");
  const [callLink, setCallLink] = useState("");
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
        call_summary: callSummary || null,
        call_link: callLink || null,
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
      setCallSummary("");
      setCallLink("");
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Progresso da Meta
              </Label>
              <span className="text-2xl font-bold text-primary">{progress}%</span>
            </div>
            
            {/* Barra de Progresso Visual */}
            <div className="relative h-12 bg-muted/30 rounded-xl overflow-hidden border-2 border-border/50">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-700 ease-out flex items-center justify-end px-3"
                style={{ width: `${progress}%` }}
              >
                {progress > 0 && (
                  <span className="text-primary-foreground font-bold text-sm animate-fade-in">
                    {progress}%
                  </span>
                )}
              </div>
              {progress === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  Deslize ou clique para definir o progresso
                </div>
              )}
            </div>
            
            {/* Slider com marcadores visuais */}
            <div className="relative py-6">
              {/* Marcadores visuais */}
              <div className="absolute top-0 left-0 right-0 flex justify-between px-1">
                {[0, 25, 50, 75, 100].map((value) => (
                  <div key={value} className="flex flex-col items-center gap-1">
                    <div 
                      className={`h-3 w-3 rounded-full transition-all duration-300 border-2 ${
                        progress >= value
                          ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/50' 
                          : 'bg-background border-muted-foreground/30'
                      }`}
                    />
                    {progress === value && (
                      <div className="absolute -top-6 bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold animate-bounce-in">
                        {value}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Slider */}
              <div className="mt-8">
                <Slider
                  value={[progress]}
                  onValueChange={(value) => setProgress(value[0])}
                  max={100}
                  step={25}
                  className="py-2"
                />
              </div>
            </div>
            
            {/* Labels dos valores clicáveis */}
            <div className="flex justify-between gap-2">
              {[0, 25, 50, 75, 100].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setProgress(value)}
                  className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-semibold border-2 ${
                    progress === value
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                      : 'bg-background border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:scale-102'
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
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo: breve atualização sobre o que foi feito
            </p>
          </div>

          {/* Resumo da Call */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent-foreground" />
              Resumo da Call (Opcional)
            </Label>
            <Textarea
              placeholder="Resumo dos principais pontos discutidos na call, decisões tomadas, ações definidas..."
              value={callSummary}
              onChange={(e) => setCallSummary(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Link da Call */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent-foreground" />
              Link da Call no Drive (Opcional)
            </Label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={callLink}
              onChange={(e) => setCallLink(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              Cole o link da gravação ou documentos relacionados
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
