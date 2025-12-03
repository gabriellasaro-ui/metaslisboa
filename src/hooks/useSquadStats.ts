import { useMemo } from 'react';
import { Squad, Client, HealthStatus } from '@/types';
import { HEALTH_STATUS_ORDER, HealthStatusKey } from '@/constants/healthStatus';

export interface HealthStats {
  safe: number;
  care: number;
  danger: number;
  danger_critico: number;
  onboarding: number;
  e_e: number;
  aviso_previo: number;
  churn: number;
}

export interface SquadStats {
  total: number;
  withGoals: number;
  withoutGoals: number;
  pending: number;
  avgProgress: number;
  healthStats: HealthStats;
  coverage: number;
  score: number;
  activeClients: number;
  atRiskClients: number;
}

const calculateHealthStats = (clients: Client[]): HealthStats => {
  const stats: HealthStats = {
    safe: 0,
    care: 0,
    danger: 0,
    danger_critico: 0,
    onboarding: 0,
    e_e: 0,
    aviso_previo: 0,
    churn: 0
  };

  clients.forEach(client => {
    const status = client.healthStatus as HealthStatusKey;
    if (status && stats[status] !== undefined) {
      stats[status]++;
    }
  });

  return stats;
};

const calculateScore = (clients: Client[]): number => {
  if (clients.length === 0) return 0;
  
  const withGoals = clients.filter(c => c.hasGoal === "SIM").length;
  const coverage = (withGoals / clients.length) * 100;
  
  const avgProgress = clients.reduce((sum, c) => sum + (c.progress || 0), 0) / clients.length;
  
  const healthScore = clients.reduce((sum, c) => {
    switch (c.healthStatus) {
      case 'safe': return sum + 100;
      case 'care': return sum + 70;
      case 'onboarding': return sum + 60;
      case 'e_e': return sum + 50;
      case 'danger': return sum + 30;
      case 'danger_critico': return sum + 10;
      case 'aviso_previo': return sum + 5;
      case 'churn': return sum + 0;
      default: return sum + 50;
    }
  }, 0) / clients.length;

  return Math.round((coverage * 0.3) + (avgProgress * 0.3) + (healthScore * 0.4));
};

export const useSquadStats = (squadsData: Squad[], squadId?: string | null): SquadStats => {
  return useMemo(() => {
    let clients: Client[] = [];

    if (squadId) {
      const squad = squadsData.find(s => s.id === squadId);
      clients = squad?.clients || [];
    } else {
      clients = squadsData.flatMap(squad => squad.clients || []);
    }

    const activeClients = clients.filter(c => c.status !== 'churned');
    const total = activeClients.length;
    const withGoals = activeClients.filter(c => c.hasGoal === "SIM").length;
    const withoutGoals = activeClients.filter(c => c.hasGoal === "NAO").length;
    const pending = activeClients.filter(c => c.hasGoal === "NAO_DEFINIDO" || !c.hasGoal).length;
    
    const avgProgress = total > 0 
      ? Math.round(activeClients.reduce((sum, c) => sum + (c.progress || 0), 0) / total) 
      : 0;

    const healthStats = calculateHealthStats(activeClients);
    const coverage = total > 0 ? Math.round((withGoals / total) * 100) : 0;
    const score = calculateScore(activeClients);

    const atRiskClients = activeClients.filter(c => 
      ['danger', 'danger_critico', 'aviso_previo', 'churn'].includes(c.healthStatus || '')
    ).length;

    return {
      total,
      withGoals,
      withoutGoals,
      pending,
      avgProgress,
      healthStats,
      coverage,
      score,
      activeClients: total,
      atRiskClients
    };
  }, [squadsData, squadId]);
};

export const useAllSquadsStats = (squadsData: Squad[]) => {
  return useMemo(() => {
    return squadsData.map(squad => ({
      squadId: squad.id,
      squadName: squad.name,
      stats: {
        total: squad.clients?.length || 0,
        withGoals: squad.clients?.filter(c => c.hasGoal === "SIM").length || 0,
        withoutGoals: squad.clients?.filter(c => c.hasGoal === "NAO").length || 0,
        pending: squad.clients?.filter(c => c.hasGoal === "NAO_DEFINIDO" || !c.hasGoal).length || 0,
        avgProgress: squad.clients?.length 
          ? Math.round(squad.clients.reduce((sum, c) => sum + (c.progress || 0), 0) / squad.clients.length)
          : 0,
        healthStats: calculateHealthStats(squad.clients || []),
        coverage: squad.clients?.length 
          ? Math.round((squad.clients.filter(c => c.hasGoal === "SIM").length / squad.clients.length) * 100)
          : 0,
        score: calculateScore(squad.clients || []),
        activeClients: squad.clients?.filter(c => c.status !== 'churned').length || 0,
        atRiskClients: squad.clients?.filter(c => 
          ['danger', 'danger_critico', 'aviso_previo', 'churn'].includes(c.healthStatus || '')
        ).length || 0
      }
    }));
  }, [squadsData]);
};
