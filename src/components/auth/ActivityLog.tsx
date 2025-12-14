import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, LogIn, LogOut, FileEdit, Trash2, Plus, Settings, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLogEntry {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  login: <LogIn className="w-4 h-4" />,
  logout: <LogOut className="w-4 h-4" />,
  create: <Plus className="w-4 h-4" />,
  update: <FileEdit className="w-4 h-4" />,
  delete: <Trash2 className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
};

const formatAction = (action: string): string => {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export function ActivityLog() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const key = Object.keys(actionIcons).find((k) => action.toLowerCase().includes(k));
    return key ? actionIcons[key] : <Activity className="w-4 h-4" />;
  };

  const getActionColor = (action: string): string => {
    if (action.includes('delete')) return 'text-red-400';
    if (action.includes('create')) return 'text-green-400';
    if (action.includes('login')) return 'text-blue-400';
    if (action.includes('security') || action.includes('2fa')) return 'text-yellow-400';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your recent account activity and actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No activity recorded yet
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 pb-4 border-b border-border last:border-0"
                >
                  <div
                    className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getActionColor(
                      activity.action
                    )}`}
                  >
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {formatAction(activity.action)}
                    </p>
                    {activity.resource_type && (
                      <p className="text-sm text-muted-foreground">
                        {activity.resource_type}
                        {activity.details?.name && `: ${activity.details.name}`}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                      {activity.ip_address && (
                        <Badge variant="outline" className="text-xs">
                          {activity.ip_address}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
