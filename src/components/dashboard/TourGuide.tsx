import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Target,
  Zap,
  Info
} from "lucide-react";

export const TourGuide = () => {
  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardHeader className="border-b border-border/30 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">🎯 Tour Completo - O que está funcionando</CardTitle>
            <CardDescription className="text-base mt-1">
              Entenda tudo que foi implementado no seu sistema
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Status Geral */}
        <Alert className="border-green-500/20 bg-green-500/5">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <AlertDescription className="ml-2">
            <span className="font-semibold">Sistema 100% Operacional</span> - Banco de dados migrado e check-ins funcionais
          </AlertDescription>
        </Alert>

        {/* Banco de Dados */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">1. Banco de Dados Real (Supabase)</h3>
            <Badge variant="default" className="bg-green-500">✓ Concluído</Badge>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold text-primary">76</p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">46</p>
                <p className="text-sm text-muted-foreground">Metas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">5</p>
                <p className="text-sm text-muted-foreground">Squads</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">2</p>
                <p className="text-sm text-muted-foreground">Líderes</p>
              </div>
            </div>
            
            <Separator className="bg-border/50" />
            
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Tabelas: <code className="text-primary">leaders, squads, clients, goals, check_ins</code></span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Status de clientes: Ativo (62), Aviso Prévio (2), Churned (12)</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>RLS Policies configuradas para segurança</span>
              </p>
            </div>
          </div>
        </div>

        {/* Check-ins Semanais */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">2. Sistema de Check-ins Semanais</h3>
            <Badge variant="default" className="bg-green-500">✓ Funcional</Badge>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/20">
                <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Formulário de Registro</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Progresso (0-100%), status e comentários detalhados
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/20">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Timeline Visual</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Histórico completo com datas e status
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/20">
                <BarChart3 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Gráficos de Evolução</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Progresso semanal em gráfico de linha
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm bg-primary/5 p-3 rounded-lg border border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium">Atualização em tempo real</span>
              <span className="text-muted-foreground">- Dados salvos no Supabase instantaneamente</span>
            </div>
          </div>
        </div>

        {/* Dashboard Atual */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">3. Dashboard Principal</h3>
            <Badge variant="secondary">Dados Mockados (temporário)</Badge>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/30">
            <p className="text-sm text-muted-foreground">
              O dashboard atual ainda mostra dados estáticos enquanto a integração completa é finalizada:
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-500" />
                <span>Abas: Visão Geral, Análises, Check-ins, Clientes</span>
              </p>
              <p className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-500" />
                <span>Métricas, gráficos, filtros e exportação funcionais</span>
              </p>
              <p className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-500" />
                <span>Próximo passo: Conectar ao Supabase</span>
              </p>
            </div>
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="space-y-3 pt-4 border-t border-border/30">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Próximas Funcionalidades
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <p className="font-semibold text-sm mb-1">🔐 Autenticação</p>
              <p className="text-xs text-muted-foreground">Login/Signup para multi-usuários</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <p className="font-semibold text-sm mb-1">🔄 Integração Completa</p>
              <p className="text-xs text-muted-foreground">Conectar dashboard ao Supabase</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <p className="font-semibold text-sm mb-1">⚠️ Dashboard de Alertas</p>
              <p className="text-xs text-muted-foreground">Clientes em risco e sem interação</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <p className="font-semibold text-sm mb-1">📊 Métricas Avançadas</p>
              <p className="text-xs text-muted-foreground">Taxa de interação e conversão real</p>
            </div>
          </div>
        </div>

        {/* Como Testar */}
        <Alert className="border-blue-500/20 bg-blue-500/5">
          <Info className="h-5 w-5 text-blue-500" />
          <AlertDescription className="ml-2 space-y-2">
            <p className="font-semibold">Como testar o sistema de check-ins:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside ml-2">
              <li>Clique no card azul "Sistema de Check-ins Semanais" acima</li>
              <li>Na página, clique em "Novo Check-in"</li>
              <li>Preencha: progresso, status e comentário</li>
              <li>Salve e veja aparecer na timeline e no gráfico!</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
