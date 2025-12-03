import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Squad } from "@/types";
import { Trophy, Medal, TrendingUp, TrendingDown, Users, Shield, AlertTriangle, AlertCircle } from "lucide-react";
import { ExtendedHealthStatus } from "./HealthScoreBadge";
import { getHealthScoreValue } from "./HealthScoreTrendsChart";

interface SquadHealthRankingProps {
  squadsData: Squad[];
}

interface SquadMetrics {
  id: string;
  name: string;
  totalClients: number;
  avgScore: number;
  safeCount: number;
  careCount: number;
  dangerCount: number;
  criticalCount: number;
  safePercentage: number;
  atRiskPercentage: number;
  rank: number;
}

export const SquadHealthRanking = ({ squadsData }: SquadHealthRankingProps) => {
  const squadMetrics = useMemo(() => {
    const metrics: SquadMetrics[] = squadsData.map(squad => {
      let totalScore = 0;
      let safeCount = 0;
      let careCount = 0;
      let dangerCount = 0;
      let criticalCount = 0;

      squad.clients.forEach(client => {
        const status = (client.healthStatus || 'safe') as ExtendedHealthStatus;
        totalScore += getHealthScoreValue(status);

        if (status === 'safe') safeCount++;
        else if (status === 'care' || status === 'onboarding' || status === 'e_e') careCount++;
        else if (status === 'danger') dangerCount++;
        else criticalCount++; // danger_critico, aviso_previo, churn
      });

      const totalClients = squad.clients.length;
      const avgScore = totalClients > 0 ? Math.round(totalScore / totalClients) : 0;
      const safePercentage = totalClients > 0 ? Math.round((safeCount / totalClients) * 100) : 0;
      const atRiskPercentage = totalClients > 0 ? Math.round(((careCount + dangerCount + criticalCount) / totalClients) * 100) : 0;

      return {
        id: squad.id,
        name: squad.name,
        totalClients,
        avgScore,
        safeCount,
        careCount,
        dangerCount,
        criticalCount,
        safePercentage,
        atRiskPercentage,
        rank: 0,
      };
    });

    // Sort by average score and assign ranks
    metrics.sort((a, b) => b.avgScore - a.avgScore);
    metrics.forEach((m, i) => {
      m.rank = i + 1;
    });

    return metrics;
  }, [squadsData]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}º</span>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-500";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  // Overall metrics
  const overallMetrics = useMemo(() => {
    const totals = squadMetrics.reduce((acc, m) => ({
      clients: acc.clients + m.totalClients,
      safe: acc.safe + m.safeCount,
      care: acc.care + m.careCount,
      danger: acc.danger + m.dangerCount,
      critical: acc.critical + m.criticalCount,
      scoreSum: acc.scoreSum + (m.avgScore * m.totalClients),
    }), { clients: 0, safe: 0, care: 0, danger: 0, critical: 0, scoreSum: 0 });

    return {
      totalClients: totals.clients,
      avgScore: totals.clients > 0 ? Math.round(totals.scoreSum / totals.clients) : 0,
      safePercentage: totals.clients > 0 ? Math.round((totals.safe / totals.clients) * 100) : 0,
      atRiskPercentage: totals.clients > 0 ? Math.round(((totals.care + totals.danger + totals.critical) / totals.clients) * 100) : 0,
    };
  }, [squadMetrics]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Ranking de Squads por Health Score
        </CardTitle>
        <CardDescription>
          Comparativo de performance entre squads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30">
          <div className="text-center">
            <p className="text-3xl font-bold">{overallMetrics.totalClients}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-3 w-3" /> Total Clientes
            </p>
          </div>
          <div className="text-center">
            <p className={`text-3xl font-bold ${getScoreColor(overallMetrics.avgScore)}`}>
              {overallMetrics.avgScore}
            </p>
            <p className="text-xs text-muted-foreground">Score Médio Geral</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{overallMetrics.safePercentage}%</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> Clientes Safe
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-destructive">{overallMetrics.atRiskPercentage}%</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" /> Requer Atencao
            </p>
          </div>
        </div>

        {/* Squad Rankings */}
        <div className="space-y-3">
          {squadMetrics.map((squad, index) => (
            <div 
              key={squad.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                index === 0 ? 'bg-yellow-500/5 border-yellow-500/30' :
                index === 1 ? 'bg-gray-500/5 border-gray-500/20' :
                index === 2 ? 'bg-amber-500/5 border-amber-500/20' :
                'bg-card border-border'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-8 flex justify-center">
                  {getRankIcon(squad.rank)}
                </div>

                {/* Squad Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold truncate">{squad.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {squad.totalClients} clientes
                    </Badge>
                  </div>

                  {/* Score Progress */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${getProgressColor(squad.avgScore)}`}
                          style={{ width: `${squad.avgScore}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-lg font-bold w-12 text-right ${getScoreColor(squad.avgScore)}`}>
                      {squad.avgScore}
                    </span>
                  </div>

                  {/* Status Distribution */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Safe: {squad.safeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Care: {squad.careCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      Danger: {squad.dangerCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-600" />
                      Crítico: {squad.criticalCount}
                    </span>
                  </div>
                </div>

                {/* Risk Indicator */}
                <div className="flex-shrink-0 text-right">
                  {squad.atRiskPercentage > 30 ? (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">{squad.atRiskPercentage}% atencao</span>
                    </div>
                  ) : squad.safePercentage >= 70 ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">{squad.safePercentage}% safe</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm font-medium">Monitorar</span>
                    </div>
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
