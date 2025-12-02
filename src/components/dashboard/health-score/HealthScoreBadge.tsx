import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, AlertCircle, Zap, UserPlus, Briefcase, Clock, XCircle } from "lucide-react";

export type ExtendedHealthStatus = 
  | 'safe' 
  | 'care' 
  | 'danger' 
  | 'danger_critico' 
  | 'onboarding' 
  | 'e_e' 
  | 'aviso_previo' 
  | 'churn';

interface HealthScoreBadgeProps {
  status: ExtendedHealthStatus;
  size?: 'sm' | 'md' | 'lg';
}

const configs: Record<ExtendedHealthStatus, { label: string; icon: typeof Shield; className: string }> = {
  safe: {
    label: "Safe",
    icon: Shield,
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  care: {
    label: "Care",
    icon: AlertTriangle,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  danger: {
    label: "Danger",
    icon: AlertCircle,
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },
  danger_critico: {
    label: "Danger Crítico",
    icon: Zap,
    className: "bg-red-700/10 text-red-800 dark:text-red-300 border-red-700/20",
  },
  onboarding: {
    label: "Onboarding",
    icon: UserPlus,
    className: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  },
  e_e: {
    label: "E.E.",
    icon: Briefcase,
    className: "bg-orange-600/10 text-orange-700 dark:text-orange-400 border-orange-600/20",
  },
  aviso_previo: {
    label: "Aviso Prévio",
    icon: Clock,
    className: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
  },
  churn: {
    label: "Churn",
    icon: XCircle,
    className: "bg-zinc-700/10 text-zinc-700 dark:text-zinc-400 border-zinc-700/20",
  },
};

export const HealthScoreBadge = ({ status, size = 'md' }: HealthScoreBadgeProps) => {
  const config = configs[status] || configs.safe;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge variant="outline" className={`${config.className} ${size === 'lg' ? 'px-3 py-1' : ''}`}>
      <Icon className={`${sizeClasses[size]} mr-1`} />
      {config.label}
    </Badge>
  );
};

export const getHealthScoreColor = (status: ExtendedHealthStatus): string => {
  const colors: Record<ExtendedHealthStatus, string> = {
    safe: "hsl(152, 69%, 35%)",
    care: "hsl(45, 93%, 47%)",
    danger: "hsl(0, 84%, 60%)",
    danger_critico: "hsl(0, 72%, 40%)",
    onboarding: "hsl(263, 70%, 50%)",
    e_e: "hsl(25, 95%, 53%)",
    aviso_previo: "hsl(215, 16%, 47%)",
    churn: "hsl(240, 5%, 34%)",
  };
  return colors[status] || colors.safe;
};

export const healthStatusLabels: Record<ExtendedHealthStatus, string> = {
  safe: "Safe",
  care: "Care",
  danger: "Danger",
  danger_critico: "Danger Crítico",
  onboarding: "Onboarding",
  e_e: "E.E.",
  aviso_previo: "Aviso Prévio",
  churn: "Churn",
};
