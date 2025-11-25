import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyCheckInForm } from "@/components/dashboard/WeeklyCheckInForm";
import { WeeklyCheckInsTimeline } from "@/components/dashboard/WeeklyCheckInsTimeline";
import { WeeklyProgressChart } from "@/components/dashboard/WeeklyProgressChart";
import { ClientProgressEvolution } from "@/components/dashboard/ClientProgressEvolution";
import { Calendar, TrendingUp, BarChart3, ArrowLeft, LineChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CheckInsDemo() {
  const navigate = useNavigate();
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCheckInSuccess = () => {
    // Atualizar timeline após novo check-in
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Sistema de Check-ins Semanais
            </h1>
            <p className="text-lg text-muted-foreground">
              Acompanhamento completo de progresso e metas
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Formulário</CardTitle>
                  <CardDescription>Registro semanal</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Registre progresso, status e comentários de forma rápida e organizada
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Timeline</CardTitle>
                  <CardDescription>Histórico completo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualize todo o histórico de acompanhamento em ordem cronológica
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Evolução por Cliente</CardTitle>
                  <CardDescription>Progresso individual</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualize o histórico completo de progresso de cada cliente ao longo do tempo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Botão Novo Check-in */}
        <div className="flex justify-center mb-8">
          <Button
            variant="premium"
            size="lg"
            onClick={() => setShowCheckInForm(true)}
            className="gap-2 shadow-lg"
          >
            <Calendar className="h-5 w-5" />
            Novo Check-in
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="timeline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="evolucao" className="gap-2">
              <LineChart className="h-4 w-4" />
              Evolução
            </TabsTrigger>
            <TabsTrigger value="grafico" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            <WeeklyCheckInsTimeline limit={50} refreshTrigger={refreshKey} />
          </TabsContent>

          <TabsContent value="evolucao" className="space-y-6">
            <ClientProgressEvolution key={refreshKey} />
          </TabsContent>

          <TabsContent value="grafico" className="space-y-6">
            <WeeklyProgressChart weeks={12} />
          </TabsContent>
        </Tabs>

        {/* Form Dialog */}
        <WeeklyCheckInForm
          open={showCheckInForm}
          onOpenChange={setShowCheckInForm}
          onSuccess={handleCheckInSuccess}
        />
      </div>
    </div>
  );
}
