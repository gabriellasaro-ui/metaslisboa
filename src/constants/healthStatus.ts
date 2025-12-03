import { AlertTriangle, CheckCircle, AlertCircle, XCircle, Users, Building, Clock, Trash2 } from "lucide-react";

export const HEALTH_STATUS = {
  safe: {
    value: 'safe',
    label: 'Safe',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgLight: 'bg-green-100',
    icon: CheckCircle,
    description: 'Cliente saudável'
  },
  care: {
    value: 'care',
    label: 'Care',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgLight: 'bg-yellow-100',
    icon: AlertCircle,
    description: 'Requer atenção'
  },
  danger: {
    value: 'danger',
    label: 'Danger',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgLight: 'bg-red-100',
    icon: AlertTriangle,
    description: 'Em risco'
  },
  danger_critico: {
    value: 'danger_critico',
    label: 'Danger Crítico',
    color: 'bg-red-700',
    textColor: 'text-red-700',
    bgLight: 'bg-red-200',
    icon: XCircle,
    description: 'Risco crítico'
  },
  onboarding: {
    value: 'onboarding',
    label: 'Onboarding',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    bgLight: 'bg-purple-100',
    icon: Users,
    description: 'Em onboarding'
  },
  e_e: {
    value: 'e_e',
    label: 'E&E',
    color: 'bg-amber-700',
    textColor: 'text-amber-700',
    bgLight: 'bg-amber-100',
    icon: Building,
    description: 'Estrutura & Execução'
  },
  aviso_previo: {
    value: 'aviso_previo',
    label: 'Aviso Prévio',
    color: 'bg-gray-700',
    textColor: 'text-gray-700',
    bgLight: 'bg-gray-200',
    icon: Clock,
    description: 'Em aviso prévio'
  },
  churn: {
    value: 'churn',
    label: 'Churn',
    color: 'bg-gray-900',
    textColor: 'text-gray-900',
    bgLight: 'bg-gray-300',
    icon: Trash2,
    description: 'Cliente perdido'
  }
} as const;

export type HealthStatusKey = keyof typeof HEALTH_STATUS;

export const HEALTH_STATUS_ORDER: HealthStatusKey[] = [
  'safe', 'care', 'danger', 'danger_critico', 'onboarding', 'e_e', 'aviso_previo', 'churn'
];

export const getHealthStatusConfig = (status: string) => {
  return HEALTH_STATUS[status as HealthStatusKey] || HEALTH_STATUS.safe;
};
