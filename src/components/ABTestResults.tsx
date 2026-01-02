import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface SignificanceResult {
  variant_id: string;
  variant_name: string;
  sample_size: number;
  avg_engagement_rate: number;
  is_statistically_significant: boolean;
  confidence_level: number;
  improvement_over_control: number;
}

interface Insight {
  type: string;
  message: string;
  confidence: number;
}

interface Analysis {
  status: string;
  totalSampleSize: number;
  meetsMinimum: boolean;
  hasWinner: boolean;
  recommendation: string;
  nextSteps: string[];
  insights: Insight[];
  estimatedTimeToCompletion: string;
}

interface Variant {
  id: string;
  variant_name: string;
  is_control: boolean;
  posts_published: number;
  avg_engagement_rate: number;
}

interface ABTest {
  id: string;
  name: string;
  hypothesis: string;
  status: string;
  minimum_sample_size: number;
  ab_test_variants: Variant[];
}

interface ABTestResultsProps {
  testId: string;
}

export function ABTestResults({ testId }: ABTestResultsProps) {
  const [results, setResults] = useState<{
    test: ABTest;
    significance: SignificanceResult[];
    analysis: Analysis;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 30000);
    return () => clearInterval(interval);
  }, [testId]);
  
  const loadResults = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ab-testing', {
        body: { action: 'get_results', testId }
      });
      if (error) throw error;
      setResults(data);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!results) return null;
  
  const { test, significance, analysis } = results;
  const totalTarget = test.minimum_sample_size * test.ab_test_variants.length;
  const progressPercent = Math.min((analysis.totalSampleSize / totalTarget) * 100, 100);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{test.name}</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">{test.hypothesis}</p>
            </div>
            <Badge variant={test.status === 'completed' ? 'default' : test.status === 'running' ? 'secondary' : 'outline'}>
              {test.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Posts</p>
              <p className="text-2xl font-bold">{analysis.totalSampleSize}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Target</p>
              <p className="text-2xl font-bold">{totalTarget}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Progress</p>
              <p className="text-2xl font-bold text-primary">{Math.round(progressPercent)}%</p>
            </div>
          </div>
          <Progress value={progressPercent} className="mt-4" />
        </CardContent>
      </Card>
      
      {/* Variant Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {significance.map((variant, idx) => (
            <div key={variant.variant_id} className={`p-4 rounded-lg border ${
              variant.is_statistically_significant ? 'border-green-500 bg-green-500/10' : 'border-border'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    idx === 0 ? 'bg-blue-600' : 'bg-primary'
                  } text-white`}>
                    {idx === 0 ? 'C' : String.fromCharCode(65 + idx - 1)}
                  </div>
                  <div>
                    <p className="font-semibold">{variant.variant_name}</p>
                    <p className="text-muted-foreground text-sm">{variant.sample_size} posts published</p>
                  </div>
                </div>
                {variant.is_statistically_significant && (
                  <Trophy className="w-6 h-6 text-yellow-500" />
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Engagement Rate</p>
                  <p className="text-xl font-bold">{variant.avg_engagement_rate.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">vs Control</p>
                  <p className={`text-xl font-bold flex items-center gap-1 ${
                    variant.improvement_over_control > 0 ? 'text-green-500' :
                    variant.improvement_over_control < 0 ? 'text-red-500' :
                    'text-muted-foreground'
                  }`}>
                    {variant.improvement_over_control > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : variant.improvement_over_control < 0 ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : null}
                    {variant.improvement_over_control > 0 ? '+' : ''}{variant.improvement_over_control.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Confidence</p>
                  <p className="text-xl font-bold">{variant.confidence_level.toFixed(0)}%</p>
                </div>
              </div>
              
              {variant.is_statistically_significant && (
                <div className="mt-3 flex items-center gap-2 text-green-500 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Statistically significant winner!
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg ${
            analysis.hasWinner ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted'
          }`}>
            <p className="font-semibold">{analysis.recommendation}</p>
            <p className="text-muted-foreground text-sm mt-1">{analysis.estimatedTimeToCompletion}</p>
          </div>
          
          <div>
            <p className="font-semibold mb-2">Next Steps:</p>
            <ul className="space-y-1">
              {analysis.nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-muted-foreground text-sm">
                  <span className="text-primary">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          {analysis.insights && analysis.insights.length > 0 && (
            <div>
              <p className="font-semibold mb-2">Insights:</p>
              <div className="space-y-2">
                {analysis.insights.map((insight, idx) => (
                  <div key={idx} className={`p-3 rounded text-sm ${
                    insight.type === 'positive' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {insight.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
