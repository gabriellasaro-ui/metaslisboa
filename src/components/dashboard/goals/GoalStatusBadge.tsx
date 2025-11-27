import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, CircleDashed } from "lucide-react";

type GoalStatus = "nao_definida" | "em_andamento" | "concluida" | "nao_batida" | "cancelada";

interface GoalStatusBadgeProps {
  status: GoalStatus;
  progress?: number;
}

export const GoalStatusBadge = ({ status, progress }: GoalStatusBadgeProps) => {
  const configs = {
    nao_definida: {
      label: "Não Iniciada",
      icon: CircleDashed,
      className: "bg-muted/50 text-muted-foreground border-border",
    },
    em_andamento: {
      label: "Em Andamento",
      icon: Clock,
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    concluida: {
      label: "Meta Batida! 🎉",
      icon: CheckCircle2,
      className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 shadow-sm shadow-green-500/20",
    },
    nao_batida: {
      label: "Meta Não Batida",
      icon: XCircle,
      className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
    cancelada: {
      label: "Cancelada",
      icon: XCircle,
      className: "bg-muted text-muted-foreground border-border",
    },
  };

  const config = configs[status] || configs.nao_definida;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
      {status === "em_andamento" && progress !== undefined && (
        <span className="ml-1 font-semibold">{progress}%</span>
      )}
    </Badge>
  );
};