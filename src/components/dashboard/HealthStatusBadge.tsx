import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";

type HealthStatus = 'safe' | 'care' | 'danger';

interface HealthStatusBadgeProps {
  status: HealthStatus;
}

export const HealthStatusBadge = ({ status }: HealthStatusBadgeProps) => {
  const configs = {
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
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};
