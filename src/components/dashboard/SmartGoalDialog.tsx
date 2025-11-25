import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Client, GoalType } from "@/data/clientsData";
import { SmartGoalFormData } from "@/types/smartGoal";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Target, TrendingUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const smartGoalSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  goalType: z.enum(["Faturamento", "Leads", "OUTROS"] as const, {
    required_error: "Selecione o tipo de meta",
  }),
  goalPeriod: z.enum(["mensal", "trimestral", "semestral", "anual"] as const, {
    required_error: "Selecione o período da meta",
  }),
  specific: z.string()
    .trim()
    .min(10, "Descrição muito curta. Seja mais específico (mínimo 10 caracteres)")
    .max(300, "Descrição muito longa (máximo 300 caracteres)"),
  measurable: z.string()
    .trim()
    .min(5, "Defina como será medido (mínimo 5 caracteres)")
    .max(200, "Descrição muito longa (máximo 200 caracteres)"),
  achievable: z.string()
    .trim()
    .min(10, "Explique por que é atingível (mínimo 10 caracteres)")
    .max(300, "Descrição muito longa (máximo 300 caracteres)"),
  relevant: z.string()
    .trim()
    .min(10, "Explique a relevância (mínimo 10 caracteres)")
    .max(300, "Descrição muito longa (máximo 300 caracteres)"),
  timeBound: z.date({
    required_error: "Defina um prazo",
    invalid_type_error: "Data inválida",
  }).refine((date) => date > new Date(), {
    message: "O prazo deve ser no futuro",
  }),
});

interface SmartGoalDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (client: Client) => void;
}

