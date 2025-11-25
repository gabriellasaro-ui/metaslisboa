import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Database, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  X
} from "lucide-react";

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WelcomeDialog = ({ open, onOpenChange }: WelcomeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Bem-vindo ao Dashboard de Metas! 🎉</DialogTitle>
                <p className="text-muted-foreground mt-1">
                  Seu sistema está 100% operacional
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-green-700 dark:text-green-400">
                Sistema Pronto para Uso
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Banco de dados migrado com sucesso: <strong>76 clientes</strong>, <strong>46 metas</strong>, <strong>5 squads</strong>
            </p>
          </div>

          <Separator />

          {/* Principais Recursos */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">📊 O que você pode fazer:</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Check-ins Semanais</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Registre progresso, adicione comentários e acompanhe a evolução das metas com timeline visual
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Análises e Gráficos</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visualize métricas, compare squads e acompanhe a distribuição de metas em tempo real
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Filtros Avançados</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pesquise clientes por squad, líder, status ou tipo de meta. Exporte para Excel ou PDF
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Banco de Dados Real</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Todos os dados salvos no Supabase com sincronização automática e histórico completo
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Destaque Check-ins */}
          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">🚀 Novidade: Sistema de Check-ins Semanais</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Formulário completo, timeline interativa e gráficos de evolução já funcionando!
                </p>
              </div>
            </div>
            <Button
              variant="premium"
              className="w-full gap-2"
              onClick={() => {
                onOpenChange(false);
                window.location.href = "/check-ins-demo";
              }}
            >
              Ver Sistema de Check-ins
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Dica */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Use o botão "Tour" no canto superior direito sempre que precisar de ajuda ou quiser revisar as funcionalidades disponíveis.
            </p>
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
            className="flex-1 gap-2"
          >
            Começar a Usar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
