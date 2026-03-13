import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Facebook,
  Linkedin,
  Twitter,
  Music2,
  Copy,
  Check,
  TrendingUp,
  Target,
  Users,
  Loader2,
  RefreshCw,
  Download,
  ChevronRight,
  AlertCircle,
  Award,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import BusinessProfileWizard from "./BusinessProfileWizard";

interface TargetingRecommendation {
  facebook_instagram: {
    detailed_targeting: {
      interests: string[];
      behaviors: string[];
      demographics: string[];
    };
    age_range: { min: number; max: number };
    locations: string[];
    device_types: string[];
    custom_audiences: string[];
    lookalike_suggestions: string[];
    targeting_string: string;
  };
  linkedin: {
    job_titles: string[];
    industries: string[];
    company_sizes: string[];
    seniority_levels: string[];
    skills: string[];
    groups: string[];
    targeting_string: string;
  };
  twitter: {
    keywords: string[];
    hashtags: string[];
    interests: string[];
    follower_lookalikes: string[];
    conversation_topics: string[];
    targeting_string: string;
  };
  tiktok: {
    content_categories: string[];
    hashtag_strategy: string[];
    trending_topics: string[];
    creator_types: string[];
    targeting_string: string;
  };
  overall_strategy: {
    primary_platform: string;
    secondary_platforms: string[];
    budget_allocation: Record<string, string>;
    key_insights: string[];
    testing_recommendations: string[];
  };
}

interface BusinessProfile {
  business_name: string;
  industry: string;
  niche: string;
  target_age_min: number;
  target_age_max: number;
  target_genders: string[];
  target_locations: string[];
  target_interests: string[];
  business_goals: string[];
  average_order_value: number;
  price_point: string;
  products_services: string;
  unique_selling_points: string[];
  competitor_names: string[];
}

interface TopPerformer {
  platform: string;
  targeting_parameters: any;
  engagement_rate: number;
  conversions: number;
  roas: number;
}

