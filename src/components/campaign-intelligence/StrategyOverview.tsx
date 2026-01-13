import { 
  Calendar, Target, TrendingUp, DollarSign, Users,
  BarChart3, Clock, Sparkles, Award, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WeeklyTheme {
  week: number;
  name: string;
  objective: string;
  content_types: string[];
  expected_outcome: string;
}

interface PredictedMetrics {
  impressions: number;
  engagement_rate: number;
  conversions: number;
  roi_percentage: number;
  confidence: number;
}

interface StrategyOverviewProps {
  strategy: {
    overview: {
      duration: string;
      estimated_reach: number;
      confidence_level: string;
      total_posts: number;
      investment_recommendation: string;
    };
    weekly_themes: WeeklyTheme[];
    predicted_metrics: PredictedMetrics;
    platform: string;
    niche: string;
  };
}

const WEEK_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500'
];

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  facebook: '📘',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵'
};

export function StrategyOverview({ strategy }: StrategyOverviewProps) {
  const { overview, weekly_themes, predicted_metrics, platform, niche } = strategy;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overview.duration}</p>
                <p className="text-xs text-muted-foreground">Campaign Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(overview.estimated_reach)}</p>
                <p className="text-xs text-muted-foreground">Est. Reach</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overview.total_posts}</p>
                <p className="text-xs text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <Badge className={
                  overview.confidence_level === 'High' ? 'bg-green-500' :
                  overview.confidence_level === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                }>
                  {overview.confidence_level}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform & Niche Context */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{PLATFORM_ICONS[platform] || '📱'}</div>
              <div>
                <p className="font-semibold capitalize">{platform} Campaign</p>
                <p className="text-sm text-muted-foreground capitalize">{niche?.replace(/_/g, ' ')} Industry</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Investment Recommendation</p>
              <p className="font-medium">{overview.investment_recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Themes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Weekly Themes
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          {weekly_themes.map((week, idx) => (
            <Card key={week.week} className="overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${WEEK_COLORS[idx] || WEEK_COLORS[0]}`} />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Week {week.week}</span>
                  <Badge variant="outline" className="text-xs">
                    Days {(week.week - 1) * 7 + 1}-{Math.min(week.week * 7, 30)}
                  </Badge>
                </CardTitle>
                <CardDescription className="font-medium text-foreground">
                  {week.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Objective</p>
                  <p className="text-sm">{week.objective}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Content Types</p>
                  <div className="flex flex-wrap gap-1">
                    {week.content_types.map(type => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Expected Outcome</p>
                  <p className="text-sm text-primary">{week.expected_outcome}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Predicted Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Success Metrics Prediction
          </CardTitle>
          <CardDescription>
            AI-predicted performance based on your profile and industry benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Impressions</span>
                <span className="font-bold text-lg">{formatNumber(predicted_metrics.impressions)}</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Engagement Rate</span>
                <span className="font-bold text-lg">{predicted_metrics.engagement_rate}%</span>
              </div>
              <Progress value={predicted_metrics.engagement_rate * 10} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Conversions</span>
                <span className="font-bold text-lg">{formatNumber(predicted_metrics.conversions)}</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expected ROI</span>
                <span className="font-bold text-lg text-green-500">+{predicted_metrics.roi_percentage}%</span>
              </div>
              <Progress value={predicted_metrics.roi_percentage} className="h-2" />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <p className="text-sm text-muted-foreground">
              Prediction confidence: <span className="font-medium text-foreground">{predicted_metrics.confidence}%</span> based on {platform} industry benchmarks and your historical performance
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}