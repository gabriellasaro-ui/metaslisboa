import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
  id: string;
  activity_type: 'check_in_created' | 'check_in_updated' | 'goal_completed' | 'goal_failed' | 'goal_started' | 'health_score_changed' | 'client_created' | 'client_updated';
  user_id?: string;
  client_id?: string;
  goal_id?: string;
  squad_id: string;
  title: string;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
  user?: {
    name: string;
  };
}

export const useActivityLogs = (squadId?: string | null, limit = 20) => {
  return useQuery({
    queryKey: ['activity-logs', squadId, limit],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (squadId) {
        query = query.eq('squad_id', squadId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch user names separately
      const userIds = [...new Set(data?.filter(a => a.user_id).map(a => a.user_id))];
      let userMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);
        
        if (profiles) {
          userMap = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {});
        }
      }
      
      return (data || []).map(activity => ({
        ...activity,
        user: activity.user_id ? { name: userMap[activity.user_id] || 'Usuário' } : undefined
      })) as ActivityLog[];
    }
  });
};