export const SmartGoalDialog = ({ client, open, onOpenChange, onSave }: SmartGoalDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SmartGoalFormData>({
    clientName: client?.name || "",
    goalType: "Faturamento",
    goalPeriod: "mensal" as const,
    specific: "",
    measurable: "",
    achievable: "",
    relevant: "",
    timeBound: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias no futuro
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = smartGoalSchema.parse(formData);
      
      // Construir a meta consolidada
      const goalValue = `META SMART: ${validatedData.specific} | Medido por: ${validatedData.measurable} | Prazo: ${format(validatedData.timeBound, "dd/MM/yyyy", { locale: ptBR })}`;
      
      const updatedClient: Client = {
        name: validatedData.clientName,
        hasGoal: "SIM",
        goalType: validatedData.goalType,
        goalValue: goalValue,
        notes: `Relevância: ${validatedData.relevant} | Viabilidade: ${validatedData.achievable}`,
      };
      
      onSave(updatedClient);
      toast({
        title: "Meta SMART definida com sucesso!",
        description: `Meta estruturada criada para ${validatedData.clientName}`,
      });
      onOpenChange(false);
      setErrors({});
      setCurrentStep(1);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Erro de validação",
          description: "Por favor, preencha todos os campos corretamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleChange = (field: keyof SmartGoalFormData, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.clientName.length > 0 && formData.goalType !== undefined && formData.goalPeriod !== undefined;
      case 2:
        return formData.specific.length >= 10 && formData.measurable.length >= 5;
      case 3:
        return formData.achievable.length >= 10 && formData.relevant.length >= 10;
      case 4:
        return formData.timeBound > new Date();
      default:
        return false;
    }
  };

  const steps = [
    { number: 1, title: "Informações Básicas", icon: Target },
    { number: 2, title: "Específica & Mensurável", icon: TrendingUp },
    { number: 3, title: "Atingível & Relevante", icon: CheckCircle2 },
    { number: 4, title: "Temporal", icon: Clock },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Target className="h-6 w-6 text-primary" />
            Definir Meta SMART
          </DialogTitle>
          <DialogDescription>
            Estruture uma meta específica, mensurável, atingível, relevante e temporal
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            const isValid = isStepValid(step.number);
            
            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.number)}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      isCompleted && !isActive && "bg-emerald-500 text-white",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}
                  >
                    <StepIcon className="h-5 w-5" />
                  </button>
                  <span className={cn(
                    "text-xs mt-2 text-center font-medium",
                    isActive && "text-primary",
                    !isActive && "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                  {isValid && !isActive && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "h-0.5 flex-1 mx-2",
                    currentStep > step.number ? "bg-emerald-500" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Informações Básicas */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Sobre o Cliente</h4>
                    <p className="text-sm text-muted-foreground">
                      Identifique o cliente e o tipo de meta que será trabalhada
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleChange("clientName", e.target.value)}
                  placeholder="Ex: Groupwork"
                  className={errors.clientName ? "border-destructive" : ""}
                  disabled
                />
                {errors.clientName && (
                  <p className="text-sm text-destructive">{errors.clientName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalType">Tipo de Meta *</Label>
                <Select
                  value={formData.goalType}
                  onValueChange={(value: GoalType) => handleChange("goalType", value)}
                >
                  <SelectTrigger id="goalType" className={errors.goalType ? "border-destructive" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faturamento">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        Faturamento
                      </div>
                    </SelectItem>
                    <SelectItem value="Leads">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        Leads
                      </div>
                    </SelectItem>
                    <SelectItem value="OUTROS">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-600" />
                        Outros
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.goalType && (
                  <p className="text-sm text-destructive">{errors.goalType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalPeriod">Período da Meta *</Label>
                <Select
                  value={formData.goalPeriod}
                  onValueChange={(value: "mensal" | "trimestral" | "semestral" | "anual") => handleChange("goalPeriod", value)}
                >
                  <SelectTrigger id="goalPeriod" className={errors.goalPeriod ? "border-destructive" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Mensal
                      </div>
                    </SelectItem>
                    <SelectItem value="trimestral">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        Trimestral (Quarter)
                      </div>
                    </SelectItem>
                    <SelectItem value="semestral">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        Semestral
                      </div>
                    </SelectItem>
                    <SelectItem value="anual">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        Anual
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.goalPeriod && (
                  <p className="text-sm text-destructive">{errors.goalPeriod}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Específica & Mensurável */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Específica & Mensurável</h4>
                    <p className="text-sm text-muted-foreground">
                      Defina claramente o objetivo e como ele será medido
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specific">
                  <Badge variant="outline" className="mb-2">S - Específica</Badge>
                  <span className="ml-2">O que exatamente será alcançado? *</span>
                </Label>
                <Textarea
                  id="specific"
                  value={formData.specific}
                  onChange={(e) => handleChange("specific", e.target.value)}
                  placeholder="Ex: Aumentar o faturamento mensal da empresa em 40% através de campanhas de marketing digital focadas em novos clientes no segmento B2B"
                  rows={4}
                  className={errors.specific ? "border-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {errors.specific ? (
                    <p className="text-sm text-destructive">{errors.specific}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Seja claro e detalhado sobre o objetivo
                    </p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formData.specific.length}/300
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurable">
                  <Badge variant="outline" className="mb-2">M - Mensurável</Badge>
                  <span className="ml-2">Como o sucesso será medido? *</span>
                </Label>
                <Textarea
                  id="measurable"
                  value={formData.measurable}
                  onChange={(e) => handleChange("measurable", e.target.value)}
                  placeholder="Ex: Faturamento mensal passando de R$100.000 para R$140.000, acompanhado através de dashboard de vendas com atualização semanal"
                  rows={3}
                  className={errors.measurable ? "border-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {errors.measurable ? (
                    <p className="text-sm text-destructive">{errors.measurable}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Defina números, KPIs ou indicadores concretos
                    </p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formData.measurable.length}/200
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Atingível & Relevante */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Atingível & Relevante</h4>
                    <p className="text-sm text-muted-foreground">
                      Valide a viabilidade e importância da meta
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievable">
                  <Badge variant="outline" className="mb-2">A - Atingível</Badge>
                  <span className="ml-2">Por que essa meta é realista e alcançável? *</span>
                </Label>
                <Textarea
                  id="achievable"
                  value={formData.achievable}
                  onChange={(e) => handleChange("achievable", e.target.value)}
                  placeholder="Ex: O cliente já possui estrutura de vendas, orçamento aprovado para marketing, e crescimento médio histórico de 15% ao trimestre, tornando o objetivo de 40% desafiador mas viável"
                  rows={4}
                  className={errors.achievable ? "border-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {errors.achievable ? (
                    <p className="text-sm text-destructive">{errors.achievable}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Considere recursos, capacidade e histórico do cliente
                    </p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formData.achievable.length}/300
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relevant">
                  <Badge variant="outline" className="mb-2">R - Relevante</Badge>
                  <span className="ml-2">Por que essa meta é importante para o cliente? *</span>
                </Label>
                <Textarea
                  id="relevant"
                  value={formData.relevant}
                  onChange={(e) => handleChange("relevant", e.target.value)}
                  placeholder="Ex: Alinhado com expansão estratégica para novo mercado, necessário para sustentar crescimento da operação e atingir breakeven do novo setor B2B"
                  rows={4}
                  className={errors.relevant ? "border-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {errors.relevant ? (
                    <p className="text-sm text-destructive">{errors.relevant}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Conecte a meta aos objetivos estratégicos do cliente
                    </p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formData.relevant.length}/300
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Temporal */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Temporal</h4>
                    <p className="text-sm text-muted-foreground">
                      Defina um prazo claro para alcançar a meta
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeBound">
                  <Badge variant="outline" className="mb-2">T - Temporal</Badge>
                  <span className="ml-2">Qual o prazo para atingir essa meta? *</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="timeBound"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.timeBound && "text-muted-foreground",
                        errors.timeBound && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.timeBound ? (
                        format(formData.timeBound, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.timeBound}
                      onSelect={(date) => date && handleChange("timeBound", date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {errors.timeBound ? (
                  <p className="text-sm text-destructive">{errors.timeBound}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Escolha uma data futura realista para conclusão da meta
                  </p>
                )}
              </div>

              {/* Resumo da Meta */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Resumo da Meta SMART
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Cliente:</strong> {formData.clientName}</p>
                  <p><strong>Tipo:</strong> {formData.goalType}</p>
                  <p><strong>Objetivo:</strong> {formData.specific || "Não definido"}</p>
                  <p><strong>Como medir:</strong> {formData.measurable || "Não definido"}</p>
                  <p><strong>Prazo:</strong> {formData.timeBound ? format(formData.timeBound, "dd/MM/yyyy", { locale: ptBR }) : "Não definido"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  onOpenChange(false);
                }
              }}
            >
              {currentStep === 1 ? "Cancelar" : "Voltar"}
            </Button>
            
            {currentStep < 4 ? (
              <Button
                type="button"
                variant="premium"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid(currentStep)}
              >
                Próximo
              </Button>
            ) : (
              <Button 
                type="submit"
                variant="premium"
                disabled={!isStepValid(4)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Salvar Meta SMART
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
