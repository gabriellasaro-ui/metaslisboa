import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar, TrendingUp, MessageSquare, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WeeklyCheckInFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  goalId: string | null;
  currentProgress: number;
}

export const WeeklyCheckInForm = ({
  open,
  onOpenChange,
  clientId,
  clientName,
  goalId,
  currentProgress,
}: WeeklyCheckInFormProps) => {
  const [progress, setProgress] = useState(currentProgress);
  const [status, setStatus] = useState<"on_track" | "at_risk" | "delayed" | "completed">("on_track");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Comentário obrigatório", {
        description: "Adicione um comentário sobre o progresso semanal",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Inserir check-in
      const { error: checkInError } = await supabase.from("check_ins").insert({
        client_id: clientId,
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
        description: `Progresso de ${clientName} atualizado para ${progress}%`,
      });

      // Resetar form
      setComment("");
      setProgress(currentProgress);
      setStatus("on_track");
      onOpenChange(false);
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
              <DialogDescription className="text-base mt-1">{clientName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progresso */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Progresso da Meta
              </Label>
              <span className="text-2xl font-bold text-primary">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
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
            disabled={isSubmitting || !comment.trim()}
            className="flex-1"
          >
            {isSubmitting ? "Salvando..." : "Registrar Check-in"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
