import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, BarChart3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CheckInsDemoCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/5 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Calendar className="h-9 w-9 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Sistema de Check-ins Semanais
              </CardTitle>
              <CardDescription className="text-base mt-1.5 font-medium">
                Acompanhamento completo de progresso em tempo real
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-bold text-base">Formulário Completo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Progresso, status e comentários
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:scale-105">
            <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-7 w-7 text-accent-foreground" />
            </div>
            <div>
              <p className="font-bold text-base">Timeline Interativa</p>
              <p className="text-sm text-muted-foreground mt-1">
                Histórico visual de check-ins
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 hover:scale-105">
            <div className="h-12 w-12 rounded-lg bg-primary/30 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-bold text-base">Gráficos de Evolução</p>
              <p className="text-sm text-muted-foreground mt-1">
                Progresso semanal visualizado
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div>
            <p className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="text-xl">✅</span> Sistema Ativo
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              76 clientes • 46 metas ativas
            </p>
          </div>
          <Button
            variant="premium"
            size="lg"
            onClick={() => navigate("/check-ins-demo")}
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Calendar className="h-5 w-5" />
            Acessar Sistema
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
