import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goalId } = await req.json();

    if (!goalId) {
      throw new Error("goalId é obrigatório");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados da meta e check-ins
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select(`
        *,
        client:clients(name, squad:squads(name))
      `)
      .eq('id', goalId)
      .single();

    if (goalError) throw goalError;

    const { data: checkIns, error: checkInsError } = await supabase
      .from('check_ins')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true });

    if (checkInsError) throw checkInsError;

    // Preparar contexto para IA
    const context = `
Cliente: ${goal.client.name}
Squad: ${goal.client.squad.name}
Meta: ${goal.goal_value}
Tipo: ${goal.goal_type}
Período: ${goal.period}
Progresso Final: ${goal.progress}%
Status: ${goal.status}
Data Início: ${goal.started_at}
Data Conclusão: ${goal.completed_date || goal.target_date}

Check-ins (${checkIns.length} registros):
${checkIns.map((c: any, i: number) => `
${i + 1}. Data: ${new Date(c.created_at).toLocaleDateString('pt-BR')}
   Progresso: ${c.progress}%
   Status: ${c.status}
   Comentário: ${c.comment}
   ${c.call_summary ? `Doc: ${c.call_summary}` : ''}
   ${c.call_link ? `Gravação: ${c.call_link}` : ''}
`).join('\n')}
    `.trim();

    // Chamar Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um analista de performance de metas. Analise o histórico de check-ins e forneça um relatório estruturado em português sobre:
1. **Resumo Executivo**: O que foi alcançado (2-3 frases)
2. **Pontos Positivos**: O que funcionou bem
3. **Desafios Identificados**: Por que a meta não foi 100% batida (se aplicável)
4. **Evolução do Progresso**: Padrões observados ao longo do tempo
5. **Recomendações**: 3-5 ações concretas para o próximo período

Use markdown para formatar. Seja objetivo e baseie-se apenas nos dados fornecidos.`
          },
          {
            role: 'user',
            content: context
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erro na API Lovable AI:', errorText);
      throw new Error(`Erro na análise da IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0]?.message?.content || "Análise não disponível";

    // Salvar análise no banco
    const { error: updateError } = await supabase
      .from('goals')
      .update({ 
        ai_analysis: analysis,
        final_report: `Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}`
      })
      .eq('id', goalId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        checkInsCount: checkIns.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro em analyze-goal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});