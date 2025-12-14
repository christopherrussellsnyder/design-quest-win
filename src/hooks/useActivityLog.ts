import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LogActivityParams {
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export function useActivityLog() {
  const { user } = useAuth();

  const logActivity = useCallback(
    async ({ action, resourceType, resourceId, details }: LogActivityParams) => {
      if (!user) return;

      try {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    },
    [user]
  );

  return { logActivity };
}
