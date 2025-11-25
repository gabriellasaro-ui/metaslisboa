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
  default: "bg-card border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
  success: "bg-gradient-to-br from-emerald-900/40 to-emerald-950/20 border-emerald-600/40 hover:border-emerald-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02]",
  warning: "bg-gradient-to-br from-amber-900/40 to-amber-950/20 border-amber-600/40 hover:border-amber-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02]",
  danger: "bg-gradient-to-br from-red-900/40 to-red-950/20 border-red-600/40 hover:border-red-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02]",
};

const iconVariantStyles = {
  default: "text-primary animate-pulse",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
};

export const MetricsCard = ({ title, value, icon: Icon, description, variant = "default" }: MetricsCardProps) => {
  return (
    <Card className={`${variantStyles[variant]} animate-fade-in backdrop-blur`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground/90">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-background/50">
          <Icon className={`h-5 w-5 ${iconVariantStyles[variant]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
