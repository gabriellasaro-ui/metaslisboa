import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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

  // Resetar form quando fechar o modal
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedClient(null);
      setProgress(0);
      setStatus("on_track");
      setComment("");
      setCallSummary("");
      setCallLink("");
    }
    onOpenChange(newOpen);
  };

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
    console.log("🔍 DEBUG - handleSubmit chamado");
    console.log("📋 Cliente selecionado:", selectedClient);
    console.log("📊 Progresso:", progress);
    console.log("⚡ Status:", status);
    console.log("💬 Comentário:", comment);
    
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

    // Validação de progresso
    if (progress < 0 || progress > 100) {
      toast.error("Progresso inválido", {
        description: "O progresso deve estar entre 0 e 100",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      console.log("👤 Usuário autenticado:", userId);

      if (!userId) {
        toast.error("Erro de autenticação", {
          description: "Não foi possível identificar o usuário",
        });
        return;
      }

      const goalId = selectedClient.goals && selectedClient.goals.length > 0 
        ? selectedClient.goals[0].id 
        : null;

      console.log("🎯 Goal ID:", goalId);

      const checkInData = {
        client_id: selectedClient.id,
        goal_id: goalId,
        progress: progress,
        status: status,
        comment: comment.trim(),
        call_summary: callSummary?.trim() || null,
        call_link: callLink?.trim() || null,
        created_by: userId, // CORRIGIDO: agora usa o UUID do usuário
      };

      console.log("📤 Dados do check-in a serem inseridos:", checkInData);

      // 1. Inserir check-in
      const { data: checkInResult, error: checkInError } = await supabase
        .from("check_ins")
        .insert(checkInData)
        .select();

      if (checkInError) {
        console.error("❌ Erro ao inserir check-in:", checkInError);
        throw checkInError;
      }

      console.log("✅ Check-in inserido com sucesso:", checkInResult);

      // 2. Atualizar progresso da meta (se existir)
      if (goalId) {
        const goalUpdate = {
          progress: progress,
          status: (progress === 100 ? "concluida" : "em_andamento") as "concluida" | "em_andamento" | "nao_definida" | "cancelada" | "nao_batida",
          completed_date: progress === 100 ? new Date().toISOString() : null,
        };

        console.log("📤 Atualizando meta:", goalUpdate);

        const { data: goalResult, error: goalError } = await supabase
          .from("goals")
          .update(goalUpdate)
          .eq("id", goalId)
          .select();

        if (goalError) {
          console.error("❌ Erro ao atualizar meta:", goalError);
          throw goalError;
        }

        console.log("✅ Meta atualizada com sucesso:", goalResult);

        // 3. Se progresso = 100%, disparar geração de relatório com IA
        if (progress === 100) {
          console.log("🎉 Meta batida! Gerando relatório com IA...");
          
          const { error: analysisError } = await supabase.functions.invoke("analyze-goal", {
            body: { goalId },
          });

          if (analysisError) {
            console.error("❌ Erro ao gerar análise:", analysisError);
            // Não bloquear o check-in se a análise falhar
            toast.error("Aviso: Relatório de IA não pôde ser gerado", {
              description: "O check-in foi registrado com sucesso",
            });
          } else {
            console.log("✅ Análise gerada com sucesso!");
          }
        }
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
      handleOpenChange(false);
      
      // Callback de sucesso para atualizar timeline
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("❌ Erro geral ao registrar check-in:", error);
      toast.error("Erro ao registrar check-in", {
        description: error.message || "Tente novamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
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

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Seleção de Cliente */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Selecionar Cliente *
            </Label>
            <ClientSelector
              value={selectedClient?.id || undefined}
              onValueChange={handleClientSelect}
              placeholder="Escolha o cliente para o check-in"
            />
            {selectedClient && (
              <div className="bg-muted/30 rounded-lg p-3 border border-border/30 mt-2 max-w-full overflow-hidden">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Squad:</span>
                  <span className="font-semibold">{selectedClient.squad?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Líder:</span>
                  <span className="font-semibold">{selectedClient.squad?.leader?.name}</span>
                </div>
                {selectedClient.goals && selectedClient.goals.length > 0 ? (
                  <div className="mt-2 pt-2 border-t border-border/30 space-y-2">
                    {selectedClient.goals[0].period && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Período da Meta:</p>
                        <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                          {selectedClient.goals[0].period === "mensal" && "📅 Mensal"}
                          {selectedClient.goals[0].period === "trimestral" && "📅 Trimestral"}
                          {selectedClient.goals[0].period === "semestral" && "📅 Semestral"}
                          {selectedClient.goals[0].period === "anual" && "📅 Anual"}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Meta Atual:</p>
                      <p className="text-sm font-medium break-words">{selectedClient.goals[0].goal_value}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-xs text-amber-600 dark:text-amber-500">⚠️ Cliente sem meta definida</p>
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
            
            {/* Barra de Progresso Visual */}
            <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* UI Dinâmica baseada no período da meta */}
            {selectedClient?.goals?.[0]?.period === "mensal" ? (
              // MENSAL: Botões fixos 0, 25, 50, 75, 100%
              <div className="flex gap-2">
                {[0, 25, 50, 75, 100].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setProgress(value)}
                    className={`flex-1 px-2 py-2 rounded-lg transition-all duration-200 text-sm font-semibold ${
                      progress === value
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            ) : (
              // OUTRAS PERÍODOS: Botões de incremento + Input customizado (sem slider para economizar espaço)
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProgress(Math.min(100, progress + 5))}
                      disabled={progress >= 100}
                      className="h-8"
                    >
                      +5%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProgress(Math.min(100, progress + 10))}
                      disabled={progress >= 100}
                      className="h-8"
                    >
                      +10%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProgress(Math.min(100, progress + 15))}
                      disabled={progress >= 100}
                      className="h-8"
                    >
                      +15%
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <Label htmlFor="progress-input" className="text-sm whitespace-nowrap">Digite:</Label>
                    <Input
                      id="progress-input"
                      type="number"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setProgress(Math.min(100, Math.max(0, val)));
                      }}
                      className="w-16 h-8 text-center"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </div>
                
                {selectedClient?.goals?.[0]?.period && (
                  <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-1.5 border border-border/30">
                    💡 {selectedClient.goals[0].period === "trimestral" && "~8% por semana"}
                    {selectedClient.goals[0].period === "semestral" && "~4% por semana"}
                    {selectedClient.goals[0].period === "anual" && "~2% por semana"}
                  </div>
                )}
              </div>
            )}
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
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo: breve atualização sobre o que foi feito
            </p>
          </div>

          {/* Campos Opcionais - Compactos */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-xs font-medium text-muted-foreground">📎 Links Opcionais</p>
            
            <div className="space-y-2">
              <Label htmlFor="call-summary" className="text-sm flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Documento da Call
              </Label>
              <Input
                id="call-summary"
                type="url"
                placeholder="https://docs.google.com/document/d/..."
                value={callSummary}
                onChange={(e) => setCallSummary(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="call-link" className="text-sm flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Link da Gravação
              </Label>
              <Input
                id="call-link"
                type="url"
                placeholder="https://drive.google.com/..."
                value={callLink}
                onChange={(e) => setCallLink(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="flex-1">
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
