import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileText, 
  TrendingUp, 
  Heart,
  Volume2
} from "lucide-react";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

interface NotificationTypeConfig {
  key: 'health_score_change' | 'goal_completed' | 'goal_failed' | 'new_check_in' | 'squad_goal_progress' | 'client_at_risk';
  icon: React.ElementType;
  label: string;
  description: string;
  iconColor: string;
}

const notificationTypes: NotificationTypeConfig[] = [
  {
    key: 'client_at_risk',
    icon: AlertTriangle,
    label: 'Clientes em risco',
    description: 'Quando um cliente muda para status crítico',
    iconColor: 'text-red-500'
  },
  {
    key: 'goal_completed',
    icon: CheckCircle,
    label: 'Metas concluídas',
    description: 'Quando uma meta é completada com sucesso',
    iconColor: 'text-emerald-500'
  },
  {
    key: 'goal_failed',
    icon: XCircle,
    label: 'Metas não atingidas',
    description: 'Quando uma meta não é atingida no prazo',
    iconColor: 'text-amber-500'
  },
  {
    key: 'new_check_in',
    icon: FileText,
    label: 'Novos check-ins',
    description: 'Quando check-ins são registrados no squad',
    iconColor: 'text-blue-500'
  },
  {
    key: 'squad_goal_progress',
    icon: TrendingUp,
    label: 'Progresso de metas coletivas',
    description: 'Atualizações de metas do squad',
    iconColor: 'text-purple-500'
  },
  {
    key: 'health_score_change',
    icon: Heart,
    label: 'Mudanças de health score',
    description: 'Qualquer alteração de status de clientes',
    iconColor: 'text-pink-500'
  }
];

export const NotificationPreferencesCard = () => {
  const { preferences, isLoading, updatePreference } = useNotificationPreferences();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Preferências de Notificação
          </CardTitle>
          <CardDescription>Carregando preferências...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Preferências de Notificação
        </CardTitle>
        <CardDescription>Escolha quais tipos de alertas você deseja receber</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Tipos de Alerta
          </Label>
        </div>
        
        {notificationTypes.map((type, index) => {
          const Icon = type.icon;
          const isEnabled = preferences?.[type.key] ?? true;
          
          return (
            <div key={type.key}>
              {index > 0 && <Separator className="my-3" />}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${type.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="font-medium cursor-pointer">{type.label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={isEnabled} 
                  onCheckedChange={(value) => updatePreference({ key: type.key, value })}
                />
              </div>
            </div>
          );
        })}

        <Separator className="my-4" />
        
        <div className="space-y-1">
          <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Configurações Gerais
          </Label>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">
              <Volume2 className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <Label className="font-medium cursor-pointer">Som de notificações</Label>
              <p className="text-sm text-muted-foreground">
                Reproduzir som ao receber novas notificações
              </p>
            </div>
          </div>
          <Switch 
            checked={preferences?.sound_enabled ?? true} 
            onCheckedChange={(value) => updatePreference({ key: 'sound_enabled', value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
