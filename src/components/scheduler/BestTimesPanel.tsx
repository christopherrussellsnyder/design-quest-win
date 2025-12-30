import { useState, useEffect } from 'react';
import { X, Lightbulb, ChevronDown, ChevronUp, Clock, TrendingUp, Zap, Facebook, Instagram, Twitter, Linkedin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ScheduleHeatMap } from './ScheduleHeatMap';

interface BestTimeSlot {
  day: string;
  time: string;
  score: number;
  label: string;
}

interface PlatformBestTimes {
  platform: string;
  icon: React.ReactNode;
  color: string;
  bestTimes: BestTimeSlot[];
  description: string;
}

interface BestTimesPanelProps {
  onClose: () => void;
  onScheduleAtTime: (platform: string, day: string, time: string) => void;
}

// Static platform best times data as fallback
const staticPlatformBestTimes: PlatformBestTimes[] = [
  {
    platform: 'facebook',
    icon: <Facebook className="w-5 h-5" />,
    color: 'text-blue-500',
    bestTimes: [
      { day: 'Tuesday', time: '2:00 PM', score: 9.2, label: 'Highest engagement period' },
      { day: 'Wednesday', time: '1:00 PM', score: 8.7, label: 'Strong engagement window' },
      { day: 'Friday', time: '3:00 PM', score: 8.3, label: 'Good engagement potential' },
    ],
    description: 'Your audience is most active during weekday afternoons, especially around lunch breaks.',
  },
  {
    platform: 'instagram',
    icon: <Instagram className="w-5 h-5" />,
    color: 'text-pink-500',
    bestTimes: [
      { day: 'Wednesday', time: '6:00 PM', score: 9.5, label: 'Peak evening engagement' },
      { day: 'Friday', time: '7:00 PM', score: 9.1, label: 'High weekend kickoff activity' },
      { day: 'Saturday', time: '11:00 AM', score: 8.8, label: 'Weekend browsing time' },
    ],
    description: 'Evening hours and weekends see the highest engagement for visual content.',
  },
  {
    platform: 'twitter',
    icon: <Twitter className="w-5 h-5" />,
    color: 'text-sky-500',
    bestTimes: [
      { day: 'Monday', time: '9:00 AM', score: 8.9, label: 'Start of week engagement' },
      { day: 'Wednesday', time: '12:00 PM', score: 8.6, label: 'Lunch break scrolling' },
      { day: 'Thursday', time: '10:00 AM', score: 8.4, label: 'Mid-morning activity' },
    ],
    description: 'Mornings and lunch hours on weekdays drive the most engagement for real-time updates.',
  },
  {
    platform: 'linkedin',
    icon: <Linkedin className="w-5 h-5" />,
    color: 'text-blue-600',
    bestTimes: [
      { day: 'Tuesday', time: '8:00 AM', score: 9.3, label: 'Pre-work professionals' },
      { day: 'Wednesday', time: '12:00 PM', score: 8.9, label: 'Lunch break networking' },
      { day: 'Thursday', time: '9:00 AM', score: 8.5, label: 'Active business hours' },
    ],
    description: 'Professional audiences engage most during early work hours on weekdays.',
  },
];

const getDayName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
};

const formatHour = (hour: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
};

