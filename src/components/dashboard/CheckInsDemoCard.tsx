import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, BarChart3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CheckInsDemoCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Sistema de Check-ins Semanais</CardTitle>
              <CardDescription className="text-base mt-1">
                Agora com banco de dados real integrado!
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
            <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Formulário Completo</p>
              <p className="text-xs text-muted-foreground mt-1">
                Progresso, status e comentários
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Timeline Interativa</p>
              <p className="text-xs text-muted-foreground mt-1">
                Histórico visual de check-ins
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
            <BarChart3 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Gráficos de Evolução</p>
              <p className="text-xs text-muted-foreground mt-1">
                Progresso semanal visualizado
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30">
          <p className="text-sm font-medium text-foreground">✅ Totalmente funcional</p>
          <p className="text-xs text-muted-foreground mt-1">
            Conectado ao Supabase com 76 clientes e 46 metas
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
