import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalClients: number;
    totalSquads: number;
    activeClients: number;
    avisoClients: number;
    churnedClients: number;
  };
}

export const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      <Card className="shadow-[0_8px_30px_rgba(139,92,246,0.15)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.25)] transition-all duration-300 hover:-translate-y-1 border-primary/20">
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

      <Card className="shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.25)] transition-all duration-300 hover:-translate-y-1 border-blue-500/20">
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

      <Card className="shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-1 border-emerald-500/20">
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

      <Card className="shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.25)] transition-all duration-300 hover:-translate-y-1 border-amber-500/20">
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

      <Card className="shadow-[0_8px_30px_rgba(239,68,68,0.15)] hover:shadow-[0_12px_40px_rgba(239,68,68,0.25)] transition-all duration-300 hover:-translate-y-1 border-red-500/20">
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
  );
};