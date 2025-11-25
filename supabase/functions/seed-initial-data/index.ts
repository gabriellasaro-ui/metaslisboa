import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SquadData {
  name: string;
  slug: string;
  clients: Array<{
    name: string;
    status: 'ativo' | 'aviso_previo' | 'churned';
    health_status?: 'safe' | 'care' | 'danger';
    notes?: string;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting data seeding...');

    // Dados dos squads
    const squadsData: SquadData[] = [
      {
        name: "SHARK",
        slug: "shark",
        clients: [
          { name: "Groupwork", status: "ativo", health_status: "safe" },
          { name: "Burning Fest", status: "ativo", health_status: "safe" },
          { name: "Hotel Uirapuru", status: "ativo", health_status: "safe" },
          { name: "Império das Bebidas", status: "ativo", health_status: "care" },
          { name: "Km2 Representações", status: "ativo", health_status: "safe" },
          { name: "Tradição Caipira", status: "ativo", health_status: "safe" },
          { name: "WK Estética", status: "ativo", health_status: "safe" },
          { name: "Rica Alimentos", status: "ativo", health_status: "safe" },
          { name: "Lini Eventos", status: "ativo", health_status: "care" },
          { name: "Água Branca", status: "ativo", health_status: "safe", notes: "Meta já alcançada em 2025" },
          { name: "Festival Volta ao Mundo", status: "ativo", health_status: "safe" },
          { name: "Guardião Consultoria", status: "aviso_previo", health_status: "danger" },
          { name: "Kit Lanche Gostosuras", status: "ativo", health_status: "safe" },
          { name: "Supermercado Silvana", status: "ativo", health_status: "care" },
          { name: "Prefeitura Jussara", status: "ativo", health_status: "safe" },
          { name: "Eco Limpeza", status: "ativo", health_status: "safe" },
        ]
      },
      {
        name: "INTERNACIONAL",
        slug: "internacional",
        clients: [
          { name: "Palisano Group", status: "ativo", health_status: "safe" },
          { name: "Top Pro Flooring", status: "churned", health_status: "danger" },
          { name: "Etech Solutions", status: "ativo", health_status: "safe" },
          { name: "Baianos Grill", status: "ativo", health_status: "care" },
          { name: "Oahu BBQ", status: "ativo", health_status: "safe" },
          { name: "Premier Remodeling", status: "ativo", health_status: "safe" },
          { name: "RaymonD", status: "ativo", health_status: "safe" },
        ]
      },
      {
        name: "PANTANAL",
        slug: "pantanal",
        clients: [
          { name: "Construtora Nacional", status: "ativo", health_status: "safe" },
          { name: "Madeiro", status: "ativo", health_status: "safe" },
          { name: "Thebas Restaurante", status: "ativo", health_status: "care" },
          { name: "Restaurante Azul", status: "ativo", health_status: "safe" },
          { name: "Jussari Construtora", status: "ativo", health_status: "safe" },
          { name: "Almoço Pronto", status: "ativo", health_status: "safe" },
          { name: "Posto Santo Antônio", status: "ativo", health_status: "safe" },
          { name: "Klinike Medcare", status: "ativo", health_status: "safe" },
          { name: "Hospital Parque Fênix", status: "ativo", health_status: "care" },
        ]
      }
    ];

    // Verificar se já existem squads para evitar duplicação
    const { count } = await supabase
      .from('squads')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      console.log('Database already has data, skipping seed');
      return new Response(
        JSON.stringify({ 
          message: 'Database already seeded',
          squads: count
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inserir squads e clientes
    let totalClients = 0;
    for (const squadData of squadsData) {
      console.log(`Inserting squad: ${squadData.name}`);
      
      // Inserir squad
      const { data: squad, error: squadError } = await supabase
        .from('squads')
        .insert({
          name: squadData.name,
          slug: squadData.slug,
        })
        .select()
        .single();

      if (squadError) {
        console.error(`Error inserting squad ${squadData.name}:`, squadError);
        continue;
      }

      console.log(`Squad ${squadData.name} created with ID: ${squad.id}`);

      // Inserir clientes do squad
      for (const clientData of squadData.clients) {
        const { error: clientError } = await supabase
          .from('clients')
          .insert({
            name: clientData.name,
            squad_id: squad.id,
            status: clientData.status,
            health_status: clientData.health_status || 'safe',
            notes: clientData.notes || null,
          });

        if (clientError) {
          console.error(`Error inserting client ${clientData.name}:`, clientError);
        } else {
          totalClients++;
          console.log(`Client ${clientData.name} added to ${squadData.name}`);
        }
      }
    }

    console.log('Data seeding completed!');

    return new Response(
      JSON.stringify({ 
        message: 'Data seeded successfully',
        squads: squadsData.length,
        clients: totalClients
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});