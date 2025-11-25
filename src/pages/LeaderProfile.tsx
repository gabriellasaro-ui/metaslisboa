import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getLeaderById } from "@/data/leadersData";
import { squadsData } from "@/data/clientsData";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { ArrowLeft, Mail, Calendar, Target, TrendingUp, Users, Award, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const LeaderProfile = () => {
  const { leaderId } = useParams();
  const navigate = useNavigate();
  const leader = getLeaderById(leaderId || "");

  if (!leader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Líder não encontrado</CardTitle>
            <CardDescription>O líder solicitado não existe no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const leaderSquads = squadsData.filter(squad => 
    leader.squads.includes(squad.name.toUpperCase())
  );

  const totalClients = leaderSquads.reduce((sum, squad) => sum + squad.clients.length, 0);
  const withGoals = leaderSquads.reduce((sum, squad) => 
    sum + squad.clients.filter(c => c.hasGoal === 'SIM').length, 0);
  const pending = leaderSquads.reduce((sum, squad) => 
    sum + squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length, 0);
  const withoutGoals = leaderSquads.reduce((sum, squad) => 
    sum + squad.clients.filter(c => c.hasGoal === 'NAO').length, 0);
  
  const coverageRate = totalClients > 0 ? (withGoals / totalClients) * 100 : 0;
  const conversionRate = totalClients > 0 ? ((withGoals + pending) / totalClients) * 100 : 0;

  const allClients = leaderSquads.flatMap(squad => 
    squad.clients.map(client => ({ ...client, squadName: squad.name }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-border">
                <AvatarImage src={leader.avatar} alt={leader.name} />
                <AvatarFallback className="text-2xl">{leader.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{leader.name}</h1>
                  <p className="text-muted-foreground">{leader.role}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  {leader.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {leader.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Na empresa desde {format(leader.joinedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    {leader.squads.length} {leader.squads.length === 1 ? 'Squad' : 'Squads'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {leader.squads.map(squad => (
                    <Badge key={squad} variant="outline">
                      {squad}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-center md:text-right">
                <div className="text-4xl font-bold text-primary mb-1">
                  {coverageRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Cobertura de Metas</div>
                {coverageRate >= 80 ? (
                  <Badge className="mt-2 bg-emerald-500 hover:bg-emerald-600">
                    <Award className="mr-1 h-3 w-3" />
                    Meta Atingida
                  </Badge>
                ) : (
                  <Badge variant="outline" className="mt-2">
                    Em Progresso
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricsCard
            title="Total de Clientes"
            value={totalClients}
            icon={Users}
            description="Todos os clientes gerenciados"
          />
          <MetricsCard
            title="Com Metas"
            value={withGoals}
            icon={Target}
            variant="success"
            description={`${coverageRate.toFixed(0)}% do total`}
          />
          <MetricsCard
            title="A Definir"
            value={pending}
            icon={TrendingUp}
            variant="warning"
            description="Metas em formulação"
          />
          <MetricsCard
            title="Taxa de Conversão"
            value={Math.round(conversionRate)}
            icon={Award}
            description="Com meta + A definir"
          />
        </div>

        {/* Performance by Squad */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance por Squad</CardTitle>
            <CardDescription>Detalhamento de métricas em cada time gerenciado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {leaderSquads.map((squad, index) => {
                const squadTotal = squad.clients.length;
                const squadWithGoals = squad.clients.filter(c => c.hasGoal === 'SIM').length;
                const squadPending = squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length;
                const squadCoverage = squadTotal > 0 ? (squadWithGoals / squadTotal) * 100 : 0;

                return (
                  <div key={squad.id}>
                    {index > 0 && <Separator className="my-6" />}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{squad.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {squadTotal} {squadTotal === 1 ? 'cliente' : 'clientes'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{squadCoverage.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Cobertura</div>
                        </div>
                      </div>

                      <Progress value={squadCoverage} className="h-2" />

                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="text-center">
                          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {squadWithGoals}
                          </div>
                          <div className="text-xs text-muted-foreground">Com Meta</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                            {squadPending}
                          </div>
                          <div className="text-xs text-muted-foreground">A Definir</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-muted-foreground">
                            {squadTotal - squadWithGoals - squadPending}
                          </div>
                          <div className="text-xs text-muted-foreground">Sem Meta</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* All Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Todos os Clientes</CardTitle>
            <CardDescription>
              Lista completa de clientes gerenciados por {leader.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientsTable clients={allClients} showActions={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderProfile;
