import { useState, useEffect } from 'react';
import { Clock, TrendingUp, AlertCircle, Lightbulb, Calendar, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SchedulerSuggestionsProps {
  userId: string;
  platform: string;
  selectedTime?: string;
  onSelectTime: (time: string) => void;
}

interface Suggestion {
  type: string;
  priority: string;
  reason: string;
  recommendation?: string;
  benefit?: string;
  expectedBoost?: string;
  suggestedTime?: string;
  currentFrequency?: string;
  recommendedFrequency?: string;
}

interface OptimalSlot {
  dayOfWeek: number;
  hour: number;
  engagementRate: number;
  confidence: string;
}

interface NextOptimalSlot {
  time: string;
  dayOfWeek: number;
  hour: number;
  expectedEngagement: number;
  reason: string;
}

interface Intelligence {
  hasHistoricalData: boolean;
  dataPoints: number;
  optimalSlots: OptimalSlot[];
  suggestions: Suggestion[];
  nextOptimalSlot?: NextOptimalSlot;
  heatMap: number[][];
}

export function SchedulerSuggestions({ userId, platform, selectedTime, onSelectTime }: SchedulerSuggestionsProps) {
  const [intelligence, setIntelligence] = useState<Intelligence | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (userId) {
      loadIntelligence();
    }
  }, [userId, platform, selectedTime]);
  
  const loadIntelligence = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('scheduler-intelligence', {
        body: { userId, platform, selectedTime }
      });
      if (error) throw error;
      setIntelligence(data);
    } catch (error) {
      console.error('Failed to load intelligence:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Analyzing optimal times...</span>
        </div>
      </div>
    );
  }
  
  if (!intelligence) return null;
  
  return (
    <div className="space-y-4">
      {intelligence.hasHistoricalData && (
        <div className="bg-card rounded-lg p-4 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-foreground font-semibold">Personalized Insights</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {intelligence.dataPoints} of your published posts, we've identified your best posting times.
          </p>
        </div>
      )}
      
      {intelligence.suggestions && intelligence.suggestions.length > 0 && (
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h3 className="text-foreground font-semibold">Smart Suggestions</h3>
          </div>
          <div className="space-y-3">
            {intelligence.suggestions.map((suggestion, idx) => (
              <div 
                key={idx} 
                className={`bg-muted/50 rounded-lg p-3 border-l-4 ${getPriorityColor(suggestion.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">{suggestion.reason}</p>
                    {suggestion.type === 'optimize_time' && suggestion.suggestedTime && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-2">{suggestion.recommendation || suggestion.benefit}</p>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => onSelectTime(suggestion.suggestedTime!)} 
                            className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors"
                          >
                            Use Optimal Time
                          </button>
                          <span className="text-xs text-green-400 font-medium">{suggestion.expectedBoost}</span>
                        </div>
                      </div>
                    )}
                    {suggestion.type === 'fill_gap' && (
                      <p className="text-xs text-muted-foreground mt-1">{suggestion.benefit}</p>
                    )}
                    {suggestion.type === 'increase_frequency' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Current: {suggestion.currentFrequency} posts/day → Recommended: {suggestion.recommendedFrequency} posts/day
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {intelligence.optimalSlots && intelligence.optimalSlots.length > 0 && (
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-foreground font-semibold">Top 5 Best Times</h3>
          </div>
          <div className="space-y-2">
            {intelligence.optimalSlots.map((slot, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted/70 cursor-pointer transition-colors"
                onClick={() => {
                  const now = new Date();
                  const targetDate = new Date(now);
                  const daysToAdd = (slot.dayOfWeek - now.getDay() + 7) % 7 || 7;
                  targetDate.setDate(now.getDate() + daysToAdd);
                  targetDate.setHours(slot.hour, 0, 0, 0);
                  onSelectTime(targetDate.toISOString());
                }}
              >
                <div>
                  <p className="text-sm text-foreground font-medium">{getDayName(slot.dayOfWeek)} at {formatHour(slot.hour)}</p>
                  <p className="text-xs text-muted-foreground">Avg engagement: {slot.engagementRate.toFixed(1)}%</p>
                </div>
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(slot.confidence)}`}>
                    {slot.confidence}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {intelligence.nextOptimalSlot && (
        <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-foreground font-semibold">Next Available Optimal Slot</h3>
          </div>
          <p className="text-foreground font-medium mb-3">
            {new Date(intelligence.nextOptimalSlot.time).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
          <button 
            onClick={() => onSelectTime(intelligence.nextOptimalSlot!.time)} 
            className="w-full py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium"
          >
            Schedule at Optimal Time
          </button>
        </div>
      )}
    </div>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'border-red-500';
    case 'medium': return 'border-yellow-500';
    case 'low': return 'border-blue-500';
    default: return 'border-border';
  }
}

function getConfidenceColor(confidence: string) {
  switch (confidence) {
    case 'high': return 'bg-green-900/30 text-green-400';
    case 'medium': return 'bg-yellow-900/30 text-yellow-400';
    case 'low': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

function getDayName(day: number) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
}

function formatHour(hour: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}
