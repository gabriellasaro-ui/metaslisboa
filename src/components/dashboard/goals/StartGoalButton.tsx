import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface StartGoalButtonProps {
  goalId: string;
  period: "mensal" | "trimestral" | "semestral" | "anual";
  clientName: string;
  onStarted?: () => void;
}

export const StartGoalButton = ({ goalId, period, clientName, onStarted }: StartGoalButtonProps) => {
  const [isStarting, setIsStarting] = useState(false);
  const { role } = useAuth();

  // Apenas Investidores e Coordenadores podem iniciar metas
  const canStart = role === "investidor" || role === "coordenador";

  if (!canStart) {
    return null;
  }

  const calculateTargetDate = (periodType: string): string => {
    const now = new Date();
    const daysToAdd = {
      mensal: 30,
      trimestral: 90,
      semestral: 180,
      anual: 365,
    }[periodType] || 30;

    const targetDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return targetDate.toISOString();
  };

  const handleStartGoal = async () => {
    setIsStarting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const targetDate = calculateTargetDate(period);

      const { error } = await supabase
        .from("goals")
        .update({
          started_at: new Date().toISOString(),
          started_by: user.id,
          target_date: targetDate,
          status: "em_andamento",
        })
        .eq("id", goalId);

      if (error) throw error;

      toast.success("Meta iniciada!", {
        description: `O cronômetro para ${clientName} começou a contar.`,
      });

      if (onStarted) onStarted();
    } catch (error: any) {
      console.error("Erro ao iniciar meta:", error);
      toast.error("Erro ao iniciar meta", {
        description: error.message || "Tente novamente",
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Button
      onClick={handleStartGoal}
      disabled={isStarting}
      size="sm"
      className="gap-2"
    >
      {isStarting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Iniciando...
        </>
      ) : (
        <>
          <PlayCircle className="h-4 w-4" />
          Iniciar Meta
        </>
      )}
    </Button>
  );
};