import React from 'react';
import { 
  Calendar, Target, TrendingUp, Users, Eye, Heart,
  Download, FileText, Table, Edit, RefreshCw, ExternalLink,
  Instagram, Linkedin, Twitter, Facebook, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StrategyOverview } from '@/hooks/useStrategyGeneration';
import { format } from 'date-fns';

interface StrategyOverviewCardProps {
  strategy: StrategyOverview;
  postsCount: number;
  onViewCalendar?: () => void;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  onEdit?: () => void;
  onRegenerate?: () => void;
  compact?: boolean;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  facebook: <Facebook className="w-5 h-5" />,
  tiktok: <Video className="w-5 h-5" />,
};

const platformColors: Record<string, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  linkedin: 'bg-blue-600',
  twitter: 'bg-sky-500',
  facebook: 'bg-blue-500',
  tiktok: 'bg-black',
};

export function StrategyOverviewCard({
  strategy,
  postsCount,
  onViewCalendar,
  onExportPDF,
  onExportCSV,
  onEdit,
  onRegenerate,
  compact = false,
}: StrategyOverviewCardProps) {
  const contentMix = strategy.content_mix || {};
  const predictedMetrics = strategy.predicted_metrics || {
    total_reach: 0,
    avg_engagement_rate: 0,
    expected_follower_growth: 0,
  };
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  if (compact) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${platformColors[strategy.platform] || 'bg-primary'} text-white`}>
              {platformIcons[strategy.platform] || <Calendar className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{strategy.title}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(strategy.start_date)} - {formatDate(strategy.end_date)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{postsCount} posts</Badge>
                <Badge variant="outline">{strategy.duration_days} days</Badge>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={onViewCalendar}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className={`${platformColors[strategy.platform] || 'bg-primary'} text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {platformIcons[strategy.platform] || <Calendar className="w-6 h-6" />}
            <div>
              <CardTitle className="text-xl">{strategy.title}</CardTitle>
              <p className="text-white/80 text-sm mt-1">
                {formatDate(strategy.start_date)} - {formatDate(strategy.end_date)}
              </p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            {postsCount} posts
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Predicted Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <Eye className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {(predictedMetrics.total_reach || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Predicted Reach</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <Heart className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {predictedMetrics.avg_engagement_rate || 0}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Engagement</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              +{(predictedMetrics.expected_follower_growth || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Follower Growth</p>
          </div>
        </div>

        {/* Goals */}
        {strategy.goals && strategy.goals.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Goals
            </h4>
            <div className="flex flex-wrap gap-2">
              {strategy.goals.map((goal, i) => (
                <Badge key={i} variant="outline">{goal}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Content Mix */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Content Mix
          </h4>
          <div className="space-y-3">
            {Object.entries(contentMix).map(([type, percentage]) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground capitalize">{type.replace('_', ' ')}</span>
                  <span className="font-medium text-foreground">{percentage}%</span>
                </div>
                <Progress value={percentage as number} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {onViewCalendar && (
            <Button onClick={onViewCalendar} className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              View Calendar
            </Button>
          )}
          {onExportPDF && (
            <Button variant="outline" size="icon" onClick={onExportPDF} title="Export PDF">
              <FileText className="w-4 h-4" />
            </Button>
          )}
          {onExportCSV && (
            <Button variant="outline" size="icon" onClick={onExportCSV} title="Export CSV">
              <Table className="w-4 h-4" />
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="icon" onClick={onEdit} title="Edit Strategy">
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onRegenerate && (
            <Button variant="outline" size="icon" onClick={onRegenerate} title="Regenerate">
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
