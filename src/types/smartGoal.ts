export interface SmartGoal {
  specific: string;        // Específica - O que exatamente será alcançado
  measurable: string;      // Mensurável - Como medir o sucesso (KPIs, números)
  achievable: string;      // Atingível - Por que é realista e alcançável
  relevant: string;        // Relevante - Por que é importante para o cliente
  timeBound: Date;         // Temporal - Prazo para alcançar a meta
  deadline: string;        // Deadline formatada
}

export interface SmartGoalFormData extends Omit<SmartGoal, 'deadline'> {
  clientName: string;
  goalType: "Faturamento" | "Leads" | "OUTROS";
  goalPeriod: "mensal" | "trimestral" | "semestral" | "anual";
}
