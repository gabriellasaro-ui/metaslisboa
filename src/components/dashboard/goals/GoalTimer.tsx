import { useEffect, useState } from "react";
import { Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GoalTimerProps {
  goalId: string;
  targetDate: string;
  startedAt: string;
  status: string;
  onTimeExpired?: () => void;
}

export const GoalTimer = ({ goalId, targetDate, startedAt, status, onTimeExpired }: GoalTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0 && !hasExpired && status === "em_andamento") {
        setHasExpired(true);
        handleExpiration();
        return null;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return { days, hours, minutes };
    };

    const handleExpiration = async () => {
      try {
        // Chamar edge function para análise
        const { error: analysisError } = await supabase.functions.invoke("analyze-goal", {
          body: { goalId },
        });

        if (analysisError) {
          console.error("Erro ao chamar análise:", analysisError);
        }

        // Atualizar status da meta
        const { error: updateError } = await supabase
          .from("goals")
          .update({ status: "nao_batida" })
          .eq("id", goalId);

        if (updateError) throw updateError;

        toast.error("Tempo esgotado!", {
          description: "A meta não foi concluída no prazo. Relatório gerado.",
        });

        if (onTimeExpired) onTimeExpired();
      } catch (error: any) {
        console.error("Erro ao processar expiração:", error);
        toast.error("Erro ao processar expiração", {
          description: error.message,
        });
      }
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, [targetDate, goalId, hasExpired, status, onTimeExpired]);

  if (!timeLeft || status !== "em_andamento") {
    return null;
  }

  const totalDays = Math.floor((new Date(targetDate).getTime() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = totalDays - timeLeft.days;
  const progressPercentage = (daysElapsed / totalDays) * 100;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Tempo Restante</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{new Date(targetDate).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-3 justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{timeLeft.days}</div>
            <div className="text-xs text-muted-foreground">dias</div>
          </div>
          <div className="text-2xl text-muted-foreground">:</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{timeLeft.hours}</div>
            <div className="text-xs text-muted-foreground">horas</div>
          </div>
          <div className="text-2xl text-muted-foreground">:</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{timeLeft.minutes}</div>
            <div className="text-xs text-muted-foreground">min</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{daysElapsed} dias decorridos</span>
            <span>{totalDays} dias totais</span>
          </div>
        </div>
      </div>
    </div>
  );
};