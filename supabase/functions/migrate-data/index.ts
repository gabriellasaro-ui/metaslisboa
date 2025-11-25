import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dados dos líderes
const leadersData = [
  {
    name: "Gabriel",
    email: "gabriel@empresa.com",
    role: "Squad Leader",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel&backgroundColor=b6e3f4",
    joined_date: new Date(2024, 0, 1).toISOString(),
  },
  {
    name: "Otavio",
    email: "otavio@empresa.com",
    role: "Squad Leader",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Otavio&backgroundColor=c0aede",
    joined_date: new Date(2024, 0, 1).toISOString(),
  },
];

// Dados dos squads com seus clientes
const squadsData = [
  {
    name: "SHARK",
    slug: "shark",
    leader_email: "otavio@empresa.com",
    clients: [
      { name: "Groupwork", status: "ativo", goal_type: "Leads", goal_value: "Realizar a primeira venda", notes: "" },
      { name: "Burning Fest", status: "ativo", goal_type: "Faturamento", goal_value: "R$20.000.000/ano", notes: "" },
      { name: "Hotel Uirapuru", status: "ativo", goal_type: "Faturamento", goal_value: "R$200.000,00/mês", notes: "" },
      { name: "Império das Bebidas", status: "ativo", goal_type: "OUTROS", goal_value: "Alcansar 1000 downloads no mês de novembro", notes: "" },
      { name: "Km2 Representações", status: "ativo", goal_type: "Faturamento", goal_value: "R$300.000/quarter", notes: "" },
      { name: "Tradição Caipira", status: "ativo", goal_type: "OUTROS", goal_value: "Reconhecimento Nacional", notes: "" },
      { name: "WK Estética", status: "ativo", goal_type: "Faturamento", goal_value: "Aumento de 30% (+R$40.000 mensal)", notes: "" },
      { name: "Rica Alimentos", status: "ativo", goal_type: "Faturamento", goal_value: "R$2.000.000", notes: "" },
      { name: "Lini Eventos", status: "ativo", goal_type: "Faturamento", goal_value: "500k de faturamento em um evento", notes: "" },
      { name: "Água Branca", status: "ativo", goal_type: null, goal_value: null, notes: "Meta já alcansada em 2025, planejamento para 2026" },
      { name: "Festival Volta ao Mundo", status: "ativo", goal_type: null, goal_value: null, notes: "Em processo de formulação de meta para 2026" },
      { name: "Guardião Consultoria", status: "aviso_previo", goal_type: null, goal_value: null, notes: "Aviso prévio, possível reajuste de fee. Meta em discussão" },
      { name: "Kit Lanche Gostosuras", status: "ativo", goal_type: "OUTROS", goal_value: "Leads mais qualificados", notes: "" },
      { name: "Supermercado Silvana", status: "ativo", goal_type: null, goal_value: null, notes: "Em processo de formulação de meta" },
      { name: "Buffet Encanto e Magia", status: "ativo", goal_type: "Leads", goal_value: "Leads mais qualificados", notes: "" },
      { name: "Dfibra", status: "ativo", goal_type: null, goal_value: null, notes: "Meta em formulação para 2026" },
      { name: "DISTRIFERRO", status: "ativo", goal_type: null, goal_value: null, notes: "Meta em formulação para 2026" },
      { name: "Grunn", status: "ativo", goal_type: "Leads", goal_value: "A combinar", notes: "" },
      { name: "Tradição caipira", status: "ativo", goal_type: "OUTROS", goal_value: "25k de seguidores em até janeiro", notes: "" },
    ]
  },
  {
    name: "TIGERS",
    slug: "tigers",
    leader_email: "gabriel@empresa.com",
    clients: [
      { name: "B2E", status: "ativo", goal_type: "Faturamento", goal_value: "8 vendas até janeiro", notes: "" },
      { name: "Escritório do Geraldo", status: "ativo", goal_type: "Faturamento", goal_value: "1 Venda até o final do ano", notes: "" },
      { name: "Krum", status: "ativo", goal_type: "Faturamento", goal_value: "Vender o Pathernon até Março (ap de 1mm)", notes: "" },
      { name: "Lojas Pavone", status: "ativo", goal_type: "Faturamento", goal_value: "350k por loja", notes: "" },
      { name: "4D Soluções", status: "ativo", goal_type: "Faturamento", goal_value: "2 vendas nos próximos 60 dias", notes: "" },
      { name: "Akeos", status: "ativo", goal_type: "Faturamento", goal_value: "Até 5 vendas por mês", notes: "" },
      { name: "MPA", status: "ativo", goal_type: "OUTROS", goal_value: "10 contratos por mês", notes: "" },
      { name: "Uai Farma", status: "ativo", goal_type: null, goal_value: null, notes: "Está sendo trabalhado, metas para meses futuros" },
      { name: "Help Car", status: "ativo", goal_type: null, goal_value: null, notes: "Em produção, call marcada para definir meta 2026" },
      { name: "Fortfill", status: "ativo", goal_type: null, goal_value: null, notes: "Meta em formulação após reunião" },
      { name: "Altxs", status: "aviso_previo", goal_type: null, goal_value: null, notes: "Cliente em aviso prévio" },
      { name: "Consórcio Nanuque", status: "ativo", goal_type: null, goal_value: null, notes: "Meta em formulação para 2026" },
      { name: "Toolbox", status: "ativo", goal_type: null, goal_value: null, notes: "Meta em formulação para 2026" },
      { name: "QuebraMar", status: "ativo", goal_type: null, goal_value: null, notes: "Meta em formulação para 2026" },
    ]
  },
  {
    name: "MIDAS",
    slug: "midas",
    leader_email: "gabriel@empresa.com",
    clients: [
      { name: "Comatral", status: "ativo", goal_type: "Faturamento", goal_value: "2 milhões com marketing", notes: "" },
      { name: "TSA Tratores", status: "ativo", goal_type: "Faturamento", goal_value: "Crescer 40% do faturamento", notes: "" },
      { name: "Senador Truck", status: "ativo", goal_type: "OUTROS", goal_value: "Reconhecimento de marca", notes: "" },
      { name: "Estecc", status: "ativo", goal_type: "OUTROS", goal_value: "Reconhecimento de marca e seguidores", notes: "" },
      { name: "Fieza", status: "ativo", goal_type: "Faturamento", goal_value: "Ultrapassar 300k de faturamento", notes: "" },
      { name: "MPA", status: "ativo", goal_type: "OUTROS", goal_value: "Desenvolvimento de software SDR IA", notes: "" },
      { name: "Unit Brasil", status: "ativo", goal_type: "Faturamento", goal_value: "Alcançar 40 vendas em 3 meses", notes: "" },
      { name: "Óticas a Fábrica", status: "churned", goal_type: null, goal_value: null, notes: "" },
      { name: "Voight", status: "churned", goal_type: null, goal_value: null, notes: "" },
      { name: "PK Log", status: "churned", goal_type: null, goal_value: null, notes: "" },
      { name: "Dichopp Cervejas Especiais", status: "churned", goal_type: null, goal_value: null, notes: "" },
      { name: "MQ Construtora", status: "churned", goal_type: null, goal_value: null, notes: "" },
    ]
  },
  {
    name: "STRIKE FORCE",
    slug: "strike-force",
    leader_email: "otavio@empresa.com",
    clients: [
      { name: "HD Flex", status: "ativo", goal_type: "Faturamento", goal_value: "Chegar ao faturamento: 40k", notes: "" },
      { name: "Construtora Messa", status: "ativo", goal_type: "Leads", goal_value: "1 Lead qualificado até dezembro 2025", notes: "" },
      { name: "Nolasco Hair", status: "ativo", goal_type: "OUTROS", goal_value: "Número de cirurgias realizadas", notes: "" },
      { name: "Drs. da Beleza", status: "ativo", goal_type: "Faturamento", goal_value: "Chegar ao faturamento: 60k", notes: "" },
      { name: "Frigel", status: "ativo", goal_type: "Faturamento", goal_value: "Chegar ao faturamento: 35k", notes: "" },
      { name: "Atlanta Veículos", status: "ativo", goal_type: "OUTROS", goal_value: "Vender 2 carros elétricos em 90D", notes: "" },
      { name: "Avanço Construtora", status: "ativo", goal_type: null, goal_value: null, notes: "" },
      { name: "Avanço Imobiliária", status: "ativo", goal_type: null, goal_value: null, notes: "" },
      { name: "G2i", status: "ativo", goal_type: null, goal_value: null, notes: "" },
      { name: "Unitrier", status: "ativo", goal_type: "Leads", goal_value: "Atingir ICP ideal - supermercados 1M+", notes: "" },
      { name: "A fabulosa máquina de doce", status: "churned", goal_type: null, goal_value: null, notes: "" },
      { name: "Câmbio Go", status: "churned", goal_type: null, goal_value: null, notes: "" },
      { name: "Boné Tintas", status: "churned", goal_type: null, goal_value: null, notes: "" },
      { name: "Somaxi", status: "churned", goal_type: null, goal_value: null, notes: "" },
      { name: "X-picanha Beach", status: "churned", goal_type: null, goal_value: null, notes: "" },
      { name: "WDS", status: "churned", goal_type: null, goal_value: null, notes: "" },
      { name: "Popular Casa e Construção", status: "churned", goal_type: null, goal_value: null, notes: "" },
      { name: "Clínica Daniele Melo", status: "churned", goal_type: null, goal_value: null, notes: "" },
    ]
  },
  {
    name: "INTERNACIONAL",
    slug: "internacional",
    leader_email: "gabriel@empresa.com",
    clients: [
      { name: "Tramontina Panamá", status: "ativo", goal_type: "OUTROS", goal_value: "Fortalecer branding na América Central", notes: "" },
      { name: "Tramontina Honduras", status: "ativo", goal_type: "OUTROS", goal_value: "Fortalecer branding na América Central", notes: "" },
      { name: "Tramontina Costa Rica", status: "ativo", goal_type: "OUTROS", goal_value: "Fortalecer branding na América Central", notes: "" },
      { name: "Tramontina Institucional", status: "ativo", goal_type: "OUTROS", goal_value: "Meta de alcance maior que ano passado", notes: "" },
      { name: "Universal Countertop", status: "ativo", goal_type: "Leads", goal_value: "Leads Qualificados", notes: "" },
      { name: "Dr. Physio Therapy & Wellness", status: "ativo", goal_type: "OUTROS", goal_value: "Reconhecimento de marca + Leads", notes: "" },
      { name: "Friedland Law", status: "ativo", goal_type: "OUTROS", goal_value: "Alcançar 5k de seguidores", notes: "" },
      { name: "ARPA Flooring", status: "ativo", goal_type: "Faturamento", goal_value: "Faturamento de 50k", notes: "" },
      { name: "BeOnne", status: "ativo", goal_type: "OUTROS", goal_value: "Reconhecimento de marca + Leads", notes: "" },
      { name: "Holi Solar", status: "ativo", goal_type: "Leads", goal_value: "Leads Qualificados", notes: "" },
      { name: "Meregali", status: "ativo", goal_type: "Faturamento", goal_value: "Faturamento de 10k/mês", notes: "" },
      { name: "E-Saúde", status: "ativo", goal_type: "Leads", goal_value: "10k Usuários na plataforma", notes: "" },
      { name: "Top Pro Flooring", status: "churned", goal_type: null, goal_value: null, notes: "" },
    ]
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Iniciando migração de dados...');

    // 1. Inserir líderes
    console.log('📝 Inserindo líderes...');
    const { data: leaders, error: leadersError } = await supabase
      .from('leaders')
      .upsert(leadersData, { onConflict: 'email' })
      .select();

    if (leadersError) {
      console.error('❌ Erro ao inserir líderes:', leadersError);
      throw leadersError;
    }
    console.log(`✅ ${leaders.length} líderes inseridos`);

    // Criar mapa de líderes por email
    const leadersByEmail = leaders.reduce((acc, leader) => {
      acc[leader.email] = leader.id;
      return acc;
    }, {} as Record<string, string>);

    // 2. Inserir squads
    console.log('📝 Inserindo squads...');
    const squadsToInsert = squadsData.map(squad => ({
      name: squad.name,
      slug: squad.slug,
      leader_id: leadersByEmail[squad.leader_email],
    }));

    const { data: squads, error: squadsError } = await supabase
      .from('squads')
      .upsert(squadsToInsert, { onConflict: 'name' })
      .select();

    if (squadsError) {
      console.error('❌ Erro ao inserir squads:', squadsError);
      throw squadsError;
    }
    console.log(`✅ ${squads.length} squads inseridos`);

    // Criar mapa de squads por nome
    const squadsByName = squads.reduce((acc, squad) => {
      acc[squad.name] = squad.id;
      return acc;
    }, {} as Record<string, string>);

    // 3. Inserir clientes e suas metas
    let totalClients = 0;
    let totalGoals = 0;

    for (const squadData of squadsData) {
      const squadId = squadsByName[squadData.name];
      console.log(`📝 Inserindo clientes do squad ${squadData.name}...`);

      for (const clientData of squadData.clients) {
        // Inserir cliente
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .upsert({
            name: clientData.name,
            squad_id: squadId,
            status: clientData.status,
            notes: clientData.notes || null,
            aviso_previo_date: clientData.status === 'aviso_previo' ? new Date().toISOString() : null,
            churned_date: clientData.status === 'churned' ? new Date().toISOString() : null,
          }, { onConflict: 'name,squad_id' })
          .select()
          .single();

        if (clientError) {
          console.error(`❌ Erro ao inserir cliente ${clientData.name}:`, clientError);
          continue;
        }

        totalClients++;

        // Inserir meta se existir
        if (clientData.goal_type && clientData.goal_value) {
          const { error: goalError } = await supabase
            .from('goals')
            .insert({
              client_id: client.id,
              goal_type: clientData.goal_type,
              goal_value: clientData.goal_value,
              status: 'em_andamento',
              progress: 0,
              start_date: new Date().toISOString(),
            });

          if (goalError) {
            console.error(`❌ Erro ao inserir meta para ${clientData.name}:`, goalError);
          } else {
            totalGoals++;
          }
        }
      }
    }

    console.log(`✅ ${totalClients} clientes inseridos`);
    console.log(`✅ ${totalGoals} metas inseridas`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Migração concluída com sucesso!',
        stats: {
          leaders: leaders.length,
          squads: squads.length,
          clients: totalClients,
          goals: totalGoals,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
