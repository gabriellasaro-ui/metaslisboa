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
      // Get completions for this goal to calculate stats
      const { data: completions } = await supabase
        .from('squad_goal_completions')
        .select('*')
        .eq('squad_goal_id', goal.id)

      const totalParticipants = completions?.length || 0
      const completedParticipants = completions?.filter(c => c.completed).length || 0
      const completionRate = totalParticipants > 0 
        ? Math.round((completedParticipants / totalParticipants) * 100) 
        : 0

      // Get the last cycle number for this goal
      const { data: lastCycle } = await supabase
        .from('squad_goal_cycles')
        .select('cycle_number')
        .eq('squad_goal_id', goal.id)
        .order('cycle_number', { ascending: false })
        .limit(1)
        .single()

      const cycleNumber = (lastCycle?.cycle_number || 0) + 1

      // Save cycle history before resetting
      const { error: cycleError } = await supabase
        .from('squad_goal_cycles')
        .insert({
          squad_goal_id: goal.id,
          cycle_number: cycleNumber,
          cycle_start_date: goal.start_date || goal.created_at,
          cycle_end_date: now,
          target_value: goal.target_value,
          achieved_value: goal.current_value,
          completion_rate: completionRate,
          total_participants: totalParticipants,
          completed_participants: completedParticipants
        })

      if (cycleError) {
        console.error(`Error saving cycle history for goal ${goal.id}:`, cycleError)
      } else {
        console.log(`Saved cycle ${cycleNumber} history for goal ${goal.id}`)
      }

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
          start_date: now,
          next_reset_at: nextResetDate.toISOString(),
          target_date: nextResetDate.toISOString()
        })
        .eq('id', goal.id)

      if (updateError) {
        console.error(`Error resetting goal ${goal.id}:`, updateError)
        resetResults.push({ goalId: goal.id, success: false, error: updateError.message })
      } else {
        console.log(`Reset goal ${goal.id} (${goal.title}) - Cycle ${cycleNumber} completed`)
        resetResults.push({ 
          goalId: goal.id, 
          success: true, 
          title: goal.title,
          cycleNumber,
          completionRate 
        })

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
