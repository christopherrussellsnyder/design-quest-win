import { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Target, Sparkles, RefreshCw, BarChart3,
  Lightbulb, CheckCircle2, AlertTriangle, Zap
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

const niches = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'local_business', label: 'Local Business' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'real_estate', label: 'Real Estate' }
];

const platforms = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' }
];

export function CampaignIntelligenceDashboard() {
  const { user } = useAuth();
  const [niche, setNiche] = useState('ecommerce');
  const [platform, setPlatform] = useState('instagram');
  const [loading, setLoading] = useState(true);
  const [nicheRecommendations, setNicheRecommendations] = useState<any>(null);
  const [platformInsights, setPlatformInsights] = useState<any>(null);
  const [learnings, setLearnings] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<any>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user, niche, platform]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [nicheRes, platformRes, learningsRes] = await Promise.all([
        supabase.functions.invoke('campaign-intelligence', {
          body: { userId: user.id, action: 'get_niche_recommendations', campaignData: { niche } }
        }),
        supabase.functions.invoke('campaign-intelligence', {
          body: { userId: user.id, action: 'get_platform_insights', campaignData: { platform, niche } }
        }),
        supabase.functions.invoke('campaign-intelligence', {
          body: { userId: user.id, action: 'get_campaign_learnings', campaignData: {} }
        })
      ]);

      if (nicheRes.data?.recommendations) setNicheRecommendations(nicheRes.data.recommendations);
      if (platformRes.data?.insights) setPlatformInsights(platformRes.data.insights);
      if (learningsRes.data) setLearnings(learningsRes.data);
    } catch (error) {
      console.error('Failed to load intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIStrategy = async () => {
    if (!user) return;
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('campaign-intelligence', {
        body: {
          userId: user.id,
          action: 'generate_ai_strategy',
          campaignData: { platform, niche, objective: 'engagement', duration: 30 }
        }
      });
      if (error) throw error;
      setAiStrategy(data?.strategy);
      toast.success('Intelligence strategy generated!');
    } catch (error) {
      toast.error('Failed to generate strategy');
    } finally {
      setLoadingAI(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Campaign Intelligence
          </h2>
          <p className="text-muted-foreground">Intelligence insights for your campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={niche} onValueChange={setNiche}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {niches.map(n => (
                <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {platforms.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.icon} {p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Niche Insights</TabsTrigger>
          <TabsTrigger value="platform">Platform Analysis</TabsTrigger>
          <TabsTrigger value="learnings">Past Learnings</TabsTrigger>
          <TabsTrigger value="ai-strategy">Intelligence Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {nicheRecommendations?.topPlatforms && (
            <div className="grid md:grid-cols-3 gap-4">
              {nicheRecommendations.topPlatforms.map((p: any, idx: number) => (
                <Card key={p.platform} className={idx === 0 ? 'border-primary' : ''}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {platforms.find(pl => pl.value === p.platform)?.icon} {p.platform}
                      {idx === 0 && <Badge className="bg-primary">Top Pick</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{p.frequency}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.contentTypes?.slice(0, 3).map((ct: string) => (
                        <Badge key={ct} variant="outline" className="text-xs">{ct}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {nicheRecommendations?.nicheSpecificTips && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  {niches.find(n => n.value === niche)?.label} Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {nicheRecommendations.nicheSpecificTips.map((tip: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="platform" className="space-y-4">
          {platformInsights && (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-sm">Avg Engagement Rate</p>
                    <p className="text-2xl font-bold">{platformInsights.benchmarks?.avgEngagementRate || 0}%</p>
                    <p className="text-xs text-muted-foreground">Industry benchmark</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-sm">Your Performance</p>
                    <p className="text-2xl font-bold">{platformInsights.userPerformance?.avgEngagementRate?.toFixed(1) || 0}%</p>
                    <Badge className={platformInsights.vsIndustry?.isAboveAverage ? 'bg-green-500' : 'bg-amber-500'}>
                      {platformInsights.vsIndustry?.isAboveAverage ? 'Above Average' : 'Below Average'}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-sm">Top Content Type</p>
                    <p className="text-2xl font-bold capitalize">{platformInsights.recommendedContentTypes?.[0] || 'Video'}</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {platformInsights.recommendations?.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="learnings" className="space-y-4">
          {learnings?.insights?.length > 0 ? (
            learnings.insights.map((insight: any, idx: number) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {insight.type === 'success' && <TrendingUp className="w-5 h-5 text-green-500" />}
                    {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insight.patterns ? (
                    <div className="space-y-2">
                      {insight.patterns.map((p: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="capitalize">{p.type}: {p.value}</span>
                          <Badge className={p.impact.startsWith('+') ? 'bg-green-500' : 'bg-red-500'}>
                            {p.impact}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Complete more campaigns to see learnings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Intelligence-Generated Campaign Strategy
                  </CardTitle>
                  <CardDescription>Get personalized recommendations powered by Korex Intelligence</CardDescription>
                </div>
                <Button onClick={generateAIStrategy} disabled={loadingAI}>
                  {loadingAI ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                  Generate Strategy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {aiStrategy ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-bold">{aiStrategy.overview?.duration}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Est. Reach</p>
                      <p className="font-bold">{aiStrategy.overview?.estimatedReach?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <Badge>{aiStrategy.overview?.confidenceLevel}</Badge>
                    </div>
                  </div>
                  {aiStrategy.keyActions && (
                    <div>
                      <h4 className="font-semibold mb-3">Key Actions</h4>
                      <div className="space-y-2">
                        {aiStrategy.keyActions.map((action: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{action.action}</p>
                              <Badge variant="outline">{action.priority} priority</Badge>
                            </div>
                            <Badge className="bg-green-500">{action.expectedImpact}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click "Generate Strategy" to get AI-powered campaign recommendations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}