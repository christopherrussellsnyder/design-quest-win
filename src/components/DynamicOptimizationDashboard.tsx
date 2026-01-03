import { useState, useEffect } from 'react';
import { Zap, Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizationRule {
  id: string;
  rule_name: string;
  rule_type: string;
  is_active: boolean;
  priority: number;
  trigger_count: number;
  success_count: number;
}

interface OptimizationAction {
  id: string;
  action_type: string;
  status: string;
  created_at: string;
}

interface PerformanceMonitoring {
  id: string;
  metric_name: string;
  metric_value: number;
  status: string;
  monitored_at: string;
}

interface DashboardStats {
  activeRules: number;
  actionsLast24h: number;
  successRate: string;
  criticalAlerts: number;
  warningAlerts: number;
}

interface DashboardData {
  rules: OptimizationRule[];
  recentActions: OptimizationAction[];
  monitoring: PerformanceMonitoring[];
  stats: DashboardStats;
}

export function DynamicOptimizationDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      loadDashboard();
      const interval = setInterval(loadDashboard, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);
  
  const loadDashboard = async () => {
    try {
      const { data } = await supabase.functions.invoke('dynamic-optimization', {
        body: { userId: user?.id, action: 'get_dashboard' }
      });
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleRule = async (ruleId: string, currentState: boolean) => {
    try {
      await supabase.functions.invoke('dynamic-optimization', {
        body: { 
          userId: user?.id, 
          action: 'toggle_rule',
          ruleData: { ruleId, isActive: !currentState }
        }
      });
      toast.success('Rule updated');
      loadDashboard();
    } catch (error) {
      toast.error('Failed to update rule');
    }
  };
  
  const executeActions = async () => {
    try {
      const { data } = await supabase.functions.invoke('dynamic-optimization', {
        body: { userId: user?.id, action: 'execute_pending_actions' }
      });
      toast.success(data.message);
      loadDashboard();
    } catch (error) {
      toast.error('Failed to execute actions');
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (!dashboard) return null;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 border-violet-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-600/30 flex items-center justify-center">
                <Zap className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Dynamic Optimization</h2>
                <p className="text-muted-foreground">Real-time performance monitoring & auto-adjustments</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-600">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Active
            </Badge>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-background/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Active Rules</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{dashboard.stats.activeRules}</p>
            </div>
            
            <div className="bg-background/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Actions (24h)</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{dashboard.stats.actionsLast24h}</p>
            </div>
            
            <div className="bg-background/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{dashboard.stats.successRate}%</p>
            </div>
            
            <div className="bg-background/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Alerts</span>
              </div>
              <p className={`text-2xl font-bold ${
                dashboard.stats.criticalAlerts > 0 ? 'text-red-400' : 
                dashboard.stats.warningAlerts > 0 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {dashboard.stats.criticalAlerts + dashboard.stats.warningAlerts}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Optimization Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Rules</CardTitle>
          <CardDescription>Automated rules that optimize your content strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboard.rules.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No optimization rules configured yet
              </p>
            ) : (
              dashboard.rules.map((rule) => (
                <div key={rule.id} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => toggleRule(rule.id, rule.is_active)}
                      />
                      <div>
                        <p className="font-medium text-foreground">{rule.rule_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{rule.rule_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Triggered</p>
                        <p className="font-semibold text-foreground">{rule.trigger_count}</p>
                      </div>
                      <Badge variant={
                        rule.priority >= 8 ? 'destructive' :
                        rule.priority >= 5 ? 'default' : 'secondary'
                      }>
                        P{rule.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Actions */}
      {dashboard.recentActions && dashboard.recentActions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Actions</CardTitle>
              <CardDescription>Optimization actions taken automatically</CardDescription>
            </div>
            <Button size="sm" onClick={executeActions}>
              Execute Pending
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboard.recentActions.slice(0, 10).map((action) => (
                <div key={action.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    {action.status === 'executed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {action.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
                    {action.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {action.action_type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(action.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    action.status === 'executed' ? 'default' :
                    action.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {action.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Performance Monitoring */}
      {dashboard.monitoring && dashboard.monitoring.filter(m => m.status !== 'normal').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Monitoring</CardTitle>
            <CardDescription>Real-time performance alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboard.monitoring
                .filter(m => m.status !== 'normal')
                .slice(0, 5)
                .map((metric) => (
                  <div key={metric.id} className={`rounded-lg p-4 ${
                    metric.status === 'critical' ? 'bg-red-900/20 border border-red-700/50' :
                    'bg-yellow-900/20 border border-yellow-700/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {metric.metric_name.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(metric.monitored_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          metric.status === 'critical' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {parseFloat(String(metric.metric_value)).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{metric.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
