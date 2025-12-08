import { useState } from 'react';
import { X, Lightbulb, ChevronDown, ChevronUp, Clock, TrendingUp, Zap, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

// Mock best times data
const platformBestTimesData: PlatformBestTimes[] = [
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

// Heat map data (hours x days)
const generateHeatMapData = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return hours.map(hour => ({
    hour,
    scores: days.map(day => {
      // Generate realistic engagement patterns
      let base = 0;
      
      // Weekdays have higher base engagement during work hours
      if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day)) {
        if (hour >= 9 && hour <= 17) base = 5;
        if (hour >= 12 && hour <= 14) base = 7; // Lunch peak
        if (hour >= 14 && hour <= 16) base = 8; // Afternoon peak
      }
      
      // Evenings have good engagement
      if (hour >= 18 && hour <= 21) base = 6;
      
      // Weekend mornings
      if (['Sat', 'Sun'].includes(day) && hour >= 10 && hour <= 14) base = 5;
      
      // Night time is low
      if (hour >= 22 || hour <= 6) base = 1;
      
      // Add some randomness
      return Math.min(10, Math.max(0, base + Math.random() * 2 - 1));
    }),
  }));
};

const heatMapData = generateHeatMapData();

export function BestTimesPanel({ onClose, onScheduleAtTime }: BestTimesPanelProps) {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(true);
  const [expandedPlatforms, setExpandedPlatforms] = useState<string[]>(['facebook', 'instagram']);

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

  const getScoreLabel = (score: number): string => {
    if (score >= 8) return 'Peak';
    if (score >= 6) return 'High';
    if (score >= 4) return 'Moderate';
    return 'Low';
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
    ? platformBestTimesData
    : platformBestTimesData.filter(p => p.platform === platformFilter);

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
            Maximize engagement with optimal timing
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
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

        {/* Platform Best Times */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Recommended Times by Platform
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

        {/* Engagement Heat Map */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Engagement Heat Map
          </h3>

          <div className="bg-muted/50 rounded-lg border border-border p-4 overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Day headers */}
              <div className="flex gap-1 mb-2 pl-12">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="w-8 text-center text-xs text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Heat map grid - show only key hours */}
              {[6, 8, 10, 12, 14, 16, 18, 20, 22].map(hour => {
                const hourData = heatMapData.find(h => h.hour === hour);
                if (!hourData) return null;

                return (
                  <div key={hour} className="flex items-center gap-1 mb-1">
                    <div className="w-10 text-xs text-muted-foreground text-right pr-2">
                      {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`}
                    </div>
                    {hourData.scores.map((score, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-8 h-6 rounded-sm cursor-pointer transition-all hover:scale-110 ${getScoreColor(score)}`}
                        title={`${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex]} ${hour}:00 - ${getScoreLabel(score)} engagement (${score.toFixed(1)}/10)`}
                        onClick={() => {
                          const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
                          const timeStr = hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
                          onScheduleAtTime('facebook', dayName, timeStr);
                        }}
                      />
                    ))}
                  </div>
                );
              })}

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">Engagement:</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-sm bg-muted" />
                    <span className="text-xs text-muted-foreground">Low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-sm bg-primary/40" />
                    <span className="text-xs text-muted-foreground">Moderate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-sm bg-primary/70" />
                    <span className="text-xs text-muted-foreground">High</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-sm bg-primary" />
                    <span className="text-xs text-muted-foreground">Peak</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audience Insights */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Audience Insights
          </h3>

          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
              <span className="text-lg">📈</span>
              <div>
                <p className="text-sm font-medium text-foreground">Peak activity: 2-4 PM on weekdays</p>
                <p className="text-xs text-muted-foreground">Your audience is most engaged during afternoon hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
              <span className="text-lg">🌙</span>
              <div>
                <p className="text-sm font-medium text-foreground">Low activity: After 10 PM</p>
                <p className="text-xs text-muted-foreground">Avoid scheduling during late night hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-sm font-medium text-foreground">Most active days: Wed, Thu, Fri</p>
                <p className="text-xs text-muted-foreground">Midweek to end of week shows highest engagement</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
              <span className="text-lg">🔄</span>
              <div>
                <p className="text-sm font-medium text-foreground">Optimal posting frequency: 1-2 posts/day</p>
                <p className="text-xs text-muted-foreground">Space posts 4-6 hours apart for best results</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Personalized Recommendations
          </h3>

          <div className="space-y-3">
            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📊</span>
                <p className="text-sm font-medium text-foreground">Post Frequency</p>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Current: 5 posts/week → Recommended: 7-10 posts/week
              </p>
              <p className="text-xs text-emerald-400">Increase visibility and engagement by posting more consistently</p>
            </div>

            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⏰</span>
                <p className="text-sm font-medium text-foreground">Time Distribution</p>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Current: All posts in afternoon → Mix morning and evening
              </p>
              <p className="text-xs text-amber-400">Reach different audience segments throughout the day</p>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📱</span>
                <p className="text-sm font-medium text-foreground">Platform Balance</p>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Current: 80% on Facebook → Diversify across platforms
              </p>
              <p className="text-xs text-primary">Instagram and LinkedIn show strong growth potential</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4 bg-card/95 backdrop-blur-sm">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1" onClick={() => onScheduleAtTime('facebook', 'Tuesday', '2:00 PM')}>
            <Zap className="w-4 h-4 mr-2" />
            Schedule at Best Time
          </Button>
        </div>
      </div>
    </div>
  );
}
