import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduleSlot {
  position: number;
  time: string;
  dayOfWeek: string;
  timeOfDay: string;
  expectedEngagement: number;
  confidence: string;
}

interface ScheduleData {
  schedule: ScheduleSlot[];
  summary: {
    totalSlots: number;
    targetPosts: number;
    avgEngagement: number;
  };
}

export function WeeklySchedulePreview() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      generateSchedule();
    }
  }, [user]);
  
  const generateSchedule = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-optimize-timing', {
        body: { userId: user.id, action: 'generate_weekly_schedule' }
      });
      if (error) throw error;
      setSchedule(data);
    } catch (error) {
      console.error('Failed to generate schedule:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!schedule) return null;
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Suggested Weekly Schedule</h3>
        </div>
        <button
          onClick={generateSchedule}
          disabled={loading}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>
      
      {schedule.summary && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{schedule.summary.totalSlots}</p>
            <p className="text-xs text-muted-foreground">Time Slots</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{schedule.summary.avgEngagement?.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Avg Engagement</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{schedule.summary.targetPosts}</p>
            <p className="text-xs text-muted-foreground">Posts/Week</p>
          </div>
        </div>
      )}
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {schedule.schedule?.map((slot, idx) => (
          <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                  {slot.position}
                </div>
                <div>
                  <p className="font-medium text-foreground">{slot.dayOfWeek}</p>
                  <p className="text-sm text-muted-foreground">{slot.timeOfDay}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  {slot.expectedEngagement?.toFixed(1)}%
                </p>
                <span className={`text-xs px-2 py-0.5 rounded ${getConfidenceColor(slot.confidence)}`}>
                  {slot.confidence}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
