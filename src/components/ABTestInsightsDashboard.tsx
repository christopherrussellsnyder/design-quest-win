import { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Trophy, BarChart3, Clock, Zap, 
  Target, Lightbulb, ChevronRight, Sparkles, RefreshCw,
  AlertTriangle, CheckCircle2, PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface PatternInsight {
  type: string;
  value: string;
  wins: number;
  total: number;
  winRate: string;
}

interface Recommendation {
  variable: string;
  reason: string;
  potentialImpact: string;
}

interface ContentVariation {
  name: string;
  description: string;
  template: string;
}

interface PlatformInsight {
  optimalPostingTimes: string[];
  contentLength: string;
  mediaRecommendation: string;
}

interface Insights {
  totalTests: number;
  winRate: number;
  topPatterns: PatternInsight[];
  platformComparison: { platform: string; avgEngagement: string }[];
  contentTypePerformance: { type: string; avgEngagement: string }[];
  optimalTimings: { bestTimes: string[]; bestDays: number[] };
  testTypeSuggestions: { variable: string; reason: string }[];
}

interface Recommendations {
  recommendedVariables: Recommendation[];
  contentVariations: ContentVariation[];
  bestPractices: string[];
  successProbability: number;
  sampleSize: number;
  platformInsights: PlatformInsight;
}

interface Prediction {
  predictedWinner: string | null;
  confidence: number;
  confidenceLevel: string;
  factors: string[];
  estimatedTimeToSignificance: string;
}

export function ABTestInsightsDashboard() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState('twitter');
  const [insights, setInsights] = useState<Insights | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user, platform]);

  const loadInsights = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ab-test-optimization', {
        body: { action: 'get_insights', platform }
      });
      if (error) throw error;
      setInsights(data?.insights || null);
    } catch (error) {
      console.error('Failed to load insights:', error);
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    if (!user) return;
    setLoadingRecommendations(true);
    try {
      const { data, error } = await supabase.functions.invoke('ab-test-optimization', {
        body: { action: 'get_recommendations', platform }
      });
      if (error) throw error;
      setRecommendations(data?.recommendations || null);
      toast.success('Recommendations generated!');
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || '';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Test Insights Dashboard
          </h2>
          <p className="text-muted-foreground">
            Intelligence analysis of your A/B testing performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadInsights}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Tests</p>
                <p className="text-2xl font-bold">{insights?.totalTests || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Win Rate</p>
                <p className="text-2xl font-bold">{(insights?.winRate || 0).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Top Patterns</p>
                <p className="text-2xl font-bold">{insights?.topPatterns?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Platforms</p>
                <p className="text-2xl font-bold">{insights?.platformComparison?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patterns">Winning Patterns</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="platforms">Platform Insights</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Performing Patterns
              </CardTitle>
              <CardDescription>
                Patterns with the highest win rates from your A/B tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights?.topPatterns && insights.topPatterns.length > 0 ? (
                <div className="space-y-4">
                  {insights.topPatterns.map((pattern, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          idx === 0 ? 'bg-yellow-500 text-yellow-950' :
                          idx === 1 ? 'bg-gray-400 text-gray-900' :
                          idx === 2 ? 'bg-orange-600 text-orange-950' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{pattern.type}: {pattern.value}</p>
                          <p className="text-muted-foreground text-sm">
                            {pattern.wins} wins / {pattern.total} tests
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-500">{pattern.winRate}%</p>
                        <p className="text-muted-foreground text-sm">Win Rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No patterns discovered yet.</p>
                  <p className="text-sm">Complete more A/B tests to see winning patterns.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Type Suggestions */}
          {insights?.testTypeSuggestions && insights.testTypeSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Under-Tested Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {insights.testTypeSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-semibold capitalize">{suggestion.variable}</p>
                        <p className="text-muted-foreground text-sm">{suggestion.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Intelligence Recommendations
                  </CardTitle>
                  <CardDescription>
                    Get personalized test suggestions based on your historical data
                  </CardDescription>
                </div>
                <Button onClick={getRecommendations} disabled={loadingRecommendations}>
                  {loadingRecommendations ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Recommendations
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recommendations ? (
                <div className="space-y-6">
                  {/* Success Probability */}
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Predicted Success Rate</span>
                      <span className="text-2xl font-bold text-green-500">
                        {(recommendations.successProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={recommendations.successProbability * 100} className="h-2" />
                    <p className="text-muted-foreground text-sm mt-2">
                      Recommended sample size: {recommendations.sampleSize} posts per variant
                    </p>
                  </div>

                  {/* Recommended Variables */}
                  <div>
                    <h3 className="font-semibold mb-3">Recommended Test Variables</h3>
                    <div className="space-y-2">
                      {recommendations.recommendedVariables.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                          <Zap className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">{rec.variable}</p>
                              <Badge variant="outline" className="text-green-500">
                                {rec.potentialImpact}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">{rec.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Variations */}
                  <div>
                    <h3 className="font-semibold mb-3">Suggested Content Variations</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {recommendations.contentVariations.map((variation, idx) => (
                        <div key={idx} className="p-4 rounded-lg border">
                          <p className="font-semibold mb-1">{variation.name}</p>
                          <p className="text-muted-foreground text-sm mb-2">{variation.description}</p>
                          <code className="text-xs bg-muted p-2 rounded block">{variation.template}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Platform Insights */}
                  {recommendations.platformInsights && (
                    <div>
                      <h3 className="font-semibold mb-3 capitalize">{platform} Best Practices</h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <Clock className="w-5 h-5 text-blue-500 mb-2" />
                          <p className="text-sm text-muted-foreground">Optimal Times</p>
                          <p className="font-semibold">
                            {recommendations.platformInsights.optimalPostingTimes?.join(', ')}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <BarChart3 className="w-5 h-5 text-green-500 mb-2" />
                          <p className="text-sm text-muted-foreground">Content Length</p>
                          <p className="font-semibold">{recommendations.platformInsights.contentLength}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <Target className="w-5 h-5 text-purple-500 mb-2" />
                          <p className="text-sm text-muted-foreground">Media Tip</p>
                          <p className="font-semibold">{recommendations.platformInsights.mediaRecommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Best Practices */}
                  <div>
                    <h3 className="font-semibold mb-3">Best Practices</h3>
                    <div className="space-y-2">
                      {recommendations.bestPractices.map((practice, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>{practice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click "Generate Recommendations" to get AI-powered suggestions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Platform Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights?.platformComparison && insights.platformComparison.length > 0 ? (
                <div className="space-y-4">
                  {insights.platformComparison.map((platform, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">{platform.platform}</Badge>
                      </div>
                      <div className="flex-1 mx-4">
                        <Progress value={parseFloat(platform.avgEngagement) * 10} className="h-2" />
                      </div>
                      <span className="font-bold">{platform.avgEngagement}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No platform data available yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optimal Timings */}
          {insights?.optimalTimings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Optimal Posting Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Best Times</h4>
                    {insights.optimalTimings.bestTimes?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {insights.optimalTimings.bestTimes.map((time, idx) => (
                          <Badge key={idx} variant="secondary">{time}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Not enough data</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Best Days</h4>
                    {insights.optimalTimings.bestDays?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {insights.optimalTimings.bestDays.map((day, idx) => (
                          <Badge key={idx} variant="secondary">{getDayName(day)}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Not enough data</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Content Type Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights?.contentTypePerformance && insights.contentTypePerformance.length > 0 ? (
                <div className="space-y-4">
                  {insights.contentTypePerformance.map((content, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          idx === 0 ? 'bg-green-500/20 text-green-500' :
                          idx === 1 ? 'bg-blue-500/20 text-blue-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="font-semibold capitalize">{content.type}</span>
                      </div>
                      <div className="flex-1 mx-4">
                        <Progress value={parseFloat(content.avgEngagement) * 10} className="h-2" />
                      </div>
                      <span className="font-bold">{content.avgEngagement}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No content performance data available yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}