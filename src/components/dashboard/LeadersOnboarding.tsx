import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Users, Mail, Loader2, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Leader {
  name: string;
  email: string;
}

export const LeadersOnboarding = () => {
  const [open, setOpen] = useState(false);
  const [leaders, setLeaders] = useState<Leader[]>([{ name: "", email: "" }]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkIfNeedsOnboarding();
  }, []);

  const checkIfNeedsOnboarding = async () => {
    try {
      const { data, error } = await supabase
        .from("leaders")
        .select("id")
        .limit(1);

      if (error) throw error;

      // Se não há líderes, mostrar onboarding
      if (!data || data.length === 0) {
        setOpen(true);
      }
    } catch (error) {
      console.error("Erro ao verificar líderes:", error);
    }
  };

  const addLeader = () => {
    setLeaders([...leaders, { name: "", email: "" }]);
  };

  const removeLeader = (index: number) => {
    if (leaders.length > 1) {
      setLeaders(leaders.filter((_, i) => i !== index));
    }
  };

  const updateLeader = (index: number, field: "name" | "email", value: string) => {
    const updated = [...leaders];
    updated[index][field] = value;
    setLeaders(updated);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    // Validação
    const validLeaders = leaders.filter(l => l.name.trim() && l.email.trim());
    
    if (validLeaders.length === 0) {
      toast.error("Adicione pelo menos um líder");
      return;
    }

    const invalidEmails = validLeaders.filter(l => !validateEmail(l.email));
    if (invalidEmails.length > 0) {
      toast.error("Alguns emails são inválidos");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("leaders")
        .insert(
          validLeaders.map(leader => ({
            name: leader.name.trim(),
            email: leader.email.trim().toLowerCase(),
            role: "Squad Leader"
          }))
        );

      if (error) throw error;

      toast.success(`${validLeaders.length} ${validLeaders.length === 1 ? 'líder cadastrado' : 'líderes cadastrados'} com sucesso!`);
      setOpen(false);
      
      // Recarregar página para atualizar dados
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("Erro ao cadastrar líderes:", error);
      if (error.code === '23505') {
        toast.error("Um ou mais emails já estão cadastrados");
      } else {
        toast.error("Erro ao cadastrar líderes");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast.info("Você pode adicionar líderes depois na página Admin");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Bem-vindo ao Sistema!
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                Vamos começar cadastrando os coordenadores/líderes dos squads
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 my-4">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm mb-1">Por que cadastrar líderes?</h4>
              <p className="text-sm text-muted-foreground">
                Os líderes serão responsáveis por gerenciar seus squads, definir metas e acompanhar o progresso dos clientes.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {leaders.map((leader, index) => (
            <Card key={index} className="animate-in fade-in-50 duration-300">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline" className="font-semibold">
                    Líder #{index + 1}
                  </Badge>
                  {leaders.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLeader(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`} className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Nome Completo *
                    </Label>
                    <Input
                      id={`name-${index}`}
                      value={leader.name}
                      onChange={(e) => updateLeader(index, "name", e.target.value)}
                      placeholder="Ex: João Silva"
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`email-${index}`} className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Corporativo *
                    </Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={leader.email}
                      onChange={(e) => updateLeader(index, "email", e.target.value)}
                      placeholder="joao.silva@v4company.com"
                      className="text-base"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={addLeader}
            className="w-full h-12 border-dashed"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Outro Líder
          </Button>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="flex-1"
            disabled={isLoading}
          >
            Pular por Agora
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Cadastrar {leaders.filter(l => l.name.trim() && l.email.trim()).length} {leaders.filter(l => l.name.trim() && l.email.trim()).length === 1 ? 'Líder' : 'Líderes'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};