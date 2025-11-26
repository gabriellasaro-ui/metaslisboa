import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Target,
  Users,
  Shield,
  Eye,
  Settings,
  FileText
} from "lucide-react";

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WelcomeDialog = ({ open, onOpenChange }: WelcomeDialogProps) => {
  const { profile, role } = useAuth();

  const getWelcomeContent = () => {
    switch (role) {
      case 'investidor':
        return {
          title: '👋 Bem-vindo, Investidor!',
          subtitle: 'Visão estratégica e panorâmica do seu portfólio',
          features: [
            {
              icon: Eye,
              title: 'Visão Geral',
              description: 'Acompanhe o desempenho de todos os squads e clientes em tempo real'
            },
            {
              icon: BarChart3,
              title: 'Análises Estratégicas',
              description: 'Gráficos comparativos, rankings de squads e taxa de health safe'
            },
            {
              icon: TrendingUp,
              title: 'Performance Global',
              description: 'Métricas consolidadas de progresso e alcance de metas'
            },
            {
              icon: FileText,
              title: 'Relatórios Executivos',
              description: 'Exporte dados e apresente insights para stakeholders'
            }
          ],
          highlight: {
            text: 'Seu foco: visão estratégica e tomada de decisões baseada em dados',
            action: 'Ver Panorama Geral'
          }
        };

      case 'coordenador':
        return {
          title: '👋 Bem-vindo, Coordenador!',
          subtitle: 'Gerencie squads, clientes e impulsione resultados',
          features: [
            {
              icon: Users,
              title: 'Gestão de Squads',
              description: 'Crie e gerencie squads, adicione líderes e organize times'
            },
            {
              icon: Target,
              title: 'Gestão de Clientes',
              description: 'Adicione clientes, defina metas e acompanhe o progresso'
            },
            {
              icon: Calendar,
              title: 'Check-ins Semanais',
              description: 'Registre atualizações, evolua metas e mantenha histórico completo'
            },
            {
              icon: Settings,
              title: 'Painel Administrativo',
              description: 'Acesso completo ao painel admin para gestão operacional'
            }
          ],
          highlight: {
            text: 'Seu foco: gerenciar operações e garantir que todos os squads atinjam suas metas',
            action: 'Acessar Painel Admin'
          }
        };

      case 'supervisor':
        return {
          title: '👋 Bem-vindo, Supervisor!',
          subtitle: 'Controle total do sistema e gestão avançada',
          features: [
            {
              icon: Shield,
              title: 'Controle Total',
              description: 'Acesso irrestrito a todos os squads, clientes e configurações'
            },
            {
              icon: Settings,
              title: 'Administração Completa',
              description: 'Gerencie usuários, permissões e estrutura organizacional'
            },
            {
              icon: BarChart3,
              title: 'Análises Avançadas',
              description: 'Relatórios completos, métricas detalhadas e comparações cross-squad'
            },
            {
              icon: Calendar,
              title: 'Auditoria de Check-ins',
              description: 'Visualize, edite e gerencie todos os check-ins do sistema'
            }
          ],
          highlight: {
            text: 'Seu foco: supervisão global, governança e otimização contínua',
            action: 'Acessar Painel Admin'
          }
        };

      default:
        return {
          title: '👋 Bem-vindo!',
          subtitle: 'Seu sistema de gestão de metas está pronto',
          features: [],
          highlight: {
            text: 'Sistema pronto para uso',
            action: 'Começar'
          }
        };
    }
  };

  const content = getWelcomeContent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">{content.title}</DialogTitle>
                <p className="text-muted-foreground mt-1.5 text-base">
                  {content.subtitle}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-bold text-green-700 dark:text-green-400 text-lg">
                Sistema Operacional
              </span>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              Banco de dados sincronizado • Check-ins ativos • Dashboards em tempo real
            </p>
          </div>

          <Separator />

          {/* Recursos por Role */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Recursos disponíveis para você:
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {content.features.map((feature, index) => (
                <div 
                  key={index}
                  className="group flex items-start gap-4 p-4 rounded-xl border-2 border-border/50 bg-gradient-to-br from-muted/30 to-muted/20 hover:from-muted/50 hover:to-muted/30 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground mb-1">{feature.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Destaque da Role */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-2">
                  {content.highlight.text}
                </p>
                <Button
                  variant="premium"
                  size="sm"
                  className="gap-2 shadow-md"
                  onClick={() => {
                    onOpenChange(false);
                    if (role === 'investidor') {
                      // Investidor já está no dashboard
                    } else if (role === 'coordenador' || role === 'supervisor') {
                      window.location.href = "/admin";
                    }
                  }}
                >
                  {content.highlight.action}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Fechar
          </Button>
          <Button
            variant="premium"
            onClick={() => onOpenChange(false)}
            className="flex-1 gap-2 shadow-md"
          >
            Começar a Usar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};