import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, Globe, Trash2, LogOut } from 'lucide-react';
import { format } from 'date-fns';

interface LoginSession {
  id: string;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  city: string | null;
  country: string | null;
  is_current: boolean;
  last_active_at: string;
  created_at: string;
}

const getDeviceIcon = (deviceType: string | null) => {
  switch (deviceType?.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="w-5 h-5" />;
    case 'tablet':
      return <Tablet className="w-5 h-5" />;
    default:
      return <Monitor className="w-5 h-5" />;
  }
};

export function SessionManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('login_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active_at', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOutSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('login_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'Session signed out',
        description: 'The session has been terminated',
      });

      loadSessions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out session',
        variant: 'destructive',
      });
    }
  };

  const signOutAllOthers = async () => {
    try {
      const currentSession = sessions.find((s) => s.is_current);

      if (!currentSession) {
        // Sign out all
        await supabase.from('login_sessions').delete().eq('user_id', user?.id);
      } else {
        await supabase
          .from('login_sessions')
          .delete()
          .eq('user_id', user?.id)
          .neq('id', currentSession.id);
      }

      toast({
        title: 'Sessions signed out',
        description: 'All other sessions have been terminated',
      });

      loadSessions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out sessions',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex gap-3 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-muted-foreground/20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Devices where you're currently signed in
            </CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={signOutAllOthers}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out all others
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No active sessions found
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {getDeviceIcon(session.device_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {session.browser || 'Unknown browser'} on {session.os || 'Unknown OS'}
                      </p>
                      {session.is_current && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Current session
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.city && session.country
                        ? `${session.city}, ${session.country}`
                        : session.ip_address || 'Unknown location'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {format(new Date(session.last_active_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signOutSession(session.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
