import { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, Users, DollarSign, Eye,
  ChevronRight, Loader2, RefreshCw, Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface PlatformRecommendation {
  platform: string;
  priority: 'primary' | 'secondary' | 'testing';
  score: number;
  rationale: string;
  audience_size: string;
  avg_engagement: string;
  cost_range: string;
  best_content_types: string[];
  expected_cpa: string;
  conversion_rate: string;
  next_steps: string[];
}

interface PlatformRecommendationsProps {
  businessProfile: any;
  onSelectPlatform: (platform: string) => void;
}

const PLATFORM_INFO: Record<string, { icon: string; color: string; name: string }> = {
  instagram: { icon: '📸', color: 'from-pink-500 to-purple-500', name: 'Instagram' },
  facebook: { icon: '📘', color: 'from-blue-500 to-blue-600', name: 'Facebook' },
  twitter: { icon: '🐦', color: 'from-cyan-400 to-blue-500', name: 'Twitter/X' },
  linkedin: { icon: '💼', color: 'from-blue-600 to-blue-700', name: 'LinkedIn' },
  tiktok: { icon: '🎵', color: 'from-pink-500 to-cyan-500', name: 'TikTok' },
  youtube: { icon: '📺', color: 'from-red-500 to-red-600', name: 'YouTube' },
  pinterest: { icon: '📌', color: 'from-red-500 to-rose-500', name: 'Pinterest' }
};

export function PlatformRecommendations({ businessProfile, onSelectPlatform }: PlatformRecommendationsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<PlatformRecommendation[]>([]);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  useEffect(() => {
    if (businessProfile) {
      loadRecommendations();
    }
  }, [businessProfile]);

  const loadRecommendations = async () => {
    if (!user || !businessProfile) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('campaign-intelligence', {
        body: {
          userId: user.id,
          action: 'analyze_optimal_platforms',
          campaignData: {
            businessProfile,
            goals: businessProfile.business_goals,
            budget: businessProfile.monthly_marketing_budget
          }
        }
      });

      if (error) throw error;
      setRecommendations(data?.recommendations || generateFallbackRecommendations());
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations(generateFallbackRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackRecommendations = (): PlatformRecommendation[] => {
    const niche = businessProfile?.industry_niche || 'general';
    const goals = businessProfile?.business_goals || [];
    
    // Smart defaults based on niche
    const nicheDefaults: Record<string, string[]> = {
      saas: ['linkedin', 'twitter', 'youtube'],
      ecommerce: ['instagram', 'facebook', 'tiktok'],
      'e-commerce': ['instagram', 'facebook', 'tiktok'],
      local_business: ['facebook', 'instagram'],
      consulting: ['linkedin', 'twitter'],
      fitness: ['instagram', 'tiktok', 'youtube'],
      education: ['youtube', 'linkedin', 'instagram'],
      healthcare: ['facebook', 'linkedin', 'youtube'],
      finance: ['linkedin', 'twitter', 'youtube'],
      real_estate: ['instagram', 'facebook', 'youtube']
    };

    const platformPriorities = nicheDefaults[niche.toLowerCase()] || ['instagram', 'facebook', 'linkedin'];
    
    return platformPriorities.map((platform, idx) => ({
      platform,
      priority: idx === 0 ? 'primary' : idx === 1 ? 'secondary' : 'testing',
      score: 95 - (idx * 10),
      rationale: `${PLATFORM_INFO[platform]?.name} is highly effective for ${niche} businesses looking to achieve ${goals[0] || 'growth'}.`,
      audience_size: idx === 0 ? '1B+ users' : '500M+ users',
      avg_engagement: `${(3.5 - idx * 0.5).toFixed(1)}%`,
      cost_range: `$${5 + idx * 3} - $${15 + idx * 5} CPM`,
      best_content_types: ['Video', 'Carousel', 'Stories'],
      expected_cpa: `$${10 + idx * 5}`,
      conversion_rate: `${(2.5 - idx * 0.3).toFixed(1)}%`,
      next_steps: [
        'Set up business profile',
        'Create content calendar',
        'Define target audience'
      ]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Recommended Platforms
          </h3>
          <p className="text-sm text-muted-foreground">
            Based on your {businessProfile?.industry_niche?.replace(/_/g, ' ')} business profile
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadRecommendations}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {recommendations.map((rec, idx) => {
          const info = PLATFORM_INFO[rec.platform] || { icon: '📱', color: 'from-gray-500 to-gray-600', name: rec.platform };
          const isExpanded = expandedPlatform === rec.platform;
          
          return (
            <Card 
              key={rec.platform}
              className={`overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                idx === 0 ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setExpandedPlatform(isExpanded ? null : rec.platform)}
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${info.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <p className="font-semibold">{info.name}</p>
                      <Badge 
                        className={`text-xs ${
                          rec.priority === 'primary' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-white/10 text-white/80'
                        }`}
                      >
                        {rec.priority === 'primary' ? '🥇 Primary' : 
                         rec.priority === 'secondary' ? '🥈 Secondary' : '🧪 Testing'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{rec.score}</p>
                    <p className="text-xs opacity-80">Match Score</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {rec.rationale}
                </p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span>{rec.audience_size}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <span>{rec.avg_engagement} eng.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-muted-foreground" />
                    <span>{rec.cost_range}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-muted-foreground" />
                    <span>{rec.conversion_rate} CVR</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Best Content Types</p>
                      <div className="flex flex-wrap gap-1">
                        {rec.best_content_types.map(type => (
                          <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Next Steps</p>
                      <ul className="text-xs space-y-1">
                        {rec.next_steps.map((step, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 text-primary" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  variant={idx === 0 ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlatform(rec.platform);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Strategy
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}