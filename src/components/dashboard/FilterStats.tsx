import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, AlertCircle, Users } from "lucide-react";
import { Client } from "@/data/clientsData";

interface FilterStatsProps {
  clients: Array<Client & { squadName: string; leader: string }>;
}

export const FilterStats = ({ clients }: FilterStatsProps) => {
  const total = clients.length;
  const withGoals = clients.filter(c => c.hasGoal === "SIM").length;
  const pending = clients.filter(c => c.hasGoal === "NAO_DEFINIDO").length;
  const withoutGoals = clients.filter(c => c.hasGoal === "NAO").length;
  
  const avgProgress = clients
    .filter(c => c.hasGoal === "SIM" && c.currentProgress)
    .reduce((sum, c) => sum + (c.currentProgress || 0), 0) / (withGoals || 1);

  const stats = [
    {
      label: "Total Filtrado",
      value: total,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      label: "Com Meta",
      value: withGoals,
      icon: Target,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      percentage: total > 0 ? ((withGoals / total) * 100).toFixed(0) : "0",
    },
    {
      label: "A Definir",
      value: pending,
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      percentage: total > 0 ? ((pending / total) * 100).toFixed(0) : "0",
    },
    {
      label: "Progresso Médio",
      value: `${avgProgress.toFixed(0)}%`,
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      showPercentage: false,
    },
  ];

  if (total === 0) return null;

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card via-card to-muted/5 animate-zoom-in">
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex items-center gap-4 p-4 rounded-lg border ${stat.borderColor} ${stat.bgColor} transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`p-3 rounded-full ${stat.bgColor} border ${stat.borderColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  {stat.percentage !== undefined && stat.showPercentage !== false && (
                    <Badge variant="secondary" className="text-xs">
                      {stat.percentage}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
