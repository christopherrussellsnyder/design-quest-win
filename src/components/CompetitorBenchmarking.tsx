import { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, Target, Award, AlertTriangle, Lightbulb, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface CompetitorBenchmarkingProps {
  industry: string;
}

interface ComparisonMetric {
  metric: string;
  user_value: number;
  industry_avg: number;
  percentile: number;
  status: string;
}

interface GapAnalysis {
  metric: string;
  yourValue: number;
  industryAvg: number;
  gap: number;
  percentGap: number;
  severity: string;
  recommendation: string;
}

interface Opportunity {
  type: string;
  title: string;
  description: string;
  actions: string[];
  potentialImpact: string;
}

interface Insight {
  insight_type: string;
  title: string;
  description: string;
  recommendation: string;
  priority: string;
}

interface ComparisonData {
  comparison: ComparisonMetric[];
  gapAnalysis: GapAnalysis[];
  opportunities: Opportunity[];
  insights: Insight[];
}

export function CompetitorBenchmarking({ industry }: CompetitorBenchmarkingProps) {
  const { user } = useAuth();
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (industry && user) {
      loadComparison();
    }
  }, [user, industry]);
  
  const loadComparison = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('competitor-analysis', {
        body: { userId: user.id, action: 'industry_comparison', industry }
      });
      if (error) throw error;
      setComparison(data);
    } catch (error) {
      console.error('Failed to load comparison:', error);
      toast.error('Failed to load industry comparison');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!comparison) return null;
  
  const getPositionBadge = () => {
    const allAbove = comparison.comparison.every(c => c.status === 'above');
    const someAbove = comparison.comparison.some(c => c.status === 'above');
    
    if (allAbove) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Market Leader</Badge>;
    } else if (someAbove) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Strong Performer</Badge>;
    }
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Growth Opportunity</Badge>;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">Industry Benchmarking</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare your performance to {industry} industry standards
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {getPositionBadge()}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparison.comparison.map((metric, idx) => (
              <div key={idx} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-foreground font-medium capitalize">
                    {metric.metric.replace('_', ' ')}
                  </h4>
                  {metric.status === 'above' ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Your Performance</p>
                    <p className="text-xl font-bold text-foreground">
                      {metric.user_value.toFixed(1)}{metric.metric.includes('rate') ? '%' : ''}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Industry Average</p>
                    <p className="text-xl font-bold text-muted-foreground">
                      {metric.industry_avg.toFixed(1)}{metric.metric.includes('rate') ? '%' : ''}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Percentile</p>
                    <p className={`text-xl font-bold ${
                      metric.percentile >= 70 ? 'text-green-400' :
                      metric.percentile >= 50 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      Top {Math.round(100 - metric.percentile)}%
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <Progress 
                    value={metric.percentile} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Gap Analysis */}
      {comparison.gapAnalysis && comparison.gapAnalysis.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <CardTitle className="text-foreground">Performance Gaps</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {comparison.gapAnalysis.map((gap, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-lg border ${
                  gap.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                  gap.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-foreground font-medium capitalize">{gap.metric}</h4>
                  <Badge variant="outline" className={
                    gap.severity === 'high' ? 'border-red-500/50 text-red-400' :
                    gap.severity === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                    'border-blue-500/50 text-blue-400'
                  }>
                    {gap.percentGap}% behind
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  You: {gap.yourValue.toFixed(1)} vs Industry: {gap.industryAvg.toFixed(1)}
                </p>
                <p className="text-sm text-foreground">
                  💡 {gap.recommendation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Strategic Opportunities */}
      {comparison.opportunities && comparison.opportunities.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              <CardTitle className="text-foreground">Strategic Opportunities</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {comparison.opportunities.map((opp, idx) => (
              <div key={idx} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-foreground font-medium">{opp.title}</h4>
                  <Badge className={
                    opp.potentialImpact === 'High' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }>
                    {opp.potentialImpact} Impact
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{opp.description}</p>
                <div>
                  <p className="text-xs text-foreground font-medium mb-2">Action Steps:</p>
                  <ul className="space-y-1">
                    {opp.actions.map((action, aidx) => (
                      <li key={aidx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Competitive Insights */}
      {comparison.insights && comparison.insights.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <CardTitle className="text-foreground">Competitive Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {comparison.insights.map((insight, idx) => (
              <div key={idx} className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-foreground font-medium mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                <p className="text-sm text-primary">🎯 {insight.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
