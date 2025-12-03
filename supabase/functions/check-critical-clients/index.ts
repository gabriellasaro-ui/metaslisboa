import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CRITICAL_STATUSES = ['danger', 'danger_critico', 'churn', 'aviso_previo'];
const ALERT_THRESHOLD_DAYS = 21;

interface CriticalClient {
  id: string;
  name: string;
  health_status: string;
  squad_id: string;
  last_change_date: string;
  days_without_change: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get clients with critical status
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, name, health_status, squad_id, created_at")
      .in("health_status", CRITICAL_STATUSES);

    if (clientsError) throw clientsError;

    if (!clients || clients.length === 0) {
      return new Response(
        JSON.stringify({ message: "No critical clients found", notified: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientIds = clients.map(c => c.id);

    // Get last health score change for each client
    const { data: history, error: historyError } = await supabase
      .from("health_score_history")
      .select("client_id, changed_at")
      .in("client_id", clientIds)
      .order("changed_at", { ascending: false });

    if (historyError) throw historyError;

    // Get latest change per client
    const latestChanges: Record<string, string> = {};
    (history || []).forEach((h) => {
      if (!latestChanges[h.client_id]) {
        latestChanges[h.client_id] = h.changed_at;
      }
    });

    const now = new Date();
    
    // Find clients without movement for more than threshold
    const criticalClients: CriticalClient[] = clients
      .map((client) => {
        const lastChangeDate = latestChanges[client.id] || client.created_at;
        const daysDiff = Math.floor(
          (now.getTime() - new Date(lastChangeDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return {
          id: client.id,
          name: client.name,
          health_status: client.health_status,
          squad_id: client.squad_id,
          last_change_date: lastChangeDate,
          days_without_change: daysDiff,
        };
      })
      .filter(c => c.days_without_change >= ALERT_THRESHOLD_DAYS);

    if (criticalClients.length === 0) {
      return new Response(
        JSON.stringify({ message: "No clients over threshold", notified: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get coordinators and supervisors to notify
    const { data: usersToNotify, error: usersError } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["coordenador", "supervisor"]);

    if (usersError) throw usersError;

    // Get profiles to match squad_id for coordinators
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, squad_id")
      .in("id", (usersToNotify || []).map(u => u.user_id));

    if (profilesError) throw profilesError;

    const profileSquadMap: Record<string, string | null> = {};
    (profiles || []).forEach(p => {
      profileSquadMap[p.id] = p.squad_id;
    });

    // Check for existing notifications to avoid duplicates (last 24h)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: existingNotifications } = await supabase
      .from("notifications")
      .select("client_id, user_id")
      .eq("type", "client_at_risk")
      .gte("created_at", oneDayAgo);

    const existingSet = new Set(
      (existingNotifications || []).map(n => `${n.client_id}-${n.user_id}`)
    );

    // Create notifications
    const notifications: any[] = [];

    for (const client of criticalClients) {
      const urgencyLevel = client.days_without_change >= 30 ? "crítico" : "alto";
      
      for (const user of usersToNotify || []) {
        // Skip if notification already exists
        if (existingSet.has(`${client.id}-${user.user_id}`)) continue;

        // Coordinators only get notified for their squad
        if (user.role === "coordenador") {
          const userSquadId = profileSquadMap[user.user_id];
          if (userSquadId !== client.squad_id) continue;
        }

        // Check user preferences
        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("client_at_risk")
          .eq("user_id", user.user_id)
          .single();

        if (prefs && prefs.client_at_risk === false) continue;

        notifications.push({
          user_id: user.user_id,
          type: "client_at_risk",
          title: `⏰ Cliente ${client.days_without_change} dias sem movimentação`,
          message: `${client.name} está em status ${client.health_status} há ${client.days_without_change} dias sem atualização. Urgência: ${urgencyLevel}`,
          client_id: client.id,
          metadata: {
            days_without_change: client.days_without_change,
            health_status: client.health_status,
            urgency: urgencyLevel,
          },
        });
      }
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        message: "Notifications sent", 
        notified: notifications.length,
        criticalClients: criticalClients.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
