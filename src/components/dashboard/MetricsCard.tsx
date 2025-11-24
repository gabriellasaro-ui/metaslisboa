import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "bg-card",
  success: "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20",
  warning: "bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20",
  danger: "bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20",
};

const iconVariantStyles = {
  default: "text-primary",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
};

export const MetricsCard = ({ title, value, icon: Icon, description, variant = "default" }: MetricsCardProps) => {
  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconVariantStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