export default function SmartTargetingAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [recommendations, setRecommendations] = useState<TargetingRecommendation | null>(null);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load business profile
      const { data: profileData } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setBusinessProfile(profileData as unknown as BusinessProfile);
      }

      // Load existing insights
      const { data: insightsData } = await supabase
        .from('audience_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('insight_type', 'targeting_recommendation')
        .order('analysis_date', { ascending: false });

      if (insightsData && insightsData.length > 0) {
        // Reconstruct recommendations from stored insights
        const storedRecs: any = {
          facebook_instagram: null,
          linkedin: null,
          twitter: null,
          tiktok: null,
          overall_strategy: null,
        };

        insightsData.forEach((insight: any) => {
          if (insight.platform === 'facebook') {
            storedRecs.facebook_instagram = insight.targeting_parameters;
          } else if (insight.platform === 'linkedin') {
            storedRecs.linkedin = insight.targeting_parameters;
          } else if (insight.platform === 'twitter') {
            storedRecs.twitter = insight.targeting_parameters;
          } else if (insight.platform === 'tiktok') {
            storedRecs.tiktok = insight.targeting_parameters;
          }
        });

        if (storedRecs.facebook_instagram) {
          setRecommendations(storedRecs as TargetingRecommendation);
        }
      }

      // Load top performers
      const { data: performersData } = await supabase
        .from('audience_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_top_performer', true)
        .order('return_on_ad_spend', { ascending: false })
        .limit(5);

      if (performersData) {
        setTopPerformers(performersData.map((p: any) => ({
          platform: p.platform,
          targeting_parameters: p.targeting_parameters,
          engagement_rate: p.engagements > 0 && p.impressions > 0 ? (p.engagements / p.impressions) * 100 : 0,
          conversions: p.conversions || 0,
          roas: p.return_on_ad_spend || 0,
        })));
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (profile: BusinessProfile) => {
    if (!user) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-audience-targeting', {
        body: { businessProfile: profile }
      });

      if (error) throw error;

      if (data.recommendations) {
        setRecommendations(data.recommendations);
        toast({
          title: "Recommendations generated",
          description: "Your intelligence-driven targeting recommendations are ready!",
        });
      }

      setBusinessProfile(profile);
      setShowWizard(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: "Copied!",
      description: "Targeting parameters copied to clipboard",
    });
  };

  const exportToCSV = () => {
    if (!recommendations) return;

    const csvContent = [
      ['Platform', 'Targeting Type', 'Values'],
      ['Facebook/Instagram', 'Interests', recommendations.facebook_instagram?.detailed_targeting?.interests?.join('; ')],
      ['Facebook/Instagram', 'Behaviors', recommendations.facebook_instagram?.detailed_targeting?.behaviors?.join('; ')],
      ['Facebook/Instagram', 'Age Range', `${recommendations.facebook_instagram?.age_range?.min}-${recommendations.facebook_instagram?.age_range?.max}`],
      ['LinkedIn', 'Job Titles', recommendations.linkedin?.job_titles?.join('; ')],
      ['LinkedIn', 'Industries', recommendations.linkedin?.industries?.join('; ')],
      ['LinkedIn', 'Company Sizes', recommendations.linkedin?.company_sizes?.join('; ')],
      ['Twitter', 'Keywords', recommendations.twitter?.keywords?.join('; ')],
      ['Twitter', 'Hashtags', recommendations.twitter?.hashtags?.join('; ')],
      ['TikTok', 'Content Categories', recommendations.tiktok?.content_categories?.join('; ')],
      ['TikTok', 'Hashtags', recommendations.tiktok?.hashtag_strategy?.join('; ')],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'targeting-recommendations.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Targeting recommendations exported to CSV",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!businessProfile || showWizard) {
    return (
      <BusinessProfileWizard
        onComplete={generateRecommendations}
        existingProfile={businessProfile}
      />
    );
  }

  const PlatformCard = ({ 
    platform, 
    icon: Icon, 
    color, 
    data,
    fields 
  }: { 
    platform: string; 
    icon: any; 
    color: string;
    data: any;
    fields: { label: string; key: string; type: 'array' | 'string' | 'object' }[];
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg">{platform}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(data?.targeting_string || '', platform)}
          >
            {copiedField === platform ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map(field => {
          const value = data?.[field.key];
          if (!value) return null;

          if (field.type === 'array' && Array.isArray(value)) {
            return (
              <div key={field.key}>
                <p className="text-sm font-medium text-muted-foreground mb-2">{field.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {value.map((item: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          }

          if (field.type === 'object' && typeof value === 'object') {
            return (
              <div key={field.key}>
                <p className="text-sm font-medium text-muted-foreground mb-2">{field.label}</p>
                <p className="text-sm">{value.min}-{value.max} years</p>
              </div>
            );
          }

          return (
            <div key={field.key}>
              <p className="text-sm font-medium text-muted-foreground mb-1">{field.label}</p>
              <p className="text-sm">{value}</p>
            </div>
          );
        })}

        {data?.targeting_string && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">Copy-Paste Ready</p>
            <div className="bg-muted p-3 rounded-lg text-sm font-mono">
              {data.targeting_string}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Smart Targeting Assistant
          </h2>
          <p className="text-muted-foreground mt-1">
            Intelligence-driven audience targeting recommendations for {businessProfile.business_name || 'your business'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowWizard(true)}>
            Edit Profile
          </Button>
          <Button variant="outline" onClick={exportToCSV} disabled={!recommendations}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => generateRecommendations(businessProfile)} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Strategy Overview */}
      {recommendations?.overall_strategy && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Strategy Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Primary Platform</p>
              <Badge className="text-sm">{recommendations.overall_strategy.primary_platform}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Budget Allocation</p>
              <div className="space-y-1">
                {Object.entries(recommendations.overall_strategy.budget_allocation || {}).map(([platform, percentage]) => (
                  <div key={platform} className="flex justify-between text-sm">
                    <span>{platform}</span>
                    <span className="font-medium">{percentage}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Key Insights</p>
              <ul className="space-y-1">
                {recommendations.overall_strategy.key_insights?.slice(0, 3).map((insight, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Tabs */}
      <Tabs defaultValue="facebook" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="facebook" className="gap-2">
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">Meta</span>
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="gap-2">
            <Linkedin className="h-4 w-4" />
            <span className="hidden sm:inline">LinkedIn</span>
          </TabsTrigger>
          <TabsTrigger value="twitter" className="gap-2">
            <Twitter className="h-4 w-4" />
            <span className="hidden sm:inline">Twitter</span>
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="gap-2">
            <Music2 className="h-4 w-4" />
            <span className="hidden sm:inline">TikTok</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facebook">
          <PlatformCard
            platform="Facebook & Instagram"
            icon={Facebook}
            color="bg-blue-600"
            data={recommendations?.facebook_instagram}
            fields={[
              { label: 'Interests', key: 'detailed_targeting.interests', type: 'array' },
              { label: 'Behaviors', key: 'detailed_targeting.behaviors', type: 'array' },
              { label: 'Demographics', key: 'detailed_targeting.demographics', type: 'array' },
              { label: 'Age Range', key: 'age_range', type: 'object' },
              { label: 'Locations', key: 'locations', type: 'array' },
              { label: 'Device Types', key: 'device_types', type: 'array' },
              { label: 'Custom Audiences', key: 'custom_audiences', type: 'array' },
              { label: 'Lookalike Suggestions', key: 'lookalike_suggestions', type: 'array' },
            ]}
          />
        </TabsContent>

        <TabsContent value="linkedin">
          <PlatformCard
            platform="LinkedIn"
            icon={Linkedin}
            color="bg-blue-700"
            data={recommendations?.linkedin}
            fields={[
              { label: 'Job Titles', key: 'job_titles', type: 'array' },
              { label: 'Industries', key: 'industries', type: 'array' },
              { label: 'Company Sizes', key: 'company_sizes', type: 'array' },
              { label: 'Seniority Levels', key: 'seniority_levels', type: 'array' },
              { label: 'Skills', key: 'skills', type: 'array' },
              { label: 'Groups', key: 'groups', type: 'array' },
            ]}
          />
        </TabsContent>

        <TabsContent value="twitter">
          <PlatformCard
            platform="Twitter / X"
            icon={Twitter}
            color="bg-sky-500"
            data={recommendations?.twitter}
            fields={[
              { label: 'Keywords', key: 'keywords', type: 'array' },
              { label: 'Hashtags', key: 'hashtags', type: 'array' },
              { label: 'Interests', key: 'interests', type: 'array' },
              { label: 'Follower Lookalikes', key: 'follower_lookalikes', type: 'array' },
              { label: 'Conversation Topics', key: 'conversation_topics', type: 'array' },
            ]}
          />
        </TabsContent>

        <TabsContent value="tiktok">
          <PlatformCard
            platform="TikTok"
            icon={Music2}
            color="bg-pink-600"
            data={recommendations?.tiktok}
            fields={[
              { label: 'Content Categories', key: 'content_categories', type: 'array' },
              { label: 'Hashtag Strategy', key: 'hashtag_strategy', type: 'array' },
              { label: 'Trending Topics', key: 'trending_topics', type: 'array' },
              { label: 'Creator Types', key: 'creator_types', type: 'array' },
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performing Audiences
            </CardTitle>
            <CardDescription>Based on your campaign history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((performer, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{performer.platform}</Badge>
                    <span className="text-sm">
                      {JSON.stringify(performer.targeting_parameters).slice(0, 50)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      <TrendingUp className="h-4 w-4 inline mr-1 text-green-500" />
                      {performer.engagement_rate.toFixed(1)}% engagement
                    </span>
                    <span className="text-muted-foreground">
                      {performer.conversions} conversions
                    </span>
                    <span className="font-medium text-green-500">
                      {performer.roas.toFixed(1)}x ROAS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing Recommendations */}
      {recommendations?.overall_strategy?.testing_recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              A/B Testing Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {recommendations.overall_strategy.testing_recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm">{rec}</p>
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