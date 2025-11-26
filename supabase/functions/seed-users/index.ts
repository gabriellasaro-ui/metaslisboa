import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserData {
  email: string;
  password: string;
  name: string;
  role: 'investidor' | 'coordenador' | 'supervisor';
  squad_id: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Starting user seed process...');

    // Get squad IDs mapping
    const { data: squads, error: squadsError } = await supabaseAdmin
      .from('squads')
      .select('id, name');

    if (squadsError) {
      console.error('Error fetching squads:', squadsError);
      throw squadsError;
    }

    const squadMap: Record<string, string> = {};
    squads.forEach((squad) => {
      squadMap[squad.name.toLowerCase()] = squad.id;
    });

    console.log('Squad mapping:', squadMap);

    // Define all users to be created
    const usersToCreate: UserData[] = [
      // Admins
      { email: 'adm1@v4company.com', password: 'adm123', name: 'Admin 1', role: 'supervisor', squad_id: null },
      { email: 'adm2@v4company.com', password: 'adm123', name: 'Admin 2', role: 'supervisor', squad_id: null },
      
      // Coordenadores
      { email: 'ronaldo.teixeira@v4company.com', password: '12345678v4', name: 'Ronaldo Teixeira Santos', role: 'coordenador', squad_id: squadMap['internacional'] },
      { email: 'pricila@v4company.com', password: '12345678v4', name: 'Pricila', role: 'coordenador', squad_id: squadMap['strike force'] },
      { email: 'gabiella.cardozo@v4company.com', password: '12345678v4', name: 'Gabriella Cardozo', role: 'coordenador', squad_id: squadMap['tigers'] },
      { email: 'victor.alencar@v4company.com', password: '12345678v4', name: 'Victor Alencar', role: 'coordenador', squad_id: squadMap['shark'] },
      { email: 'laura.mello@v4company.com', password: '12345678v4', name: 'Laura Mello Soares', role: 'coordenador', squad_id: squadMap['midas'] },
      
      // Supervisores
      { email: 'gabriel.soares@v4company.com', password: '12345678v4', name: 'Gabriel Soares', role: 'supervisor', squad_id: null },
      { email: 'aline.lisboa@v4company.com', password: '12345678v4', name: 'Aline Lisboa', role: 'supervisor', squad_id: null },
      { email: 'eduardo.lisboa@v4company.com', password: '12345678v4', name: 'Eduardo Lisboa', role: 'supervisor', squad_id: null },
      { email: 'mayara.moreira@v4company.com', password: '12345678v4', name: 'Mayara Moreira', role: 'supervisor', squad_id: null },
      
      // Investidores
      { email: 'adriano.diniz@v4company.com', password: '12345678v4', name: 'Adriano Roedel Diniz', role: 'investidor', squad_id: squadMap['internacional'] },
      { email: 'amanda.souza@v4company.com', password: '12345678v4', name: 'Amanda Magalhães', role: 'investidor', squad_id: squadMap['tigers'] },
      { email: 'andressa.souza@v4company.com', password: '12345678v4', name: 'Andressa Souza', role: 'investidor', squad_id: squadMap['strike force'] },
      { email: 'arthur.braga@v4company.com', password: '12345678v4', name: 'Arthur Braga', role: 'investidor', squad_id: squadMap['strike force'] },
      { email: 'carlos.fernandes@v4company.com', password: '12345678v4', name: 'Carlos Fernandes', role: 'investidor', squad_id: squadMap['shark'] },
      { email: 'dannilo.medeiros@v4company.com', password: '12345678v4', name: 'Dannilo Gomes', role: 'investidor', squad_id: squadMap['midas'] },
      { email: 'enzomaas@v4company.com', password: '12345678v4', name: 'Enzo Maas da Silva', role: 'investidor', squad_id: squadMap['shark'] },
      { email: 'enzo.tiago@v4company.com', password: '12345678v4', name: 'Enzo Tiago Gonçalves Ferreira', role: 'investidor', squad_id: squadMap['shark'] },
      { email: 'gabriel.victor@v4company.com', password: '12345678v4', name: 'Gabriel Cardoso', role: 'investidor', squad_id: squadMap['tigers'] },
      { email: 'gabriel.lasaro@v4company.com', password: '12345678v4', name: 'Gabriel Henrique Lasaro Elias', role: 'investidor', squad_id: squadMap['internacional'] },
      { email: 'isaac.emanuel@v4company.com', password: '12345678v4', name: 'Isaac Emanuel', role: 'investidor', squad_id: squadMap['shark'] },
      { email: 'julia.arilha2@v4company.com', password: '12345678v4', name: 'Julia Arilha', role: 'investidor', squad_id: squadMap['strike force'] },
      { email: 'julia.gontijo@v4company.com', password: '12345678v4', name: 'Julia Gontijo', role: 'investidor', squad_id: squadMap['tigers'] },
      { email: 'karolaine@v4company.com', password: '12345678v4', name: 'Karolaine', role: 'investidor', squad_id: squadMap['internacional'] },
      { email: 'otavio.augusto@v4company.com', password: '12345678v4', name: 'Otavio Augusto Meireles Pimenta', role: 'investidor', squad_id: squadMap['shark'] },
      { email: 'pablo.moura@v4company.com', password: '12345678v4', name: 'Pablo Moura', role: 'investidor', squad_id: squadMap['midas'] },
      { email: 'pedro.rezende@v4company.com', password: '12345678v4', name: 'Pedro Augusto de Rezende Teixeira', role: 'investidor', squad_id: squadMap['midas'] },
      { email: 'pedro.vitorino@v4company.com', password: '12345678v4', name: 'Pedro Lucas Vitorino Ribeiro', role: 'investidor', squad_id: squadMap['tigers'] },
      { email: 'samuel.henrique@v4company.com', password: '12345678v4', name: 'Samuel Henrique', role: 'investidor', squad_id: squadMap['shark'] },
      { email: 'thiago1.silva@v4company.com', password: '12345678v4', name: 'Thiago Silva', role: 'investidor', squad_id: squadMap['strike force'] },
    ];

    const results = {
      success: [] as string[],
      errors: [] as { email: string; error: string }[],
    };

    // Create users one by one
    for (const userData of usersToCreate) {
      try {
        console.log(`Creating user: ${userData.email}`);

        // Create user with Admin API
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            name: userData.name,
            role: userData.role,
            squad_id: userData.squad_id,
          },
        });

        if (authError) {
          console.error(`Error creating user ${userData.email}:`, authError);
          results.errors.push({ email: userData.email, error: authError.message });
          continue;
        }

        console.log(`User created: ${userData.email}, updating must_change_password...`);

        // Update profile to set must_change_password = true
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ must_change_password: true })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error(`Error updating profile for ${userData.email}:`, profileError);
          results.errors.push({ 
            email: userData.email, 
            error: `Profile update failed: ${profileError.message}` 
          });
          continue;
        }

        results.success.push(userData.email);
        console.log(`✅ Successfully created: ${userData.email}`);
      } catch (error) {
        console.error(`Exception creating user ${userData.email}:`, error);
        results.errors.push({ 
          email: userData.email, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    console.log('Seed process completed');
    console.log(`Success: ${results.success.length}`);
    console.log(`Errors: ${results.errors.length}`);

    return new Response(
      JSON.stringify({
        message: 'User seed process completed',
        total: usersToCreate.length,
        success: results.success.length,
        errors: results.errors.length,
        details: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: results.errors.length > 0 ? 207 : 200,
      }
    );
  } catch (error) {
    console.error('Fatal error in seed-users function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});