export function BestTimesPanel({ onClose, onScheduleAtTime }: BestTimesPanelProps) {
  const { user } = useAuth();
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(true);
  const [expandedPlatforms, setExpandedPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [loading, setLoading] = useState(false);
  const [intelligence, setIntelligence] = useState<{
    hasHistoricalData: boolean;
    dataPoints: number;
    optimalSlots: Array<{ dayOfWeek: number; hour: number; engagementRate: number; confidence: string }>;
    suggestions: Array<{ type: string; priority: string; reason: string; benefit?: string }>;
    heatMap: number[][];
    postingPattern: { upcomingPosts: number; frequency: string; gaps: number; recommendation: string };
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadIntelligence();
    }
  }, [user, platformFilter]);

  const loadIntelligence = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('scheduler-intelligence', {
        body: { 
          userId: user.id, 
          platform: platformFilter === 'all' ? 'all' : platformFilter 
        }
      });
      if (error) throw error;
      setIntelligence(data);
    } catch (error) {
      console.error('Failed to load intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlatformExpanded = (platform: string) => {
    setExpandedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'bg-primary';
    if (score >= 6) return 'bg-primary/70';
    if (score >= 4) return 'bg-primary/40';
    if (score >= 2) return 'bg-muted-foreground/30';
    return 'bg-muted';
  };

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  const filteredPlatforms = platformFilter === 'all'
    ? staticPlatformBestTimes
    : staticPlatformBestTimes.filter(p => p.platform === platformFilter);

  const handleHeatMapTimeSelect = (time: string) => {
    const date = new Date(time);
    const dayName = getDayName(date.getDay());
    const timeStr = formatHour(date.getHours());
    onScheduleAtTime(platformFilter === 'all' ? 'facebook' : platformFilter, dayName, timeStr);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-card border-l border-border shadow-xl z-50 animate-slide-in-right overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-card/95 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Best Times to Post
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {intelligence?.hasHistoricalData 
              ? `Based on ${intelligence.dataPoints} of your posts` 
              : 'Industry benchmarks & optimal timing'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Analyzing your best times...</span>
          </div>
        )}

        {/* Personalized Data Banner */}
        {intelligence?.hasHistoricalData && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Personalized Insights Available</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your optimal times are calculated from your actual post performance data.
            </p>
          </div>
        )}

        {/* Platform Filter */}
        <div>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auto-Schedule Toggle */}
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Auto-schedule at best times</p>
              <p className="text-xs text-muted-foreground">Automatically schedule posts at optimal times</p>
            </div>
          </div>
          <Switch
            checked={autoScheduleEnabled}
            onCheckedChange={setAutoScheduleEnabled}
          />
        </div>

        {/* Personalized Optimal Slots */}
        {intelligence?.optimalSlots && intelligence.optimalSlots.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Your Top Posting Times
            </h3>
            <div className="space-y-2">
              {intelligence.optimalSlots.slice(0, 5).map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 cursor-pointer transition-colors"
                  onClick={() => onScheduleAtTime(
                    platformFilter === 'all' ? 'facebook' : platformFilter,
                    getDayName(slot.dayOfWeek),
                    formatHour(slot.hour)
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getMedalIcon(idx)}</span>
                    <div>
                      <p className="font-medium text-foreground">
                        {getDayName(slot.dayOfWeek)}, {formatHour(slot.hour)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Avg engagement: {slot.engagementRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      slot.confidence === 'high' ? 'bg-green-900/30 text-green-400' :
                      slot.confidence === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {slot.confidence}
                    </span>
                    <Button size="sm" variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform Best Times (static fallback) */}
        {!loading && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {intelligence?.hasHistoricalData ? 'Industry Benchmarks' : 'Recommended Times by Platform'}
            </h3>

            {filteredPlatforms.map(platform => (
              <Collapsible
                key={platform.platform}
                open={expandedPlatforms.includes(platform.platform)}
                onOpenChange={() => togglePlatformExpanded(platform.platform)}
              >
                <div className="bg-muted/50 rounded-lg border border-border overflow-hidden">
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={platform.color}>{platform.icon}</span>
                      <span className="font-medium text-foreground capitalize">{platform.platform}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {platform.bestTimes.length} best times
                      </span>
                    </div>
                    {expandedPlatforms.includes(platform.platform) ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="p-4 pt-0 space-y-3">
                      {platform.bestTimes.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getMedalIcon(index)}</span>
                            <div>
                              <p className="font-medium text-foreground">
                                {slot.day}, {slot.time}
                              </p>
                              <p className="text-xs text-muted-foreground">{slot.label}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-primary">{slot.score}/10</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onScheduleAtTime(platform.platform, slot.day, slot.time)}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Schedule
                            </Button>
                          </div>
                        </div>
                      ))}

                      <p className="text-xs text-muted-foreground italic pt-2 border-t border-border">
                        💡 {platform.description}
                      </p>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}

        {/* Engagement Heat Map */}
        {intelligence?.heatMap && (
          <ScheduleHeatMap 
            heatMapData={intelligence.heatMap} 
            onSelectTime={handleHeatMapTimeSelect}
          />
        )}

        {/* Posting Pattern Insights */}
        {intelligence?.postingPattern && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Your Posting Pattern
            </h3>

            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                <span className="text-lg">📅</span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {intelligence.postingPattern.upcomingPosts} posts scheduled
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Posting frequency: {intelligence.postingPattern.frequency} posts/day
                  </p>
                </div>
              </div>

              {intelligence.postingPattern.gaps > 0 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {intelligence.postingPattern.gaps} gap(s) in your schedule
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Consider filling these gaps to maintain engagement
                    </p>
                  </div>
                </div>
              )}

              {intelligence.postingPattern.recommendation === 'increase' && (
                <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-lg">📈</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Consider posting more frequently
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aim for 1-2 posts per day for optimal engagement
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {intelligence?.suggestions && intelligence.suggestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Smart Suggestions
            </h3>

            <div className="space-y-3">
              {intelligence.suggestions.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border ${
                    suggestion.priority === 'high' ? 'bg-red-500/10 border-red-500/20' :
                    suggestion.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{suggestion.reason}</p>
                  {suggestion.benefit && (
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.benefit}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-card/95 backdrop-blur-sm">
        <Button className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
