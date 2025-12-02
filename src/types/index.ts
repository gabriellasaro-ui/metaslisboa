// Centralized type definitions for the application

export type GoalStatus = "SIM" | "NAO" | "NAO_DEFINIDO";
export type GoalType = "Faturamento" | "Leads" | "OUTROS";
export type HealthStatus = "safe" | "care" | "danger" | "danger_critico" | "onboarding" | "e_e" | "aviso_previo" | "churn";
export type ClientStatus = "ativo" | "aviso_previo" | "churned";
export type ProgressStatus = "on_track" | "at_risk" | "delayed" | "completed";

export interface Leader {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  role?: string;
  joinedDate?: Date;
}

export interface CheckIn {
  id?: string;
  date: Date;
  comment: string;
  progress: number;
  status: ProgressStatus;
  callLink?: string;
  callSummary?: string;
  created_by?: string;
}

export interface SmartGoal {
  id?: string;
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  timeBound?: string;
  goalValue: string;
  goalType: GoalType;
  period?: string;
  startDate?: string;
  targetDate?: string;
  description?: string;
  progress?: number;
  status?: string;
}

export interface Client {
  id?: string;
  name: string;
  hasGoal?: GoalStatus;
  goalType?: GoalType;
  goalValue?: string;
  progress?: number;
  currentProgress?: number;
  notes?: string;
  healthStatus?: HealthStatus;
  problema_central?: string;
  categoria_problema?: string;
  status?: ClientStatus;
  avisosPrevioDate?: string;
  churnedDate?: string;
  smartGoal?: SmartGoal;
  squadId?: string;
  squadName?: string;
  checkIns?: CheckIn[];
}

export interface Squad {
  id: string;
  name: string;
  slug?: string;
  leader?: Leader | string;
  clients: Client[];
}

// Sort fields for filtering
export type SortField = "name" | "status" | "progress" | "goalType";
export type SortOrder = "asc" | "desc";
