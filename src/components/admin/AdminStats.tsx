import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, CheckCircle2, AlertTriangle, XCircle, Shield, Zap, UserPlus, Briefcase, Clock } from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalClients: number;
    totalSquads: number;
    activeClients: number;
    avisoClients: number;
    churnedClients: number;
    healthStats?: {
      safe: number;
      care: number;
      danger: number;
      danger_critico: number;
      onboarding: number;
      e_e: number;
      aviso_previo: number;
      churn: number;
    };
  };
}

export const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="space-y-6">
      {/* Stats principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                <p className="text-3xl font-bold">{stats.totalClients}</p>
              </div>
              <Users className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Squads</p>
                <p className="text-3xl font-bold">{stats.totalSquads}</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.activeClients}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-emerald-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aviso Prévio</p>
                <p className="text-3xl font-bold text-amber-600">{stats.avisoClients}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Churn</p>
                <p className="text-3xl font-bold text-red-600">{stats.churnedClients}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Score Stats */}
      {stats.healthStats && (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <Card className="border-emerald-500/20">
            <CardContent className="p-4 text-center">
              <Shield className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
              <p className="text-2xl font-bold text-emerald-600">{stats.healthStats.safe}</p>
              <p className="text-xs text-muted-foreground">Safe</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <p className="text-2xl font-bold text-amber-600">{stats.healthStats.care}</p>
              <p className="text-xs text-muted-foreground">Care</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/20">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-red-500 mb-1" />
              <p className="text-2xl font-bold text-red-600">{stats.healthStats.danger}</p>
              <p className="text-xs text-muted-foreground">Danger</p>
            </CardContent>
          </Card>
          <Card className="border-red-700/20">
            <CardContent className="p-4 text-center">
              <Zap className="h-5 w-5 mx-auto text-red-700 mb-1" />
              <p className="text-2xl font-bold text-red-700">{stats.healthStats.danger_critico}</p>
              <p className="text-xs text-muted-foreground">Crítico</p>
            </CardContent>
          </Card>
          <Card className="border-violet-500/20">
            <CardContent className="p-4 text-center">
              <UserPlus className="h-5 w-5 mx-auto text-violet-500 mb-1" />
              <p className="text-2xl font-bold text-violet-600">{stats.healthStats.onboarding}</p>
              <p className="text-xs text-muted-foreground">Onboarding</p>
            </CardContent>
          </Card>
          <Card className="border-orange-500/20">
            <CardContent className="p-4 text-center">
              <Briefcase className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <p className="text-2xl font-bold text-orange-600">{stats.healthStats.e_e}</p>
              <p className="text-xs text-muted-foreground">E.E.</p>
            </CardContent>
          </Card>
          <Card className="border-slate-500/20">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto text-slate-500 mb-1" />
              <p className="text-2xl font-bold text-slate-600">{stats.healthStats.aviso_previo}</p>
              <p className="text-xs text-muted-foreground">Aviso</p>
            </CardContent>
          </Card>
          <Card className="border-zinc-600/20">
            <CardContent className="p-4 text-center">
              <XCircle className="h-5 w-5 mx-auto text-zinc-600 mb-1" />
              <p className="text-2xl font-bold text-zinc-600">{stats.healthStats.churn}</p>
              <p className="text-xs text-muted-foreground">Churn</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};