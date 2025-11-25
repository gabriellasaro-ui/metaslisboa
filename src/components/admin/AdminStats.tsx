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
  );
};