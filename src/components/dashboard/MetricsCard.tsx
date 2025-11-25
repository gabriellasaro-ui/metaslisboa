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
  default: "bg-gradient-to-br from-card via-card to-muted/10 border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.03] group relative overflow-hidden",
  success: "bg-gradient-to-br from-emerald-500/10 via-card to-emerald-500/5 border-emerald-500/30 hover:border-emerald-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.03] group relative overflow-hidden",
  warning: "bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 border-amber-500/30 hover:border-amber-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-[1.03] group relative overflow-hidden",
  danger: "bg-gradient-to-br from-red-500/10 via-card to-red-500/5 border-red-500/30 hover:border-red-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/30 hover:scale-[1.03] group relative overflow-hidden",
};

const iconVariantStyles = {
  default: "text-primary group-hover:scale-110 transition-transform duration-500",
  success: "text-emerald-400 group-hover:text-emerald-300 group-hover:scale-110 transition-all duration-500",
  warning: "text-amber-400 group-hover:text-amber-300 group-hover:scale-110 transition-all duration-500",
  danger: "text-red-400 group-hover:text-red-300 group-hover:scale-110 transition-all duration-500",
};

const iconBgVariants = {
  default: "bg-primary/10 group-hover:bg-primary/20",
  success: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  warning: "bg-amber-500/10 group-hover:bg-amber-500/20",
  danger: "bg-red-500/10 group-hover:bg-red-500/20",
};

export const MetricsCard = ({ title, value, icon: Icon, description, variant = "default" }: MetricsCardProps) => {
  return (
    <Card className={`${variantStyles[variant]} animate-fade-in backdrop-blur-sm`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-300">
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-xl ${iconBgVariants[variant]} transition-all duration-500 shadow-sm`}>
          <Icon className={`h-5 w-5 ${iconVariantStyles[variant]}`} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-4xl font-bold text-foreground mb-1 tracking-tight">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
