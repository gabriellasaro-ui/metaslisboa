import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date().toISOString()

    // Get all recurring goals that need to be reset
    const { data: goalsToReset, error: fetchError } = await supabase
      .from('squad_goals')
      .select('*')
      .neq('recurrence', 'none')
      .not('recurrence', 'is', null)
      .lte('next_reset_at', now)

    if (fetchError) {
      throw fetchError
    }

    console.log(`Found ${goalsToReset?.length || 0} goals to reset`)

    const resetResults = []

    for (const goal of goalsToReset || []) {
      // Calculate next reset date based on recurrence type
      let nextResetDate: Date
      const baseDate = new Date()

      switch (goal.recurrence) {
        case 'semanal':
          nextResetDate = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case 'quinzenal':
          nextResetDate = new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000)
          break
        case 'mensal':
          nextResetDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000)
          break
        default:
          continue
      }

      // Reset the goal: set current_value to 0 and update next_reset_at
      const { error: updateError } = await supabase
        .from('squad_goals')
        .update({
          current_value: 0,
          status: 'em_andamento',
          next_reset_at: nextResetDate.toISOString(),
          target_date: nextResetDate.toISOString()
        })
        .eq('id', goal.id)

      if (updateError) {
        console.error(`Error resetting goal ${goal.id}:`, updateError)
        resetResults.push({ goalId: goal.id, success: false, error: updateError.message })
      } else {
        console.log(`Reset goal ${goal.id} (${goal.title})`)
        resetResults.push({ goalId: goal.id, success: true, title: goal.title })

        // Delete all completions for this goal so investors can mark again
        const { error: deleteCompletionsError } = await supabase
          .from('squad_goal_completions')
          .delete()
          .eq('squad_goal_id', goal.id)

        if (deleteCompletionsError) {
          console.error(`Error deleting completions for goal ${goal.id}:`, deleteCompletionsError)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${goalsToReset?.length || 0} recurring goals`,
        results: resetResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in reset-recurring-goals:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
