export type GoalStatus = "SIM" | "NAO_DEFINIDO" | "NAO";
export type GoalType = "Faturamento" | "Leads" | "OUTROS";

export interface Client {
  name: string;
  hasGoal: GoalStatus;
  goalType?: GoalType;
  goalValue?: string;
  notes?: string;
}

export interface Squad {
  name: string;
  id: string;
  leader?: string;
  clients: Client[];
}

export const squadsData: Squad[] = [
  {
    name: "SHARK",
    id: "shark",
    leader: "Otavio Augusto Meireles Pimenta",
    clients: [
      { name: "Groupwork", hasGoal: "SIM", goalType: "Leads", goalValue: "Realizar a primeira venda" },
      { name: "Burning Fest", hasGoal: "SIM", goalType: "Faturamento", goalValue: "R$20.000.000/ano" },
      { name: "Hotel Uirapuru", hasGoal: "SIM", goalType: "Faturamento", goalValue: "R$200.000,00/mês" },
      { name: "Império das Bebidas", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Alcansar 1000 downloads no mês de novembro" },
      { name: "Km2 Representações", hasGoal: "SIM", goalType: "Faturamento", goalValue: "R$300.000/quarter" },
      { name: "Tradição Caipira", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Reconhecimento Nacional" },
      { name: "WK Estética", hasGoal: "SIM", goalType: "Faturamento", goalValue: "Aumento de 30% (+R$40.000 mensal)" },
      { name: "Rica Alimentos", hasGoal: "SIM", goalType: "Faturamento", goalValue: "R$2.000.000" },
      { name: "Lini Eventos", hasGoal: "SIM", goalType: "Faturamento", goalValue: "500k de faturamento em um evento" },
      { name: "Água Branca", hasGoal: "NAO_DEFINIDO", goalType: "Faturamento", goalValue: "Meta já alcansada em 2025, planejamento para 2026" },
      { name: "Festival Volta ao Mundo", hasGoal: "NAO_DEFINIDO", notes: "Em processo de formulação de meta para 2026" },
      { name: "Guardião Consultoria", hasGoal: "NAO_DEFINIDO", notes: "Aviso prévio, possível reajuste de fee. Meta em discussão" },
      { name: "Kit Lanche Gostosuras", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Leads mais qualificados" },
      { name: "Supermercado Silvana", hasGoal: "NAO_DEFINIDO", notes: "Em processo de formulação de meta" },
      { name: "Buffet Encanto e Magia", hasGoal: "SIM", goalType: "Leads", goalValue: "Leads mais qualificados" },
      { name: "Dfibra", hasGoal: "NAO_DEFINIDO", notes: "Meta em formulação para 2026" },
      { name: "DISTRIFERRO", hasGoal: "NAO_DEFINIDO", notes: "Meta em formulação para 2026" },
      { name: "Grunn", hasGoal: "SIM", goalType: "Leads", goalValue: "A combinar" },
      { name: "Tradição caipira", hasGoal: "SIM", goalType: "OUTROS", goalValue: "25k de seguidores em até janeiro" },
    ]
  },
  {
    name: "CARCARÁS",
    id: "carcaras",
    leader: "Matheus Gândara",
    clients: [
      { name: "B2E", hasGoal: "SIM", goalType: "Faturamento", goalValue: "8 vendas até janeiro" },
      { name: "Escritório do Geraldo", hasGoal: "SIM", goalType: "Faturamento", goalValue: "1 Venda até o final do ano" },
      { name: "Krum", hasGoal: "SIM", goalType: "Faturamento", goalValue: "Vender o Pathernon até Março (ap de 1mm)" },
      { name: "Lojas Pavone", hasGoal: "SIM", goalType: "Faturamento", goalValue: "350k por loja" },
      { name: "4D Soluções", hasGoal: "SIM", goalType: "Faturamento", goalValue: "2 vendas nos próximos 60 dias" },
      { name: "Akeos", hasGoal: "SIM", goalType: "Faturamento", goalValue: "Até 5 vendas por mês" },
      { name: "MPA", hasGoal: "SIM", goalType: "OUTROS", goalValue: "10 contratos por mês" },
      { name: "Uai Farma", hasGoal: "NAO_DEFINIDO", notes: "Está sendo trabalhado, metas para meses futuros" },
      { name: "Help Car", hasGoal: "NAO_DEFINIDO", notes: "Em produção, call marcada para definir meta 2026" },
      { name: "Fortfill", hasGoal: "NAO_DEFINIDO", notes: "Meta em formulação após reunião" },
      { name: "Altxs", hasGoal: "NAO", notes: "Cliente em aviso prévio" },
      { name: "Consórcio Nanuque", hasGoal: "NAO_DEFINIDO", notes: "Meta em formulação para 2026" },
      { name: "Toolbox", hasGoal: "NAO_DEFINIDO", notes: "Meta em formulação para 2026" },
      { name: "QuebraMar", hasGoal: "NAO_DEFINIDO", notes: "Meta em formulação para 2026" },
    ]
  },
  {
    name: "MIDAS",
    id: "midas",
    leader: "Matheus Gândara",
    clients: [
      { name: "Comatral", hasGoal: "SIM", goalType: "Faturamento", goalValue: "2 milhões com marketing" },
      { name: "TSA Tratores", hasGoal: "SIM", goalType: "Faturamento", goalValue: "Crescer 40% do faturamento" },
      { name: "Senador Truck", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Reconhecimento de marca" },
      { name: "Estecc", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Reconhecimento de marca e seguidores" },
      { name: "Fieza", hasGoal: "SIM", goalType: "Faturamento", goalValue: "Ultrapassar 300k de faturamento" },
      { name: "MPA", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Desenvolvimento de software SDR IA" },
      { name: "Unit Brasil", hasGoal: "SIM", goalType: "Faturamento", goalValue: "Alcançar 40 vendas em 3 meses" },
      { name: "Ótica a Fabrica", hasGoal: "NAO" },
      { name: "Voight", hasGoal: "NAO" },
      { name: "TSA", hasGoal: "NAO" },
      { name: "PkLog", hasGoal: "NAO" },
      { name: "Dichopp Cervejas Especiais", hasGoal: "NAO" },
      { name: "MQ Construtora", hasGoal: "NAO" },
      { name: "PK Log", hasGoal: "NAO" },
      { name: "Óticas a fábrica", hasGoal: "NAO" },
    ]
  },
  {
    name: "STRIKE FORCE",
    id: "strike-force",
    leader: "Gabriel Henrique Lasaro Elias",
    clients: [
      { name: "HD Flex", hasGoal: "SIM", goalType: "Faturamento", goalValue: "Chegar ao faturamento: 40k" },
      { name: "Construtora Messa", hasGoal: "SIM", goalType: "Leads", goalValue: "1 Lead qualificado até dezembro 2025" },
      { name: "Nolasco Hair", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Número de cirurgias realizadas" },
      { name: "Drs. da Beleza", hasGoal: "SIM", goalType: "Faturamento", goalValue: "Chegar ao faturamento: 60k" },
      { name: "Frigel", hasGoal: "SIM", goalType: "Faturamento", goalValue: "Chegar ao faturamento: 35k" },
      { name: "Atlanta Veículos", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Vender 2 carros elétricos em 90D" },
      { name: "Avanço Construtora", hasGoal: "NAO_DEFINIDO" },
      { name: "Avanço Imobiliária", hasGoal: "NAO_DEFINIDO" },
      { name: "G2i", hasGoal: "NAO_DEFINIDO" },
      { name: "Unitrier", hasGoal: "NAO_DEFINIDO", goalType: "Leads", goalValue: "Atingir ICP ideal - supermercados 1M+" },
      { name: "A fabulosa máquina de doce", hasGoal: "NAO" },
      { name: "Câmbio Go", hasGoal: "NAO" },
      { name: "Boné Tintas", hasGoal: "NAO" },
      { name: "Somaxi", hasGoal: "NAO" },
      { name: "X-picanha Beach", hasGoal: "NAO" },
      { name: "WDS", hasGoal: "NAO" },
      { name: "Popular Casa e Construção", hasGoal: "NAO" },
      { name: "Clínica Daniele Melo", hasGoal: "NAO" },
    ]
  },
  {
    name: "INTERNACIONAL",
    id: "internacional",
    leader: "Jose Angelo Moreira",
    clients: [
      { name: "Tramontina Panamá", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Fortalecer branding na América Central" },
      { name: "Tramontina Honduras", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Fortalecer branding na América Central" },
      { name: "Tramontina Costa Rica", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Fortalecer branding na América Central" },
      { name: "Tramontina Institucional", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Meta de alcance maior que ano passado" },
      { name: "Universal Countertop", hasGoal: "SIM", goalType: "Leads", goalValue: "Leads Qualificados" },
      { name: "Dr. Physio Therapy & Wellness", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Reconhecimento de marca + Leads" },
      { name: "Friedland Law", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Alcançar 5k de seguidores" },
      { name: "ARPA Flooring", hasGoal: "SIM", goalType: "Faturamento", goalValue: "Faturamento de 50k" },
      { name: "BeOnne", hasGoal: "SIM", goalType: "OUTROS", goalValue: "Reconhecimento de marca + Leads" },
      { name: "Holi Solar", hasGoal: "SIM", goalType: "Leads", goalValue: "Leads Qualificados" },
      { name: "Meregali", hasGoal: "SIM", goalType: "Faturamento", goalValue: "Faturamento de 10k/mês" },
      { name: "E-Saúde", hasGoal: "SIM", goalType: "Leads", goalValue: "10k Usuários na plataforma" },
      { name: "Top Pro Flooring", hasGoal: "NAO" },
    ]
  }
];

export const getOverallStats = () => {
  const stats = {
    total: 0,
    withGoals: 0,
    withoutGoals: 0,
    pending: 0,
    bySquad: {} as Record<string, { withGoals: number; withoutGoals: number; pending: number }>
  };

  squadsData.forEach(squad => {
    stats.bySquad[squad.name] = { withGoals: 0, withoutGoals: 0, pending: 0 };
    
    squad.clients.forEach(client => {
      stats.total++;
      if (client.hasGoal === "SIM") {
        stats.withGoals++;
        stats.bySquad[squad.name].withGoals++;
      } else if (client.hasGoal === "NAO_DEFINIDO") {
        stats.pending++;
        stats.bySquad[squad.name].pending++;
      } else {
        stats.withoutGoals++;
        stats.bySquad[squad.name].withoutGoals++;
      }
    });
  });

  return stats;
};
