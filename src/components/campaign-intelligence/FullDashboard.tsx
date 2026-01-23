import { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Target, Sparkles, RefreshCw, BarChart3,
  Lightbulb, CheckCircle2, AlertTriangle, Zap, Calendar, Loader2, AlertCircle
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
import { StrategyOverview } from './StrategyOverview';
import { ContentCalendarView } from './ContentCalendarView';
import { CampaignWizardModal } from './wizard/CampaignWizardModal';
import { Link } from 'react-router-dom';

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

interface FullDashboardProps {
  onNavigateToCampaignBuilder?: () => void;
}

export function CampaignIntelligenceFullDashboard({ onNavigateToCampaignBuilder }: FullDashboardProps) {
  const { user } = useAuth();
  const [niche, setNiche] = useState('ecommerce');
  const [platform, setPlatform] = useState('instagram');
  const [loading, setLoading] = useState(true);
  const [nicheRecommendations, setNicheRecommendations] = useState<any>(null);
  const [platformInsights, setPlatformInsights] = useState<any>(null);
  const [learnings, setLearnings] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [comprehensiveStrategy, setComprehensiveStrategy] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [businessProfileCompletion, setBusinessProfileCompletion] = useState(0);

  useEffect(() => {
    if (user) {
      loadData();
      loadConnectedPlatforms();
      loadBusinessProfileCompletion();
    }
  }, [user, niche, platform]);

  const loadConnectedPlatforms = () => {
    // Check localStorage for connected platforms (from social connections hook)
    const platforms: string[] = [];
    ['tiktok', 'twitter', 'facebook', 'instagram', 'linkedin'].forEach(p => {
      if (localStorage.getItem(`${p}_connected`) === 'true') {
        platforms.push(p);
      }
    });
    setConnectedPlatforms(platforms);
  };

  const loadBusinessProfileCompletion = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('business_information')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      // Calculate rough completion percentage
      const fields = [
        data.business_name, data.industry, data.business_type,
        data.unique_value_proposition, data.primary_products_services,
        (data.brand_voice_traits as string[])?.length > 0,
        (data.content_themes as string[])?.length > 0
      ];
      const filled = fields.filter(Boolean).length;
      setBusinessProfileCompletion(Math.round((filled / fields.length) * 100));
    }
  };

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

  const handleOpenWizard = () => {
    if (businessProfileCompletion < 40) {
      toast.warning('Complete your business profile for better results', {
        action: {
          label: 'Go to Settings',
          onClick: () => window.location.href = '/settings?tab=profile'
        }
      });
    }
    setShowWizard(true);
  };

  const handleWizardComplete = (strategy: any) => {
    setComprehensiveStrategy(strategy);
    setActiveTab('strategy');
    toast.success('30-day strategy generated successfully!');
  };

  const handleSchedulePost = async (post: any) => {
    if (!user) return;
    
    try {
      const scheduledTime = new Date();
      scheduledTime.setDate(scheduledTime.getDate() + post.day_number - 1);
      const [hours] = (post.post_time_recommended || '12:00 PM').split(':');
      scheduledTime.setHours(parseInt(hours) + (post.post_time_recommended?.includes('PM') ? 12 : 0), 0, 0);
      
      const { error } = await supabase.from('scheduled_posts').insert({
        user_id: user.id,
        title: post.content_hook.substring(0, 50),
        content: `${post.content_hook}\n\n${post.content_body}\n\n${post.content_cta}`,
        platforms: [platform],
        post_type: post.content_type,
        scheduled_time: scheduledTime.toISOString(),
        status: 'scheduled'
      });
      
      if (error) throw error;
      toast.success(`Day ${post.day_number} post scheduled!`);
    } catch (error) {
      console.error('Failed to schedule post:', error);
      toast.error('Failed to schedule post');
    }
  };

  const handleScheduleAll = async () => {
    if (!comprehensiveStrategy?.content_calendar) return;
    
    toast.promise(
      (async () => {
        for (const post of comprehensiveStrategy.content_calendar) {
          await handleSchedulePost(post);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      })(),
      {
        loading: 'Scheduling all 30 posts...',
        success: 'All 30 posts scheduled successfully!',
        error: 'Some posts failed to schedule'
      }
    );
  };

  const handleRegeneratePost = (dayNumber: number) => {
    toast.info(`Regenerating Day ${dayNumber} content...`);
    // In production, this would call the AI to regenerate
  };

  const handleUpdatePost = (post: any) => {
    if (!comprehensiveStrategy) return;
    
    const updatedCalendar = comprehensiveStrategy.content_calendar.map((p: any) =>
      p.day_number === post.day_number ? post : p
    );
    
    setComprehensiveStrategy({
      ...comprehensiveStrategy,
      content_calendar: updatedCalendar
    });
    
    toast.success('Post updated!');
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
      <CampaignWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleWizardComplete}
        connectedPlatforms={connectedPlatforms}
      />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Campaign Intelligence
          </h2>
          <p className="text-muted-foreground">AI-powered insights and 30-day content strategy</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
          <Button 
            onClick={handleOpenWizard}
            className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate 30-Day Strategy
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Niche Insights</TabsTrigger>
          <TabsTrigger value="platform">Platform Analysis</TabsTrigger>
          <TabsTrigger value="learnings">Past Learnings</TabsTrigger>
          <TabsTrigger value="strategy" className="relative">
            AI Strategy
            {comprehensiveStrategy && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </TabsTrigger>
          {comprehensiveStrategy && (
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-1" />
              Content Calendar
            </TabsTrigger>
          )}
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

        <TabsContent value="strategy" className="space-y-4">
          {comprehensiveStrategy ? (
            <StrategyOverview strategy={comprehensiveStrategy} />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      AI-Generated 30-Day Strategy
                    </CardTitle>
                    <CardDescription>Generate a comprehensive content strategy powered by AI</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                  {businessProfileCompletion < 40 && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg inline-flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-amber-500">
                        Complete your business profile for better results
                      </span>
                      <Button variant="link" size="sm" asChild className="text-primary p-0 h-auto">
                        <Link to="/settings?tab=profile">Edit Profile</Link>
                      </Button>
                    </div>
                  )}
                  <p className="text-muted-foreground mb-4">
                    Click below to create a comprehensive 30-day content plan
                  </p>
                  <Button 
                    onClick={handleOpenWizard}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-purple-600"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Strategy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {comprehensiveStrategy && (
          <TabsContent value="calendar" className="space-y-4">
            <ContentCalendarView
              posts={comprehensiveStrategy.content_calendar || []}
              startDate={new Date()}
              platform={platform}
              onSchedulePost={handleSchedulePost}
              onRegeneratePost={handleRegeneratePost}
              onUpdatePost={handleUpdatePost}
              onScheduleAll={handleScheduleAll}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
