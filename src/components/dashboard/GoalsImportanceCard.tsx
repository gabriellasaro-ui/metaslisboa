import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Download, CheckCircle2, TrendingUp, Users, Shield, Zap } from "lucide-react";

export const GoalsImportanceCard = () => {
  const handleDownloadPDF = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    // Método mais seguro usando fetch e blob
    fetch('/docs/importancia-metas.pdf')
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Por-que-ter-metas-e-essencial.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Erro ao baixar PDF:', error);
      });
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Direção e Clareza",
      description: "Metas definem onde estamos, para onde vamos e em quanto tempo, evitando a sensação de 'fazemos muito e entregamos pouco'",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: CheckCircle2,
      title: "Medição Objetiva",
      description: "Tudo vira dado, evolução e análise honesta, eliminando ruídos, achismos e inseguranças que levam ao churn",
      color: "text-emerald-600 dark:text-emerald-400"
    },
    {
      icon: Shield,
      title: "Confiança e Transparência",
      description: "Consistência no acompanhamento transmite profissionalismo e previsibilidade. Quando o cliente percebe isso, ele não cancela, ele confia",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: Users,
      title: "Engajamento do Cliente",
      description: "Com meta, o cliente se compromete mais, envia materiais, aprova mais rápido e participa ativamente. Vira parceiro, não espectador",
      color: "text-amber-600 dark:text-amber-400"
    },
    {
      icon: Zap,
      title: "Decisões Estratégicas",
      description: "Metas guiam quais canais priorizar, quanto investir e quando escalar, reduzindo tentativa e erro e eliminando retrabalho",
      color: "text-red-600 dark:text-red-400"
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle>Por que ter Metas é Essencial?</CardTitle>
          </div>
          <Badge className="bg-amber-500 hover:bg-amber-600">Importante</Badge>
        </div>
        <CardDescription>
          Descubra como metas bem definidas impulsionam o sucesso e reduzem churn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {benefits.slice(0, 3).map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border">
                <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${benefit.color}`} />
                <div>
                  <h4 className="font-semibold text-sm mb-1">{benefit.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" className="flex-1 bg-amber-600 hover:bg-amber-700">
                <Lightbulb className="mr-2 h-4 w-4" />
                Ver Todos os Benefícios
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  Por que ter Metas é Essencial para o Sucesso
                </DialogTitle>
                <DialogDescription>
                  5 razões fundamentais para ter metas bem definidas nos projetos
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/20 flex-shrink-0">
                          <Icon className={`h-5 w-5 ${benefit.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {index + 1}. {benefit.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                      {index < benefits.length - 1 && <div className="h-px bg-border ml-13" />}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  type="button"
                  onClick={handleDownloadPDF} 
                  size="lg" 
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Apresentação Completa (PDF)
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            type="button"
            variant="outline" 
            onClick={handleDownloadPDF} 
            className="flex-shrink-0"
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
