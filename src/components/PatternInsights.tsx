import { useState, useEffect } from 'react';
import { TrendingUp, Zap, Target, Hash, Clock, FileText, Image, Video, MessageCircle, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface PatternData {
  value: string;
  postCount: number;
  avgEngagement: number;
  score: number;
}

interface Insight {
  type: string;
  title: string;
  description: string;
  recommendation: string;
  impact: string;
}

interface Recommendation {
  action: string;
  reason: string;
  target: string;
  expectedImpact: string;
}

interface Hashtag {
  element: string;
  usage_count: number;
  avg_engagement: number;
}

interface AnalysisData {
  patterns: Record<string, PatternData[]>;
  insights: Insight[];
  recommendations: Recommendation[];
  topElements: {
    hashtags: Hashtag[];
  };
  summary: {
    totalPatterns: number;
    dataPoints: number;
    confidence: string;
  };
}

interface PatternInsightsProps {
  platform?: string;
}

export function PatternInsights({ platform = 'all' }: PatternInsightsProps) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      analyzePatterns();
    }
  }, [user, platform]);
  
  const analyzePatterns = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('analyze-patterns', {
        body: { userId: user.id, platform }
      });
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to analyze patterns:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!analysis || analysis.summary.totalPatterns === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">Not Enough Data Yet</h3>
          <p className="text-muted-foreground mt-2">Publish at least 10 posts to see performance patterns</p>
        </CardContent>
      </Card>
    );
  }
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Content Performance Patterns
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Based on {analysis.summary.dataPoints} posts
            </p>
          </div>
          <Badge className={getConfidenceColor(analysis.summary.confidence)}>
            {analysis.summary.confidence.toUpperCase()} Confidence
          </Badge>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Content Type */}
            {analysis.patterns.content_type && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Image className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Content Type</span>
                </div>
                <div className="space-y-2">
                  {analysis.patterns.content_type.map((pattern, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        {pattern.value === 'video' && <Video className="w-3 h-3" />}
                        {pattern.value === 'image' && <Image className="w-3 h-3" />}
                        {pattern.value === 'text_only' && <FileText className="w-3 h-3" />}
                        {pattern.value.replace('_', ' ')}
                      </span>
                      <span className="text-foreground font-medium">{pattern.avgEngagement.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Content Length */}
            {analysis.patterns.content_length && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Length</span>
                </div>
                <div className="space-y-2">
                  {analysis.patterns.content_length.map((pattern, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{pattern.value}</span>
                      <span className="text-foreground font-medium">{pattern.avgEngagement.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Posting Time */}
            {analysis.patterns.posting_time && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Best Time</span>
                </div>
                <div className="space-y-2">
                  {analysis.patterns.posting_time.map((pattern, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{pattern.value}</span>
                      <span className="text-foreground font-medium">{pattern.avgEngagement.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Questions */}
            {analysis.patterns.has_question && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Questions</span>
                </div>
                <div className="space-y-2">
                  {analysis.patterns.has_question.map((pattern, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {pattern.value === 'yes' ? 'With Question' : 'No Question'}
                      </span>
                      <span className="text-foreground font-medium">{pattern.avgEngagement.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Key Insights */}
      {analysis.insights && analysis.insights.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.insights.map((insight, idx) => (
                <div key={idx} className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                  <h4 className="font-medium text-foreground">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  <p className="text-sm text-primary mt-2">💡 {insight.recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Actionable Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Actionable Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{rec.action}</h4>
                    <Badge className="bg-green-500/20 text-green-400">{rec.expectedImpact}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  <p className="text-sm text-primary mt-2">🎯 {rec.target}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Top Performing Hashtags */}
      {analysis.topElements?.hashtags && analysis.topElements.hashtags.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Hash className="w-5 h-5 text-blue-400" />
              Top Performing Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {analysis.topElements.hashtags.slice(0, 10).map((hashtag, idx) => (
                <div key={idx} className="bg-muted/50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="text-foreground font-medium">{hashtag.element}</span>
                  <span className="text-xs text-muted-foreground">Used {hashtag.usage_count}x</span>
                  <Badge variant="outline" className="text-xs">
                    {Number(hashtag.avg_engagement).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
